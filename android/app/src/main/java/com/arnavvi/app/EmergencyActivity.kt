package com.arnavvi.app

import android.app.Activity
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
import java.util.*

class EmergencyActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private var emergencyActive = false
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Create emergency layout with enhanced gradient background
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
            setPadding(40, 50, 40, 50)
            
            // Enhanced gradient background
            val gradient = GradientDrawable().apply {
                orientation = GradientDrawable.Orientation.TOP_BOTTOM
                colors = intArrayOf(
                    Color.parseColor("#7F1D1D"), // Deep red
                    Color.parseColor("#991B1B"), // Medium red
                    Color.parseColor("#DC2626")  // Bright red
                )
                gradientType = GradientDrawable.LINEAR_GRADIENT
            }
            background = gradient
        }
        
        // Enhanced Title with card background
        val titleCard = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
            setPadding(25, 20, 25, 20)
            
            // Card background for title
            val cardGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 20f
                setStroke(2, Color.parseColor("#DC2626"))
                alpha = 200 // Semi-transparent (this needs to be an Int, not Float)
            }
            background = cardGradient
            
            // Add margin below title card
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 30)
            layoutParams = params
        }
        
        // Title
        val title = TextView(this).apply {
            text = "🚨 Emergency Dashboard"
            textSize = 28f
            setTextColor(Color.parseColor("#7F1D1D")) // Deep red text
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 8)
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        
        // Status Display
        val statusText = TextView(this).apply {
            text = "Emergency System Ready"
            textSize = 18f
            setTextColor(Color.BLUE)
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 30)
            id = 1001
        }
        
        // Emergency Contacts Display
        val contactsText = TextView(this).apply {
            text = "👥 Emergency Contacts:\n• Medical: 911\n• Family: John Doe (555-0123)\n• Caregiver: Jane Smith (555-0456)\n• Support: 1-800-BLIND"
            textSize = 16f
            setTextColor(Color.GRAY)
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 30)
        }
        
        // Location Display
        val locationText = TextView(this).apply {
            text = "📍 Current Location: Main Street & 5th Avenue\nGPS Coordinates: 40.7128°N, 74.0060°W"
            textSize = 16f
            setTextColor(Color.BLUE)
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 30)
        }
        
        // Enhanced SOS Button
        val sosButton = createAestheticButton("🆘 SOS EMERGENCY", 
            intArrayOf(Color.parseColor("#EF4444"), Color.parseColor("#DC2626"))) {
            activateSOS(statusText)
        }
        
        // Enhanced Medical Alert Button
        val medicalButton = createAestheticButton("🏥 Medical Alert", 
            intArrayOf(Color.parseColor("#F97316"), Color.parseColor("#EA580C"))) {
            medicalAlert(statusText)
        }
        
        // Enhanced Location Share Button
        val locationButton = createAestheticButton("📍 Share Location", 
            intArrayOf(Color.parseColor("#3B82F6"), Color.parseColor("#2563EB"))) {
            shareLocation(statusText)
        }
        
        // Enhanced Voice Help Button
        val voiceButton = createAestheticButton("🔊 Voice Help", 
            intArrayOf(Color.parseColor("#10B981"), Color.parseColor("#059669"))) {
            voiceHelp(statusText, contactsText, locationText)
        }
        
        // Enhanced Cancel Emergency Button
        val cancelButton = createAestheticButton("❌ Cancel Emergency", 
            intArrayOf(Color.parseColor("#6B7280"), Color.parseColor("#4B5563"))) {
            cancelEmergency(statusText)
        }
        
        // Enhanced Back Button
        val backButton = Button(this).apply {
            text = "⬅️ Back to Dashboard"
            setBackgroundColor(Color.parseColor("#6B7280")) // Neutral gray
            setTextColor(Color.WHITE)
            textSize = 16f
            setPadding(25, 18, 25, 18)
            setOnClickListener {
                if (!emergencyActive) {
                    finish()
                } else {
                    speak("Cannot exit while emergency is active. Please cancel emergency first.")
                }
            }
            
            // Add rounded corners
            val backGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#6B7280"))
                cornerRadius = 25f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = backGradient
        }
        
        // Add views to layout in correct order
        layout.addView(titleCard)
        layout.addView(statusText)
        layout.addView(contactsText)
        layout.addView(locationText)
        layout.addView(sosButton)
        layout.addView(medicalButton)
        layout.addView(locationButton)
        layout.addView(voiceButton)
        layout.addView(cancelButton)
        layout.addView(backButton)
        
        setContentView(layout)
    }
    
    private fun activateSOS(statusText: TextView) {
        emergencyActive = true
        statusText.text = "🆘 SOS ACTIVATED - HELP IS COMING!"
        statusText.setTextColor(Color.RED)
        
        // Simulate emergency response
        speak("SOS emergency activated! Calling emergency services and notifying contacts. Help is on the way.")
        
        // Simulate emergency countdown
        val timer = object : CountDownTimer(10000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val seconds = millisUntilFinished / 1000
                statusText.text = "🆘 SOS ACTIVE - Help arriving in ${seconds}s"
            }
            
            override fun onFinish() {
                statusText.text = "🚑 Emergency Services Arrived!"
                speak("Emergency services have arrived. Stay calm and follow their instructions.")
            }
        }
        timer.start()
    }
    
    private fun medicalAlert(statusText: TextView) {
        statusText.text = "🏥 Medical Alert Sent"
        statusText.setTextColor(Color.parseColor("#FF5722"))
        
        speak("Medical alert sent to your emergency contacts and medical provider. Help is on the way.")
        
        // Reset after 5 seconds
        val timer = object : CountDownTimer(5000, 5000) {
            override fun onTick(millisUntilFinished: Long) {}
            
            override fun onFinish() {
                statusText.text = "Emergency System Ready"
                statusText.setTextColor(Color.BLUE)
            }
        }
        timer.start()
    }
    
    private fun shareLocation(statusText: TextView) {
        statusText.text = "📍 Location Shared"
        statusText.setTextColor(Color.BLUE)
        
        speak("Your current location has been shared with all emergency contacts.")
        
        // Reset after 3 seconds
        val timer = object : CountDownTimer(3000, 3000) {
            override fun onTick(millisUntilFinished: Long) {}
            
            override fun onFinish() {
                statusText.text = "Emergency System Ready"
                statusText.setTextColor(Color.BLUE)
            }
        }
        timer.start()
    }
    
    private fun voiceHelp(statusText: TextView, contactsText: TextView, locationText: TextView) {
        statusText.text = "🔊 Voice Assistance Active"
        statusText.setTextColor(Color.parseColor("#4CAF50"))
        
        val helpMessage = "Emergency assistance available. You can say 'SOS' for emergency, 'medical' for medical help, 'location' to share your location, or 'cancel' to stop assistance."
        speak(helpMessage)
        
        // Reset after 5 seconds
        val timer = object : CountDownTimer(5000, 5000) {
            override fun onTick(millisUntilFinished: Long) {}
            
            override fun onFinish() {
                statusText.text = "Emergency System Ready"
                statusText.setTextColor(Color.BLUE)
            }
        }
        timer.start()
    }
    
    private fun cancelEmergency(statusText: TextView) {
        if (emergencyActive) {
            emergencyActive = false
            statusText.text = "✅ Emergency Cancelled"
            statusText.setTextColor(Color.GREEN)
            speak("Emergency cancelled. You are safe.")
        } else {
            statusText.text = "No active emergency to cancel"
            speak("No active emergency to cancel.")
        }
        
        // Reset after 3 seconds
        val timer = object : CountDownTimer(3000, 3000) {
            override fun onTick(millisUntilFinished: Long) {}
            
            override fun onFinish() {
                statusText.text = "Emergency System Ready"
                statusText.setTextColor(Color.BLUE)
            }
        }
        timer.start()
    }
    
    private fun speak(text: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
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
    
    override fun onBackPressed() {
        if (emergencyActive) {
            speak("Cannot exit while emergency is active. Please cancel emergency first.")
        } else {
            super.onBackPressed()
        }
    }
    
    private fun createAestheticButton(text: String, colors: IntArray, onClick: () -> Unit): Button {
        return Button(this).apply {
            this.text = text
            textSize = 18f
            setTextColor(Color.WHITE)
            setShadowLayer(6f, 2f, 2f, Color.parseColor("#000000"))
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            // Enhanced gradient background
            val gradient = GradientDrawable().apply {
                this.colors = colors
                gradientType = GradientDrawable.LINEAR_GRADIENT
                cornerRadius = 30f
                setStroke(3, Color.parseColor("#FFFFFF"))
            }
            background = gradient
            
            // Enhanced padding
            setPadding(40, 30, 40, 30)
            
            // Button press effect
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
        }.apply {
            // Enhanced margins
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 15, 0, 15)
            layoutParams = params
        }
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
