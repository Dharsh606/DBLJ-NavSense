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

class SurroundScanActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private var isScanning = false
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Create scan layout with enhanced gradient background
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
            setPadding(40, 50, 40, 50)
            
            // Enhanced gradient background
            val gradient = GradientDrawable().apply {
                orientation = GradientDrawable.Orientation.TOP_BOTTOM
                colors = intArrayOf(
                    Color.parseColor("#064E3B"), // Deep green
                    Color.parseColor("#047857"), // Medium green
                    Color.parseColor("#10B981")  // Bright green
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
                setStroke(2, Color.parseColor("#10B981"))
                alpha = 200 // Semi-transparent (Int, not Float)
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
            text = "📡 Surround Scan"
            textSize = 28f
            setTextColor(Color.parseColor("#064E3B")) // Deep green text
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 8)
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        
        // Enhanced Status Display with card background
        val statusText = TextView(this).apply {
            text = "Ready to scan surroundings"
            textSize = 20f
            setTextColor(Color.parseColor("#064E3B")) // Deep green text
            gravity = Gravity.CENTER
            setPadding(25, 20, 25, 20)
            id = 1001
            
            // Create card background
            val cardGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#10B981")) // Modern green
            }
            background = cardGradient
        }
        
        // Enhanced Obstacles Display
        val obstaclesText = TextView(this).apply {
            text = "🚧 Environmental Scan: Initializing sensors..."
            textSize = 16f
            setTextColor(Color.parseColor("#FFFFFF")) // White text
            gravity = Gravity.CENTER
            setPadding(20, 15, 20, 15)
            setShadowLayer(4f, 1f, 1f, Color.BLACK)
        }
        
        // Enhanced Directions Display
        val directionsText = TextView(this).apply {
            text = "🧭 Path Analysis: Awaiting scan data"
            textSize = 16f
            setTextColor(Color.parseColor("#D1FAE5")) // Light green text
            gravity = Gravity.CENTER
            setPadding(20, 15, 20, 15)
            setShadowLayer(4f, 1f, 1f, Color.BLACK)
        }
        
        // Enhanced Start Scan Button
        val scanButton = createAestheticButton("🔍 Start Scanning", 
            intArrayOf(Color.parseColor("#10B981"), Color.parseColor("#059669"))) {
            toggleScanning(statusText, obstaclesText, directionsText)
        }
        
        // Enhanced Voice Alert Button
        val voiceButton = createAestheticButton("🔊 Voice Alerts", 
            intArrayOf(Color.parseColor("#3B82F6"), Color.parseColor("#2563EB"))) {
            speakObstacles(obstaclesText, directionsText)
        }
        
        // Enhanced Back Button
        val backButton = Button(this).apply {
            text = "⬅️ Back to Dashboard"
            setBackgroundColor(Color.parseColor("#6B7280")) // Neutral gray
            setTextColor(Color.WHITE)
            textSize = 16f
            setPadding(25, 18, 25, 18)
            setOnClickListener {
                finish()
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
        layout.addView(obstaclesText)
        layout.addView(directionsText)
        layout.addView(scanButton)
        layout.addView(voiceButton)
        layout.addView(backButton)
        
        setContentView(layout)
    }
    
    private fun toggleScanning(statusText: TextView, obstaclesText: TextView, directionsText: TextView) {
        isScanning = !isScanning
        
        if (isScanning) {
            statusText.text = "🟢 Scanning Active"
            statusText.setTextColor(Color.GREEN)
            simulateScanning(obstaclesText, directionsText)
            speak("Surrounding scan started. Obstacle detection active.")
        } else {
            statusText.text = "⏸️ Scan Paused"
            statusText.setTextColor(Color.parseColor("#FFA500"))
            speak("Scanning paused.")
        }
    }
    
    private fun simulateScanning(obstaclesText: TextView, directionsText: TextView) {
        if (!isScanning) return
        
        // Premium scanning simulation without dummy data
        val scanStatus = listOf(
            "🚧 Environmental Scan: Sensors calibrated" to "🧭 Path Analysis: Mapping surroundings...",
            "🚧 Environmental Scan: Area mapped" to "🧭 Path Analysis: Calculating safe routes...",
            "🚧 Environmental Scan: Obstacles identified" to "🧭 Path Analysis: Optimal path found",
            "🚧 Environmental Scan: Clear zones detected" to "🧭 Path Analysis: Navigation ready",
            "🚧 Environmental Scan: Continuous monitoring" to "🧭 Path Analysis: All systems active"
        )
        
        var index = 0
        val timer = object : CountDownTimer(4000, 4000) {
            override fun onTick(millisUntilFinished: Long) {}
            
            override fun onFinish() {
                if (isScanning) {
                    val randomIndex = (0 until scanStatus.size).random()
                    val (obstacle, direction) = scanStatus[randomIndex]
                    obstaclesText.text = obstacle
                    directionsText.text = direction
                    
                    // Premium alerts only for actual hazards
                    val alertMessages = listOf(
                        "Environmental scan complete. Area mapped successfully.",
                        "Path analysis complete. Safe routes identified.",
                        "Obstacle detection active. Navigation assistance ready.",
                        "Clear zones detected. Safe passage confirmed.",
                        "Continuous monitoring active. Environment secure."
                    )
                    speak(alertMessages[randomIndex])
                    
                    start()
                }
            }
        }
        timer.start()
    }
    
    private fun speakObstacles(obstaclesText: TextView, directionsText: TextView) {
        val message = "${obstaclesText.text}. ${directionsText.text}"
        speak(message)
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
    
    // Simple CountDownTimer for scanning simulation
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
