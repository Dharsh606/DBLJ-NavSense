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

class HelpActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Create help layout with premium gradient background
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
        
        // Help Sections
        val navigationHelp = createHelpSection(
            "🧭 How to Start Navigation",
            "1. Tap 'Start Navigation' on the main screen\n2. Say your destination or type it\n3. Listen for voice instructions\n4. Follow the guidance step by step",
            "Navigation helps you reach any destination safely with voice guidance and obstacle detection."
        )
        
        val voiceHelp = createHelpSection(
            "🎤 How to Use Voice Commands",
            "1. Tap 'Voice Command Mode'\n2. Say commands like:\n   • 'Navigate to [place]'\n   • 'Where am I?'\n   • 'Stop navigation'\n3. System responds with action",
            "Voice commands let you control the app hands-free for safer navigation."
        )
        
        val arHelp = createHelpSection(
            "📷 How AR Detection Works",
            "1. Tap 'AR Camera Detection'\n2. Point camera forward\n3. App detects obstacles\n4. Listen for voice alerts\n5. Follow safety guidance",
            "AR camera detects obstacles in real-time and provides audio warnings for safer walking."
        )
        
        val bluetoothHelp = createHelpSection(
            "🔗 How to Connect Bluetooth Devices",
            "1. Tap 'Bluetooth Devices'\n2. Turn on Bluetooth toggle\n3. Tap 'Scan for Devices'\n4. Select your device\n5. Tap 'Connect'",
            "Connect your walking cane, sensors, or other assistive devices for enhanced navigation."
        )
        
        // Action Buttons
        val actionButtons = createActionButtons()
        
        // Back Button
        val backButton = createBackButton()
        
        // Add all views to main layout
        mainLayout.addView(titleCard)
        mainLayout.addView(navigationHelp)
        mainLayout.addView(voiceHelp)
        mainLayout.addView(arHelp)
        mainLayout.addView(bluetoothHelp)
        mainLayout.addView(actionButtons)
        mainLayout.addView(backButton)
        
        setContentView(mainLayout)
        
        // Welcome message
        Handler(Looper.getMainLooper()).postDelayed({
            speak("Help and Accessibility Guide opened. Learn how to use all features of DBLJ NavSense.")
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
            text = "📚 Help & Accessibility Guide"
            textSize = 32f
            setTextColor(Color.parseColor("#1E3A8A"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        return titleCard
    }
    
    private fun createHelpSection(title: String, steps: String, description: String): LinearLayout {
        val sectionLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Section background
            val sectionGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#10B981"))
                alpha = 230
            }
            background = sectionGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 15)
            layoutParams = params
        }
        
        val sectionTitle = TextView(this).apply {
            text = title
            textSize = 22f
            setTextColor(Color.parseColor("#1E40AF"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        val stepsContent = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 15)
        }
        
        // Simple illustration (emoji)
        val illustration = TextView(this).apply {
            text = when {
                title.contains("Navigation") -> "🗺️"
                title.contains("Voice") -> "🎤"
                title.contains("AR") -> "📷"
                title.contains("Bluetooth") -> "🔗"
                else -> "ℹ️"
            }
            textSize = 48f
            gravity = Gravity.CENTER
            setPadding(20, 0, 20, 0)
        }
        
        val stepsText = TextView(this).apply {
            text = steps
            textSize = 16f
            setTextColor(Color.parseColor("#374151"))
            gravity = Gravity.START or Gravity.CENTER_VERTICAL
            setPadding(20, 0, 20, 0)
            lineHeight = 24
        }
        
        stepsContent.addView(illustration)
        stepsContent.addView(stepsText)
        
        val descriptionText = TextView(this).apply {
            text = description
            textSize = 14f
            setTextColor(Color.parseColor("#6B7280"))
            gravity = Gravity.CENTER
            setPadding(20, 10, 20, 0)
            setTypeface(null, android.graphics.Typeface.ITALIC)
        }
        
        sectionLayout.addView(sectionTitle)
        sectionLayout.addView(stepsContent)
        sectionLayout.addView(descriptionText)
        
        return sectionLayout
    }
    
    private fun createActionButtons(): LinearLayout {
        val buttonLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val voiceGuideButton = createActionButton("🔊 Play Voice Guide", Color.parseColor("#8B5CF6")) {
            playVoiceGuide()
        }
        
        val supportButton = createActionButton("💬 Contact Support", Color.parseColor("#059669")) {
            contactSupport()
        }
        
        buttonLayout.addView(voiceGuideButton)
        buttonLayout.addView(supportButton)
        
        return buttonLayout
    }
    
    private fun createActionButton(text: String, color: Int, onClick: () -> Unit): Button {
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
            params.setMargins(10, 0, 10, 0)
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
    
    // Action Functions
    private fun playVoiceGuide() {
        val guideMessages = listOf(
            "Welcome to DBLJ NavSense voice guide. This app helps you navigate safely using voice commands and obstacle detection.",
            "To start navigation, say 'Navigate to' followed by your destination, like 'Navigate to coffee shop'.",
            "For voice commands, tap 'Voice Command Mode' and speak clearly. The app will respond to your instructions.",
            "AR camera detection helps you avoid obstacles. Point your camera forward and listen for audio warnings.",
            "Connect your Bluetooth devices for enhanced navigation. Go to Bluetooth Devices and follow the on-screen instructions.",
            "In emergency, tap the emergency button for immediate assistance. Your location will be shared automatically.",
            "Thank you for using DBLJ NavSense. Navigate safely and confidently."
        )
        
        speak("Playing voice guide. Listen carefully to learn all features.")
        
        var index = 0
        val timer = object : CountDownTimer(8000, 8000) {
            override fun onTick(millisUntilFinished: Long) {}
            
            override fun onFinish() {
                if (index < guideMessages.size) {
                    speak(guideMessages[index])
                    index++
                    start()
                } else {
                    speak("Voice guide completed. You can now explore the app with confidence.")
                }
            }
        }
        timer.start()
    }
    
    private fun contactSupport() {
        speak("Opening support contact options. Help is available 24/7.")
        
        // Add actual support contact logic here
        // This could open a support form, dial a support number, or show support options
        
        Handler(Looper.getMainLooper()).postDelayed({
            speak("Support team ready to assist you with any questions or technical issues.")
        }, 2000)
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
