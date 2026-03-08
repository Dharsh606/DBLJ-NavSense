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
import android.view.animation.AlphaAnimation
import android.view.animation.ScaleAnimation
import android.view.animation.Animation
import android.view.animation.DecelerateInterpolator
import java.util.*

class NavigationActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private var isNavigating = false
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Create navigation layout with enhanced gradient background
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(40, 50, 40, 50)
            
            // Enhanced gradient background
            val gradient = GradientDrawable().apply {
                orientation = GradientDrawable.Orientation.TOP_BOTTOM
                colors = intArrayOf(
                    Color.parseColor("#1E3A8A"), // Deep blue
                    Color.parseColor("#1E40AF"), // Medium blue
                    Color.parseColor("#3B82F6")  // Bright blue
                )
                gradientType = GradientDrawable.LINEAR_GRADIENT
            }
            background = gradient
        }
        
        // Enhanced Title with card background
        val titleCard = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(25, 20, 25, 20)
            
            // Card background for title
            val cardGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 20f
                setStroke(2, Color.parseColor("#3B82F6"))
                alpha = 200 // Semi-transparent
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
            text = "🧭 Navigation Mode"
            textSize = 28f
            setTextColor(Color.parseColor("#1E3A8A")) // Deep blue text
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 8)
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        
        // Enhanced Status Display with card-like background
        val statusText = TextView(this).apply {
            text = "Ready to start navigation"
            textSize = 20f
            setTextColor(Color.parseColor("#1E3A8A")) // Deep blue text
            gravity = Gravity.CENTER
            setPadding(25, 20, 25, 20)
            id = 1001
            
            // Create card background
            val cardGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#3B82F6")) // Modern blue
            }
            background = cardGradient
        }
        
        // Current Location with enhanced styling
        val locationText = TextView(this).apply {
            text = "📍 Current Location: Detecting..."
            textSize = 16f
            setTextColor(Color.parseColor("#FFFFFF")) // White text
            gravity = Gravity.CENTER
            setPadding(20, 15, 20, 15)
            setShadowLayer(4f, 1f, 1f, Color.BLACK)
        }
        
        // Next Instruction with enhanced styling
        val instructionText = TextView(this).apply {
            text = "🎯 Next Instruction: Waiting for destination"
            textSize = 16f
            setTextColor(Color.parseColor("#FEF3C7")) // Light yellow text
            gravity = Gravity.CENTER
            setPadding(20, 15, 20, 15)
            setShadowLayer(4f, 1f, 1f, Color.BLACK)
        }
        
        // Enhanced Start Navigation Button
        val startButton = createAestheticButton("🚶 Start Navigation", 
            intArrayOf(Color.parseColor("#10B981"), Color.parseColor("#059669"))) {
            toggleNavigation(statusText, locationText, instructionText)
        }
        
        // Enhanced Voice Guidance Button
        val voiceButton = createAestheticButton("🔊 Voice Guidance", 
            intArrayOf(Color.parseColor("#3B82F6"), Color.parseColor("#2563EB"))) {
            speakCurrentInstruction(locationText, instructionText)
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
        layout.addView(locationText)
        layout.addView(instructionText)
        layout.addView(startButton)
        layout.addView(voiceButton)
        layout.addView(backButton)
        
        setContentView(layout)
    }
    
    private fun toggleNavigation(statusText: TextView, locationText: TextView, instructionText: TextView) {
        isNavigating = !isNavigating
        
        if (isNavigating) {
            statusText.text = "🟢 Navigation Active"
            statusText.setTextColor(Color.GREEN)
            simulateNavigation(locationText, instructionText)
            speak("Navigation started. Follow the voice instructions.")
        } else {
            statusText.text = "⏸️ Navigation Paused"
            statusText.setTextColor(Color.parseColor("#FFA500"))
            speak("Navigation paused.")
        }
    }
    
    private fun simulateNavigation(locationText: TextView, instructionText: TextView) {
        if (!isNavigating) return
        
        // Simulate location updates
        val locations = listOf(
            "📍 Current Location: Main Street & 5th Avenue",
            "📍 Current Location: 200m straight ahead",
            "📍 Current Location: Near intersection",
            "📍 Current Location: 50m from destination"
        )
        
        val instructions = listOf(
            "🎯 Next Instruction: Walk straight for 200 meters",
            "🎯 Next Instruction: Turn right at the next corner",
            "🎯 Next Instruction: Cross the street carefully",
            "🎯 Next Instruction: Destination on your left"
        )
        
        var index = 0
        val timer = object : CountDownTimer(5000, 5000) {
            override fun onTick(millisUntilFinished: Long) {}
            
            override fun onFinish() {
                if (isNavigating && index < locations.size) {
                    locationText.text = locations[index]
                    instructionText.text = instructions[index]
                    speak(instructions[index])
                    index++
                    if (index < locations.size) {
                        start()
                    }
                }
            }
        }
        timer.start()
    }
    
    private fun speakCurrentInstruction(locationText: TextView, instructionText: TextView) {
        val message = "${locationText.text}. ${instructionText.text}"
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
    
    // Simple CountDownTimer for navigation simulation
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
