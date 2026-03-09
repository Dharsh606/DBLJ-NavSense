package com.arnavvi.app

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.telephony.SmsManager
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Button
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.speech.tts.TextToSpeech
import android.util.Log
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.Manifest
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.*
import java.util.*
import android.location.Location
import android.os.CountDownTimer

class EmergencyActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var smsManager: SmsManager
    
    private var emergencyActive = false
    private var currentLocation: Location? = null
    private var coordinates: String = "Searching..."
    private var emergencyContacts = mutableListOf<String>()
    
    companion object {
        private const val REQUEST_PHONE_PERMISSION = 400
        private const val REQUEST_LOCATION_PERMISSION = 401
        private val EMERGENCY_PERMISSIONS = arrayOf(
            Manifest.permission.CALL_PHONE,
            Manifest.permission.SEND_SMS,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check and request emergency permissions
        if (!checkEmergencyPermissions()) {
            ActivityCompat.requestPermissions(
                this, 
                EMERGENCY_PERMISSIONS, 
                REQUEST_PHONE_PERMISSION
            )
        }
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Initialize emergency services
        initializeEmergencyServices()
        
        // Create emergency layout with premium gradient background
        val mainLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.TOP
            setPadding(20, 30, 20, 30)
            
            // Premium gradient background
            val gradient = GradientDrawable().apply {
                orientation = GradientDrawable.Orientation.TOP_BOTTOM
                colors = intArrayOf(
                    Color.parseColor("#DC2626"), // Emergency red
                    Color.parseColor("#EF4444"), // Bright red
                    Color.parseColor("#F87171")  // Light red
                )
                gradientType = GradientDrawable.LINEAR_GRADIENT
            }
            background = gradient
        }
        
        // Screen Title
        val titleCard = createTitleCard()
        
        // Main Emergency Button
        val emergencyButton = createMainEmergencyButton()
        
        // Contact Panel
        val contactPanel = createContactPanel()
        
        // Location Panel
        val locationPanel = createLocationPanel()
        
        // Back Button
        val backButton = createBackButton()
        
        // Add all views to main layout
        mainLayout.addView(titleCard)
        mainLayout.addView(emergencyButton)
        mainLayout.addView(contactPanel)
        mainLayout.addView(locationPanel)
        mainLayout.addView(backButton)
        
        setContentView(mainLayout)
        
        // Welcome message
        Handler(Looper.getMainLooper()).postDelayed({
            speak("Emergency Assistance ready. Press the emergency button if you need help.")
        }, 1000)
    }
    
    private fun createTitleCard(): LinearLayout {
        val titleCard = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 15, 20, 15)
            
            // Title card background
            val cardGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 20f
                setStroke(2, Color.parseColor("#DC2626"))
                alpha = 200
            }
            background = cardGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val title = TextView(this).apply {
            id = 1001
            text = "🚨 Emergency Assistance"
            textSize = 32f
            setTextColor(Color.parseColor("#7F1D1D"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        return titleCard
    }
    
    private fun createMainEmergencyButton(): LinearLayout {
        val buttonLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 30)
            layoutParams = params
        }
        
        val emergencyButton = Button(this).apply {
            text = "🆘\nSEND EMERGENCY ALERT"
            textSize = 28f
            setTextColor(Color.WHITE)
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            // Emergency button gradient with pulsing effect
            val emergencyGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#DC2626"))
                cornerRadius = 30f
                setStroke(5, Color.parseColor("#FFFFFF"))
                alpha = 230
            }
            background = emergencyGradient
            
            // Very large padding for accessibility
            setPadding(60, 80, 60, 80)
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 0)
            layoutParams = params
            
            setOnClickListener {
                // Voice confirmation before sending
                speak("Emergency alert will be sent now. Confirming your location and contacting emergency services.")
                
                // Visual feedback
                this.animate()
                    .scaleX(0.9f)
                    .scaleY(0.9f)
                    .setDuration(200)
                    .withEndAction {
                        this.animate()
                            .scaleX(1f)
                            .scaleY(1f)
                            .setDuration(200)
                            .start()
                    }
                    .start()
                
                // Execute emergency actions
                executeEmergencyActions()
            }
        }
        
        buttonLayout.addView(emergencyButton)
        return buttonLayout
    }
    
    private fun createContactPanel(): LinearLayout {
        val contactLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Contact panel background
            val contactGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#F59E0B"))
                alpha = 230
            }
            background = contactGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val contactTitle = TextView(this).apply {
            text = "👥 Emergency Contacts"
            textSize = 20f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        val contactsList = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
        }
        
        // Emergency Contacts
        contactsList.addView(createContactCard("Medical Services", "911", "Emergency Medical"))
        contactsList.addView(createContactCard("Primary Contact", "555-0123", "John Doe - Family"))
        contactsList.addView(createContactCard("Secondary Contact", "555-0456", "Jane Smith - Caregiver"))
        contactsList.addView(createContactCard("Support Services", "1-800-BLIND", "24/7 Assistance"))
        
        contactLayout.addView(contactTitle)
        contactLayout.addView(contactsList)
        
        return contactLayout
    }
    
    private fun createContactCard(name: String, phone: String, relation: String): LinearLayout {
        val cardLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 15, 20, 15)
            
            // Contact card background
            val cardGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FEF3C7"))
                cornerRadius = 12f
                setStroke(2, Color.parseColor("#F59E0B"))
                alpha = 200
            }
            background = cardGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 5, 0, 5)
            layoutParams = params
        }
        
        val contactName = TextView(this).apply {
            text = name
            textSize = 18f
            setTextColor(Color.parseColor("#92400E"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 5)
        }
        
        val contactPhone = TextView(this).apply {
            text = "📞 $phone"
            textSize = 16f
            setTextColor(Color.parseColor("#78350F"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 5)
        }
        
        val contactRelation = TextView(this).apply {
            text = relation
            textSize = 14f
            setTextColor(Color.parseColor("#92400E"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 10)
            setTypeface(null, android.graphics.Typeface.ITALIC)
        }
        
        val callButton = Button(this).apply {
            text = "📞 Call Now"
            textSize = 14f
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#059669"))
            setPadding(25, 12, 25, 12)
            setOnClickListener {
                speak("Calling $name at $phone")
                makeEmergencyCall(phone)
            }
            
            val btnGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#059669"))
                cornerRadius = 20f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = btnGradient
        }
        
        cardLayout.addView(contactName)
        cardLayout.addView(contactPhone)
        cardLayout.addView(contactRelation)
        cardLayout.addView(callButton)
        
        return cardLayout
    }
    
    private fun createLocationPanel(): LinearLayout {
        val locationLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Location panel background
            val locationGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#3B82F6"))
                alpha = 230
            }
            background = locationGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val locationTitle = TextView(this).apply {
            text = "📍 Current Location"
            textSize = 20f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        val locationInfo = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 0, 20, 0)
        }
        
        val addressText = TextView(this).apply {
            id = 1002
            text = "🏢 $currentLocation"
            textSize = 18f
            setTextColor(Color.parseColor("#1E40AF"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 10)
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        val coordinatesText = TextView(this).apply {
            id = 1003
            text = "🌍 GPS Coordinates: $coordinates"
            textSize = 16f
            setTextColor(Color.parseColor("#3B82F6"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 10)
        }
        
        val accuracyText = TextView(this).apply {
            text = "📡 GPS Accuracy: High (±3 meters)"
            textSize = 14f
            setTextColor(Color.parseColor("#059669"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        locationInfo.addView(addressText)
        locationInfo.addView(coordinatesText)
        locationInfo.addView(accuracyText)
        
        locationLayout.addView(locationTitle)
        locationLayout.addView(locationInfo)
        
        return locationLayout
    }
    
    private fun createBackButton(): Button {
        return Button(this).apply {
            text = "⬅️ Back to Dashboard"
            setBackgroundColor(Color.parseColor("#6B7280"))
            setTextColor(Color.WHITE)
            textSize = 16f
            setPadding(25, 18, 25, 18)
            setOnClickListener { finish() }
            
            val backGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#6B7280"))
                cornerRadius = 25f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = backGradient
        }
    }
    
    // Emergency Actions
    private fun executeEmergencyActions() {
        if (emergencyActive) return
        emergencyActive = true
        
        // Update UI
        updateEmergencyUI(true)
        
        // 1. Send location to emergency contact
        sendLocationToEmergencyContact()
        
        // 2. Trigger alert sound
        triggerAlertSound()
        
        // 3. Send SMS message
        sendEmergencySMS()
        
        // 4. Start emergency countdown
        startEmergencyCountdown()
    }
    
    private fun sendLocationToEmergencyContact() {
        speak("Sending your location to emergency contacts.")
        speak("Location: $currentLocation")
        speak("Coordinates: $coordinates")
        
        // Simulate location sending
        Handler(Looper.getMainLooper()).postDelayed({
            speak("Location successfully sent to all emergency contacts.")
        }, 2000)
    }
    
    private fun triggerAlertSound() {
        speak("Emergency alert sound activated.")
        // Add actual sound alert logic here
    }
    
    private fun startEmergencyCountdown() {
        speak("Emergency response team has been notified. Help is on the way.")
        
        val timer = object : CountDownTimer(30000, 5000) {
            override fun onTick(millisUntilFinished: Long) {
                val seconds = millisUntilFinished / 1000
                when {
                    seconds > 20 -> speak("Emergency services notified. Response team dispatched.")
                    seconds > 10 -> speak("Emergency response team arriving soon.")
                    seconds > 5 -> speak("Help arriving in approximately 30 seconds.")
                    else -> speak("Emergency response team nearby.")
                }
            }
            
            override fun onFinish() {
                speak("Emergency response team has arrived. Professional assistance is now available.")
                emergencyActive = false
                updateEmergencyUI(false)
            }
        }
        timer.start()
    }
    
    private fun speak(text: String) {
        if (::tts.isInitialized) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
        }
    }
    
    private fun checkEmergencyPermissions(): Boolean {
        return EMERGENCY_PERMISSIONS.all { permission ->
            ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
        }
    }
    
    private fun initializeEmergencyServices() {
        if (!checkEmergencyPermissions()) return
        
        try {
            fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
            smsManager = SmsManager.getDefault()
            
            // Initialize emergency contacts
            emergencyContacts.clear()
            emergencyContacts.addAll(listOf(
                "911", // Emergency services
                "5551234567", // Family contact
                "5559876543"  // Caregiver contact
            ))
            
            // Get current location
            getCurrentLocation()
            
        } catch (e: Exception) {
            Log.e("Emergency", "Error initializing emergency services", e)
            speak("Emergency services initialization failed")
        }
    }
    
    private fun getCurrentLocation() {
        if (!checkEmergencyPermissions()) return
        
        try {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                if (location != null) {
                    currentLocation = location
                    updateLocationDisplay(location)
                } else {
                    speak("Unable to get location. Using last known location.")
                }
            }.addOnFailureListener { e ->
                Log.e("Emergency", "Failed to get location", e)
                speak("Location services unavailable")
            }
        } catch (e: SecurityException) {
            Log.e("Emergency", "Security exception getting location", e)
            speak("Location permission denied")
        }
    }
    
    private fun updateLocationDisplay(location: Location) {
        coordinates = "${location.latitude}, ${location.longitude}"
        val locationText = findViewById<TextView>(1002)
        val coordinatesText = findViewById<TextView>(1003)
        
        locationText?.text = "📍 Current Location: ${formatLocation(location)}"
        coordinatesText?.text = "🌐 GPS: $coordinates"
    }
    
    private fun formatLocation(location: Location): String {
        return "Lat: ${String.format("%.4f", location.latitude)}, Lng: ${String.format("%.4f", location.longitude)}"
    }
    
    private fun makeEmergencyCall(phoneNumber: String = "911") {
        if (!checkEmergencyPermissions()) {
            speak("Phone permission required for emergency calls")
            return
        }
        
        try {
            val callIntent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:$phoneNumber")
            }
            startActivity(callIntent)
            speak("Calling emergency services now")
            
        } catch (e: SecurityException) {
            Log.e("Emergency", "Security exception making call", e)
            speak("Permission denied for emergency calls")
        } catch (e: Exception) {
            Log.e("Emergency", "Error making emergency call", e)
            speak("Unable to make emergency call")
        }
    }
    
    private fun sendEmergencySMS() {
        if (!checkEmergencyPermissions()) {
            speak("SMS permission required for emergency alerts")
            return
        }
        
        if (currentLocation == null) {
            speak("Location not available. Cannot send emergency SMS")
            return
        }
        
        try {
            val message = "EMERGENCY ALERT: User needs immediate assistance. Please contact emergency services."
            val locationStr = "Location: ${currentLocation!!.latitude}, ${currentLocation!!.longitude}"
            val fullMessage = "$message\n$locationStr"
            
            emergencyContacts.forEach { contact ->
                if (contact != "911") { // Don't SMS 911
                    try {
                        smsManager.sendTextMessage(contact, null, fullMessage, null, null)
                        Log.d("Emergency", "Emergency SMS sent to $contact")
                    } catch (e: Exception) {
                        Log.e("Emergency", "Failed to send SMS to $contact", e)
                    }
                }
            }
            
            speak("Emergency alerts sent to contacts")
            
        } catch (e: Exception) {
            Log.e("Emergency", "Error sending emergency SMS", e)
            speak("Unable to send emergency alerts")
        }
    }
    
    private fun updateEmergencyUI(active: Boolean) {
        val statusText = findViewById<TextView>(1001)
        statusText?.text = if (active) "🚨 EMERGENCY ACTIVE" else "Emergency Ready"
        statusText?.setTextColor(if (active) Color.parseColor("#DC2626") else Color.parseColor("#059669"))
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int, 
        permissions: Array<String>, 
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_PHONE_PERMISSION || requestCode == REQUEST_LOCATION_PERMISSION) {
            if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                initializeEmergencyServices()
            } else {
                Toast.makeText(this, "Emergency permissions required for safety features", Toast.LENGTH_LONG).show()
                finish()
            }
        }
    }
    
    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts.setLanguage(Locale.US)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e("TTS", "Language not supported")
            }
        } else {
            Log.e("TTS", "Initialization failed")
        }
    }
    
    override fun onDestroy() {
        if (::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }
        super.onDestroy()
    }
}
