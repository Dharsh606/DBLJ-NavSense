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

class BluetoothActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Create Bluetooth control layout with enhanced gradient background
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
            setPadding(40, 50, 40, 50)
            
            // Enhanced gradient background
            val gradient = android.graphics.drawable.GradientDrawable().apply {
                orientation = android.graphics.drawable.GradientDrawable.Orientation.TOP_BOTTOM
                colors = intArrayOf(
                    Color.parseColor("#7C2D12"), // Deep orange
                    Color.parseColor("#92400E"), // Medium orange
                    Color.parseColor("#EA580C")  // Bright orange
                )
                gradientType = android.graphics.drawable.GradientDrawable.LINEAR_GRADIENT
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
                setStroke(2, Color.parseColor("#EA580C"))
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
            text = "🔗 Bluetooth Devices"
            textSize = 28f
            setTextColor(Color.parseColor("#7C2D12")) // Deep orange text
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 8)
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        
        // Status Display
        val statusText = TextView(this).apply {
            text = "Bluetooth Ready"
            textSize = 18f
            setTextColor(Color.BLUE)
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 30)
        }
        
        // Connected Devices Display
        val devicesText = TextView(this).apply {
            text = "🎧 Connected Devices:\n• Headphones (Audio)\n• Smart Watch (Notifications)\n• GPS Tracker (Location)"
            textSize = 16f
            setTextColor(Color.parseColor("#4CAF50"))
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 30)
        }
        
        // Device Controls
        val controlsText = TextView(this).apply {
            text = "🎮 Device Controls:\n• Volume: High\n• GPS: Active\n• Notifications: On"
            textSize = 16f
            setTextColor(Color.GRAY)
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 30)
        }
        
        // Enhanced Scan for Devices Button
        val scanButton = createAestheticButton("🔍 Scan for Devices", 
            intArrayOf(Color.parseColor("#F59E0B"), Color.parseColor("#D97706"))) {
            scanForDevices(statusText, devicesText)
        }
        
        // Enhanced Volume Control Button
        val volumeButton = createAestheticButton("🔊 Adjust Volume", 
            intArrayOf(Color.parseColor("#3B82F6"), Color.parseColor("#2563EB"))) {
            adjustVolume(controlsText)
        }
        
        // Enhanced GPS Control Button
        val gpsButton = createAestheticButton("📍 GPS Control", 
            intArrayOf(Color.parseColor("#10B981"), Color.parseColor("#059669"))) {
            toggleGPS(controlsText)
        }
        
        // Enhanced Voice Status Button
        val voiceButton = createAestheticButton("🔊 Device Status", 
            intArrayOf(Color.parseColor("#8B5CF6"), Color.parseColor("#7C3AED"))) {
            speakDeviceStatus(devicesText, controlsText)
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
        layout.addView(devicesText)
        layout.addView(controlsText)
        layout.addView(scanButton)
        layout.addView(volumeButton)
        layout.addView(gpsButton)
        layout.addView(voiceButton)
        layout.addView(backButton)
        
        setContentView(layout)
    }
    
    private fun scanForDevices(statusText: TextView, devicesText: TextView) {
        statusText.text = "🔍 Scanning..."
        statusText.setTextColor(Color.parseColor("#FF9800"))
        
        // Simulate device scanning
        val timer = object : CountDownTimer(2000, 2000) {
            override fun onTick(millisUntilFinished: Long) {}
            
            override fun onFinish() {
                statusText.text = "🟢 Scan Complete"
                statusText.setTextColor(Color.GREEN)
                
                // Update devices list
                devicesText.text = "🎧 Connected Devices:\n• Headphones (Audio) ✓\n• Smart Watch (Notifications) ✓\n• GPS Tracker (Location) ✓\n• Speaker (Found)\n• Keyboard (Found)"
                
                speak("Device scan complete. Found new speaker and keyboard.")
            }
        }
        timer.start()
    }
    
    private fun adjustVolume(controlsText: TextView) {
        // Simulate volume adjustment
        val volumes = listOf("Volume: High", "Volume: Medium", "Volume: Low", "Volume: Muted")
        val currentIndex = volumes.indexOf(controlsText.text.toString().split("\n").first { it.contains("Volume") })
        val nextIndex = (currentIndex + 1) % volumes.size
        
        // Update controls text
        val lines = controlsText.text.toString().split("\n").toMutableList()
        lines[0] = "• ${volumes[nextIndex]}"
        controlsText.text = lines.joinToString("\n")
        
        speak("Volume adjusted to ${volumes[nextIndex].replace("Volume: ", "").toLowerCase()}")
    }
    
    private fun toggleGPS(controlsText: TextView) {
        // Toggle GPS status
        val lines = controlsText.text.toString().split("\n").toMutableList()
        val gpsLine = lines.find { it.contains("GPS") }
        
        if (gpsLine?.contains("Active") == true) {
            lines[lines.indexOf(gpsLine)] = "• GPS: Inactive"
            speak("GPS tracking disabled")
        } else {
            lines[lines.indexOf(gpsLine)] = "• GPS: Active"
            speak("GPS tracking enabled")
        }
        
        controlsText.text = lines.joinToString("\n")
    }
    
    private fun speakDeviceStatus(devicesText: TextView, controlsText: TextView) {
        val message = "Device status: ${devicesText.text.toString().replace("🎧 Connected Devices:\n", "").replace("• ", "").replace("\n", ", ")}. Controls: ${controlsText.text.toString().replace("🎮 Device Controls:\n", "").replace("• ", "").replace("\n", ", ")}"
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
