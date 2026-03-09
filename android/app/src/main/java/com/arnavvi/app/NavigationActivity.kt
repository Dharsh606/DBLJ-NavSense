package com.arnavvi.app

import android.app.Activity
import android.content.pm.PackageManager
import android.os.Bundle
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
import android.location.Location
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.*
import com.google.android.gms.maps.model.LatLng
import java.util.*
import kotlin.math.*

class NavigationActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private var currentLocation: Location? = null
    private var destinationLocation: LatLng? = null
    
    private var isNavigating = false
    private var isPaused = false
    private var currentDestination = "Set Destination"
    private var estimatedDistance = "Calculating..."
    private var estimatedTime = "Calculating..."
    private var currentInstruction = "Waiting for GPS signal..."
    
    companion object {
        private const val REQUEST_LOCATION_PERMISSION = 200
        private const val UPDATE_INTERVAL = 2000L // 2 seconds
        private const val FASTEST_UPDATE_INTERVAL = 1000L // 1 second
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check and request location permissions
        if (!checkLocationPermission()) {
            ActivityCompat.requestPermissions(
                this, 
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ), 
                REQUEST_LOCATION_PERMISSION
            )
        }
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Initialize location services
        initializeLocationServices()
        
        // Get destination from intent
        val destination = intent.getStringExtra("destination")
        if (!destination.isNullOrEmpty()) {
            currentDestination = destination
            setDestination(destination)
        }
        
        // Create navigation layout with premium gradient background
        val mainLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.TOP
            setPadding(20, 30, 20, 30)
            
            // Premium gradient background
            val gradient = GradientDrawable().apply {
                orientation = GradientDrawable.Orientation.TOP_BOTTOM
                colors = intArrayOf(
                    Color.parseColor("#1E3A8A"), // Deep blue
                    Color.parseColor("#1E40AF"), // Medium blue
                    Color.parseColor("#2563EB")  // Bright blue
                )
                gradientType = GradientDrawable.LINEAR_GRADIENT
            }
            background = gradient
        }
        
        // Screen Title
        val titleCard = createTitleCard()
        
        // Destination Info Section
        val destinationInfo = createDestinationInfoSection()
        
        // Map Area
        val mapArea = createMapArea()
        
        // Voice Guidance Panel
        val voicePanel = createVoiceGuidancePanel()
        
        // Navigation Controls
        val navControls = createNavigationControls()
        
        // Safety Alert Panel
        val alertPanel = createSafetyAlertPanel()
        alertPanel.visibility = View.GONE
        alertPanel.id = 1006
        
        // Back Button
        val backButton = createBackButton()
        
        // Add all views to main layout
        mainLayout.addView(titleCard)
        mainLayout.addView(destinationInfo)
        mainLayout.addView(mapArea)
        mainLayout.addView(voicePanel)
        mainLayout.addView(navControls)
        mainLayout.addView(alertPanel)
        mainLayout.addView(backButton)
        
        setContentView(mainLayout)
        
        // Start navigation simulation
        startNavigationSimulation()
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
                setStroke(2, Color.parseColor("#2563EB"))
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
            text = "\ud83e\udded Active Navigation"
            textSize = 28f
            setTextColor(Color.parseColor("#1E3A8A"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        return titleCard
    }
    
    private fun createDestinationInfoSection(): LinearLayout {
        val destLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Destination info background
            val destGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#3B82F6"))
                alpha = 230
            }
            background = destGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        // Destination Title
        val destTitle = TextView(this).apply {
            text = "\ud83d\udccd Current Destination"
            textSize = 18f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 10)
        }
        
        // Destination Name
        val destName = TextView(this).apply {
            text = currentDestination
            textSize = 24f
            setTextColor(Color.parseColor("#2563EB"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
            id = 1001
        }
        
        // Distance and Time Row
        val distTimeRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }
        
        val distanceText = TextView(this).apply {
            text = "\ud83d\udccf $estimatedDistance"
            textSize = 16f
            setTextColor(Color.parseColor("#059669"))
            gravity = Gravity.CENTER
            setPadding(20, 0, 20, 0)
            setTypeface(null, android.graphics.Typeface.BOLD)
            id = 1002
        }
        
        val timeText = TextView(this).apply {
            text = "\u23f1\ufe0f $estimatedTime"
            textSize = 16f
            setTextColor(Color.parseColor("#059669"))
            gravity = Gravity.CENTER
            setPadding(20, 0, 20, 0)
            setTypeface(null, android.graphics.Typeface.BOLD)
            id = 1003
        }
        
        distTimeRow.addView(distanceText)
        distTimeRow.addView(timeText)
        
        // Change Destination Button
        val changeButton = Button(this).apply {
            text = "\ud83d\udd04 Change Destination"
            textSize = 14f
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#6B7280"))
            setPadding(25, 12, 25, 12)
            setOnClickListener {
                speak("Opening destination selection")
                // Add destination selection logic here
            }
            
            val btnGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#6B7280"))
                cornerRadius = 20f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = btnGradient
        }
        
        destLayout.addView(destTitle)
        destLayout.addView(destName)
        destLayout.addView(distTimeRow)
        destLayout.addView(changeButton)
        
        return destLayout
    }
    
    private fun createMapArea(): LinearLayout {
        val mapLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Map area background
            val mapGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#F3F4F6"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#D1D5DB"))
                alpha = 230
            }
            background = mapGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                300 // Fixed height for map area
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        // Map Title
        val mapTitle = TextView(this).apply {
            text = "\ud83d\uddfa\ufe0f Navigation Route"
            textSize = 18f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        // Simplified Map Visualization
        val mapVisualization = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Map background
            val mapBg = GradientDrawable().apply {
                setColor(Color.parseColor("#E5E7EB"))
                cornerRadius = 10f
            }
            background = mapBg
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
            )
            layoutParams = params
        }
        
        // Route elements
        val startPoint = createMapPoint("\ud83d\udccd Start", Color.parseColor("#10B981"))
        val routeLine = createRouteLine()
        val currentPoint = createMapPoint("\ud83d\udd35 You", Color.parseColor("#3B82F6"))
        val routeLine2 = createRouteLine()
        val destPoint = createMapPoint("\ud83c\udfaf Destination", Color.parseColor("#EF4444"))
        
        mapVisualization.addView(startPoint)
        mapVisualization.addView(routeLine)
        mapVisualization.addView(currentPoint)
        mapVisualization.addView(routeLine2)
        mapVisualization.addView(destPoint)
        
        mapLayout.addView(mapTitle)
        mapLayout.addView(mapVisualization)
        
        return mapLayout
    }
    
    private fun createMapPoint(label: String, color: Int): LinearLayout {
        val pointLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(10, 5, 10, 5)
        }
        
        val pointIcon = TextView(this).apply {
            text = label.split(" ").first()
            textSize = 20f
            gravity = Gravity.CENTER
            setPadding(10, 0, 10, 0)
        }
        
        val pointLabel = TextView(this).apply {
            text = label.split(" ").drop(1).joinToString(" ")
            textSize = 14f
            setTextColor(color)
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        pointLayout.addView(pointIcon)
        pointLayout.addView(pointLabel)
        
        return pointLayout
    }
    
    private fun createRouteLine(): TextView {
        return TextView(this).apply {
            text = "\u2502"
            textSize = 24f
            setTextColor(Color.parseColor("#6B7280"))
            gravity = Gravity.CENTER
        }
    }
    
    private fun createVoiceGuidancePanel(): LinearLayout {
        val voiceLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Voice panel background
            val voiceGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#10B981"))
                alpha = 230
            }
            background = voiceGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        // Voice Guidance Title
        val voiceTitle = TextView(this).apply {
            text = "\ud83d\udd0a Voice Guidance"
            textSize = 18f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        // Current Instruction
        val instructionText = TextView(this).apply {
            text = currentInstruction
            textSize = 20f
            setTextColor(Color.parseColor("#059669"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 20)
            setTypeface(null, android.graphics.Typeface.BOLD)
            id = 1004
        }
        
        // Voice Control Buttons
        val voiceButtons = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }
        
        val repeatButton = createVoiceButton("\ud83d\udd01 Repeat", Color.parseColor("#3B82F6")) {
            speak(currentInstruction)
        }
        
        val pauseButton = createVoiceButton("\u23f8\ufe0f Pause", Color.parseColor("#F59E0B")) {
            togglePauseNavigation()
        }
        
        val stopButton = createVoiceButton("\u23f9\ufe0f Stop", Color.parseColor("#EF4444")) {
            stopNavigation()
        }
        
        voiceButtons.addView(repeatButton)
        voiceButtons.addView(pauseButton)
        voiceButtons.addView(stopButton)
        
        voiceLayout.addView(voiceTitle)
        voiceLayout.addView(instructionText)
        voiceLayout.addView(voiceButtons)
        
        return voiceLayout
    }
    
    private fun createNavigationControls(): LinearLayout {
        val controlsLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        // Main Navigation Controls Row
        val mainControls = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 15)
        }
        
        val startButton = createNavigationButton("\u25b6\ufe0f Start", Color.parseColor("#10B981")) {
            startNavigation()
        }
        
        val pauseButton = createNavigationButton("\u23f8\ufe0f Pause", Color.parseColor("#F59E0B")) {
            togglePauseNavigation()
        }
        
        val stopButton = createNavigationButton("\u23f9\ufe0f Stop", Color.parseColor("#EF4444")) {
            stopNavigation()
        }
        
        mainControls.addView(startButton)
        mainControls.addView(pauseButton)
        mainControls.addView(stopButton)
        
        // Additional Controls
        val recalcButton = createNavigationButton("\ud83d\udd04 Recalculate Route", Color.parseColor("#8B5CF6")) {
            speak("Recalculating route")
            // Add route recalculation logic here
        }
        
        controlsLayout.addView(mainControls)
        controlsLayout.addView(recalcButton)
        
        return controlsLayout
    }
    
    private fun createSafetyAlertPanel(): LinearLayout {
        val alertLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Alert panel background
            val alertGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FEE2E2"))
                cornerRadius = 15f
                setStroke(3, Color.parseColor("#DC2626"))
                alpha = 230
            }
            background = alertGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val alertTitle = TextView(this).apply {
            text = "\u26a0\ufe0f Safety Alert"
            textSize = 22f
            setTextColor(Color.parseColor("#991B1B"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 10)
        }
        
        val alertMessage = TextView(this).apply {
            text = "Obstacle detected ahead. Proceed with caution."
            textSize = 18f
            setTextColor(Color.parseColor("#7F1D1D"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 15)
            id = 1005
        }
        
        val dismissButton = Button(this).apply {
            text = "\u2705 Acknowledge"
            textSize = 14f
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#DC2626"))
            setPadding(25, 12, 25, 12)
            setOnClickListener {
                alertLayout.visibility = View.GONE
                speak("Alert acknowledged")
            }
            
            val btnGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#DC2626"))
                cornerRadius = 20f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = btnGradient
        }
        
        alertLayout.addView(alertTitle)
        alertLayout.addView(alertMessage)
        alertLayout.addView(dismissButton)
        
        return alertLayout
    }
    
    private fun createVoiceButton(text: String, color: Int, onClick: () -> Unit): Button {
        return Button(this).apply {
            this.text = text
            textSize = 14f
            setTextColor(Color.WHITE)
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            val gradient = GradientDrawable().apply {
                setColor(color)
                cornerRadius = 20f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = gradient
            
            setPadding(20, 12, 20, 12)
            
            val params = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1.0f
            )
            params.setMargins(5, 0, 5, 0)
            layoutParams = params
            
            setOnClickListener { 
                this.animate()
                    .scaleX(0.9f)
                    .scaleY(0.9f)
                    .setDuration(100)
                    .withEndAction {
                        this.animate()
                            .scaleX(1f)
                            .scaleY(1f)
                            .setDuration(100)
                            .start()
                    }
                    .start()
                
                onClick() 
            }
        }
    }
    
    private fun createNavigationButton(text: String, color: Int, onClick: () -> Unit): Button {
        return Button(this).apply {
            this.text = text
            textSize = 16f
            setTextColor(Color.WHITE)
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            val gradient = GradientDrawable().apply {
                setColor(color)
                cornerRadius = 25f
                setStroke(3, Color.parseColor("#FFFFFF"))
            }
            background = gradient
            
            setPadding(30, 20, 30, 20)
            
            val params = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1.0f
            )
            params.setMargins(8, 0, 8, 0)
            layoutParams = params
            
            setOnClickListener { 
                this.animate()
                    .scaleX(0.95f)
                    .scaleY(0.95f)
                    .setDuration(150)
                    .withEndAction {
                        this.animate()
                            .scaleX(1f)
                            .scaleY(1f)
                            .setDuration(150)
                            .start()
                    }
                    .start()
                
                onClick() 
            }
        }
    }
    
    private fun createBackButton(): Button {
        return Button(this).apply {
            text = "\u2b05\ufe0f Back to Dashboard"
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
    
    // Navigation Control Functions
    private fun startNavigation() {
        isNavigating = true
        isPaused = false
        speak("Navigation started. $currentInstruction")
        startNavigationSimulation()
    }
    
    private fun togglePauseNavigation() {
        if (!isNavigating) {
            speak("Please start navigation first")
            return
        }
        
        isPaused = !isPaused
        if (isPaused) {
            speak("Navigation paused")
        } else {
            speak("Navigation resumed")
        }
    }
    
    private fun stopNavigation() {
        isNavigating = false
        isPaused = false
        speak("Navigation stopped")
        finish()
    }
    
    private fun startNavigationSimulation() {
        if (!isNavigating) return
        
        val instructions = listOf(
            "Turn left in 10 meters.",
            "Continue straight for 200 meters.",
            "Turn right at the next intersection.",
            "Your destination is on the left.",
            "You have arrived at your destination."
        )
        
        val distances = listOf("250 meters", "200 meters", "150 meters", "50 meters", "5 meters")
        val times = listOf("3 minutes", "2 minutes", "1 minute", "30 seconds", "Arrived")
        
        var index = 0
        val timer = object : CountDownTimer(8000, 8000) {
            override fun onTick(millisUntilFinished: Long) {}
            
            override fun onFinish() {
                if (isNavigating && !isPaused && index < instructions.size) {
                    // Update instruction
                    val instructionText = findViewById<TextView>(1004)
                    instructionText?.text = instructions[index]
                    currentInstruction = instructions[index]
                    
                    // Update distance and time
                    val distanceText = findViewById<TextView>(1002)
                    val timeText = findViewById<TextView>(1003)
                    distanceText?.text = "\ud83d\udccf ${distances[index]}"
                    timeText?.text = "\u23f1\ufe0f ${times[index]}"
                    
                    // Voice guidance
                    speak(instructions[index])
                    
                    // Show safety alerts occasionally
                    if (index == 1) {
                        showSafetyAlert("Obstacle detected ahead. Proceed with caution.")
                    } else if (index == 3) {
                        showSafetyAlert("Crosswalk detected. Wait for pedestrian signal.")
                    }
                    
                    index++
                    if (index < instructions.size) {
                        start()
                    } else {
                        // Navigation complete
                        Handler(Looper.getMainLooper()).postDelayed({
                            speak("You have arrived at $currentDestination")
                            stopNavigation()
                        }, 2000)
                    }
                } else {
                    start() // Continue if paused
                }
            }
        }
        timer.start()
    }
    
    private fun showSafetyAlert(message: String) {
        val alertPanel = findViewById<LinearLayout>(1006)
        val alertMessage = findViewById<TextView>(1005)
        
        alertMessage?.text = message
        alertPanel?.visibility = View.VISIBLE
        
        // Auto-dismiss after 5 seconds
        Handler(Looper.getMainLooper()).postDelayed({
            alertPanel?.visibility = View.GONE
        }, 5000)
        
        speak("Safety alert: $message")
    }
    
    private fun speak(text: String) {
        if (::tts.isInitialized) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
        }
    }
    
    private fun checkLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this, 
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    private fun initializeLocationServices() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                locationResult.lastLocation?.let { location ->
                    currentLocation = location
                    updateNavigationUI(location)
                }
            }
            
            override fun onLocationAvailability(availability: LocationAvailability) {
                if (!availability.isLocationAvailable) {
                    runOnUiThread {
                        currentInstruction = "GPS signal lost. Searching..."
                        updateUI()
                    }
                }
            }
        }
        
        // Get initial location
        if (checkLocationPermission()) {
            try {
                fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                    if (location != null) {
                        currentLocation = location
                        updateNavigationUI(location)
                    } else {
                        startLocationUpdates()
                    }
                }
            } catch (e: SecurityException) {
                Log.e("Navigation", "Security exception", e)
            }
        }
    }
    
    private fun startLocationUpdates() {
        if (!checkLocationPermission()) return
        
        try {
            val locationRequest = LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY,
                UPDATE_INTERVAL
            ).apply {
                setMinUpdateIntervalMillis(FASTEST_UPDATE_INTERVAL)
            }.build()
            
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
        } catch (e: SecurityException) {
            Log.e("Navigation", "Security exception", e)
        }
    }
    
    private fun stopLocationUpdates() {
        if (::fusedLocationClient.isInitialized) {
            fusedLocationClient.removeLocationUpdates(locationCallback)
        }
    }
    
    private fun updateNavigationUI(location: Location) {
        runOnUiThread {
            currentInstruction = "GPS signal acquired. Ready to navigate."
            
            if (destinationLocation != null && isNavigating) {
                val currentLatLng = LatLng(location.latitude, location.longitude)
                val distance = calculateDistance(currentLatLng, destinationLocation!!)
                estimatedDistance = formatDistance(distance)
                estimatedTime = formatTime(distance)
                
                // Generate navigation instructions
                currentInstruction = generateNavigationInstruction(currentLatLng, destinationLocation!!)
                
                // Voice guidance
                if (distance < 10) {
                    speak("You have arrived at your destination")
                    stopNavigation()
                } else if (distance < 50) {
                    speak("Arriving soon. $currentInstruction")
                } else if (distance % 100 < 20) { // Every 100 meters
                    speak(currentInstruction)
                }
            }
            
            updateUI()
        }
    }
    
    private fun calculateDistance(from: LatLng, to: LatLng): Float {
        val results = FloatArray(1)
        Location.distanceBetween(
            from.latitude, from.longitude,
            to.latitude, to.longitude,
            results
        )
        return results[0]
    }
    
    private fun formatDistance(meters: Float): String {
        return when {
            meters < 1000 -> "${meters.toInt()} meters"
            else -> "${(meters / 1000).toInt()} km"
        }
    }
    
    private fun formatTime(meters: Float): String {
        // Assume average walking speed of 5 km/h
        val minutes = (meters / 5000 * 60).toInt()
        return when {
            minutes < 60 -> "$minutes minutes"
            else -> "${minutes / 60}h ${minutes % 60}min"
        }
    }
    
    private fun generateNavigationInstruction(current: LatLng, destination: LatLng): String {
        val bearing = calculateBearing(current, destination)
        val direction = when {
            bearing >= 337.5 || bearing < 22.5 -> "Continue straight"
            bearing < 67.5 -> "Turn right"
            bearing < 112.5 -> "Turn right"
            bearing < 157.5 -> "Turn right"
            bearing < 202.5 -> "Turn around"
            bearing < 247.5 -> "Turn left"
            bearing < 292.5 -> "Turn left"
            bearing < 337.5 -> "Turn left"
            else -> "Continue straight"
        }
        
        val distance = calculateDistance(current, destination)
        return when {
            distance < 20 -> "Arrival imminent"
            distance < 50 -> "$direction in ${distance.toInt()} meters"
            distance < 200 -> "$direction in ${(distance / 10).toInt() * 10} meters"
            else -> "$direction in ${formatDistance(distance)}"
        }
    }
    
    private fun calculateBearing(from: LatLng, to: LatLng): Double {
        val lat1 = Math.toRadians(from.latitude)
        val lat2 = Math.toRadians(to.latitude)
        val diffLong = Math.toRadians(to.longitude - from.longitude)
        
        val x = sin(diffLong) * cos(lat2)
        val y = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(diffLong)
        
        val initialBearing = Math.toDegrees(atan2(x, y))
        return (initialBearing + 360) % 360
    }
    
    private fun setDestination(destinationName: String) {
        currentDestination = destinationName
        
        // In a real app, you would geocode the destination name to coordinates
        // For now, set a sample destination
        destinationLocation = when (destinationName.lowercase()) {
            "home" -> LatLng(40.7128, -74.0060) // New York
            "work" -> LatLng(40.7589, -73.9851) // Times Square
            "hospital" -> LatLng(40.7614, -73.9776) // Mount Sinai
            "store" -> LatLng(40.7580, -73.9855) // Nearby store
            else -> LatLng(40.7489, -73.9680) // Empire State Building
        }
        
        speak("Destination set to $destinationName")
        updateUI()
    }
    
    private fun startRealNavigation() {
        if (currentLocation == null) {
            speak("Waiting for GPS signal...")
            startLocationUpdates()
            return
        }
        
        if (destinationLocation == null) {
            speak("Please set a destination first")
            return
        }
        
        isNavigating = true
        isPaused = false
        speak("Navigation started to $currentDestination")
        startLocationUpdates()
        updateUI()
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int, 
        permissions: Array<String>, 
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_LOCATION_PERMISSION) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                initializeLocationServices()
            } else {
                Toast.makeText(this, "Location permission required for navigation", Toast.LENGTH_LONG).show()
                finish()
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        stopLocationUpdates()
        if (::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts.setLanguage(Locale.US)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e("TTS", "The Language expressed is not supported!")
            }
        } else {
            Log.e("TTS", "Initialization failed!")
        }
    }

    private fun updateUI() {
        // Update destination name
        findViewById<TextView>(1001)?.text = currentDestination
        // Update distance
        findViewById<TextView>(1002)?.text = "\ud83d\udccf $estimatedDistance"
        // Update time
        findViewById<TextView>(1003)?.text = "\u23f1\ufe0f $estimatedTime"
        // Update instruction
        findViewById<TextView>(1004)?.text = currentInstruction
    }
    
    // Simple CountDownTimer
    open class CountDownTimer(
        private val millisInFuture: Long,
        private val countDownInterval: Long
    ) {
        private var cancelled = false
        
        fun start() {
            cancelled = false
            Thread {
                var remaining = millisInFuture
                while (remaining > 0 && !cancelled) {
                    Thread.sleep(countDownInterval)
                    remaining -= countDownInterval
                    if (remaining <= 0) {
                        Handler(Looper.getMainLooper()).post { onFinish() }
                    }
                }
            }.start()
        }
        
        open fun onTick(millisUntilFinished: Long) {}
        open fun onFinish() {}
        
        fun cancel() {
            cancelled = true
        }
    }
}
