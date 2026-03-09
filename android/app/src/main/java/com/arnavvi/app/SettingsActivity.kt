package com.arnavvi.app

import android.app.Activity
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Button
import android.widget.SeekBar
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.speech.tts.TextToSpeech
import android.util.Log
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import java.util.*

class SettingsActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    
    // Settings values
    private var voiceSpeed = 50
    private var voiceVolume = 75
    private var walkingSpeed = 50
    private var alertDistance = 30
    private var obstacleSensitivity = 50
    private var largeTextMode = false
    private var highContrastMode = false
    private var vibrationAlerts = true
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Create settings layout with premium gradient background
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
        
        // Voice Settings
        val voiceSettings = createVoiceSettings()
        
        // Navigation Settings
        val navigationSettings = createNavigationSettings()
        
        // Accessibility Settings
        val accessibilitySettings = createAccessibilitySettings()
        
        // Device Settings
        val deviceSettings = createDeviceSettings()
        
        // Save and Back Buttons
        val buttonLayout = createActionButtons()
        
        // Add all views to main layout
        mainLayout.addView(titleCard)
        mainLayout.addView(voiceSettings)
        mainLayout.addView(navigationSettings)
        mainLayout.addView(accessibilitySettings)
        mainLayout.addView(deviceSettings)
        mainLayout.addView(buttonLayout)
        
        setContentView(mainLayout)
        
        // Welcome message
        Handler(Looper.getMainLooper()).postDelayed({
            speak("Settings screen opened. Adjust your preferences for voice, navigation, and accessibility.")
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
            text = "⚙️ App Settings"
            textSize = 32f
            setTextColor(Color.parseColor("#1E3A8A"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        return titleCard
    }
    
    private fun createVoiceSettings(): LinearLayout {
        val voiceLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Voice settings background
            val voiceGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#8B5CF6"))
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
        
        val voiceTitle = TextView(this).apply {
            text = "🎤 Voice Settings"
            textSize = 22f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        val voiceOptions = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 0, 20, 0)
        }
        
        // Voice Speed
        voiceOptions.addView(createSettingItem("Voice Speed", "$voiceSpeed%", "slider") {
            // Handle voice speed change
        })
        
        // Voice Language
        voiceOptions.addView(createSettingItem("Voice Language", "English (US)", "button") {
            speak("Opening language selection")
            // Add language selection logic here
        })
        
        // Voice Volume
        voiceOptions.addView(createSettingItem("Voice Volume", "$voiceVolume%", "slider") {
            // Handle voice volume change
        })
        
        voiceLayout.addView(voiceTitle)
        voiceLayout.addView(voiceOptions)
        
        return voiceLayout
    }
    
    private fun createNavigationSettings(): LinearLayout {
        val navLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Navigation settings background
            val navGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#10B981"))
                alpha = 230
            }
            background = navGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val navTitle = TextView(this).apply {
            text = "🧭 Navigation Settings"
            textSize = 22f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        val navOptions = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 0, 20, 0)
        }
        
        // Preferred Walking Speed
        navOptions.addView(createSettingItem("Preferred Walking Speed", "$walkingSpeed%", "slider") {
            // Handle walking speed change
        })
        
        // Alert Distance
        navOptions.addView(createSettingItem("Alert Distance", "${alertDistance}m", "slider") {
            // Handle alert distance change
        })
        
        // Obstacle Warning Sensitivity
        navOptions.addView(createSettingItem("Obstacle Warning Sensitivity", "$obstacleSensitivity%", "slider") {
            // Handle sensitivity change
        })
        
        navLayout.addView(navTitle)
        navLayout.addView(navOptions)
        
        return navLayout
    }
    
    private fun createAccessibilitySettings(): LinearLayout {
        val accessLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Accessibility settings background
            val accessGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#F59E0B"))
                alpha = 230
            }
            background = accessGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val accessTitle = TextView(this).apply {
            text = "♿ Accessibility Settings"
            textSize = 22f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        val accessOptions = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 0, 20, 0)
        }
        
        // Large Text Mode
        accessOptions.addView(createSettingToggle("Large Text Mode", largeTextMode) {
            largeTextMode = !largeTextMode
            speak("Large text mode ${if (largeTextMode) "disabled" else "enabled"}")
        })
        
        // High Contrast Mode
        accessOptions.addView(createSettingToggle("High Contrast Mode", highContrastMode) {
            highContrastMode = !highContrastMode
            speak("High contrast mode ${if (highContrastMode) "disabled" else "enabled"}")
        })
        
        // Vibration Alerts
        accessOptions.addView(createSettingToggle("Vibration Alerts", vibrationAlerts) {
            vibrationAlerts = !vibrationAlerts
            speak("Vibration alerts ${if (vibrationAlerts) "disabled" else "enabled"}")
        })
        
        accessLayout.addView(accessTitle)
        accessLayout.addView(accessOptions)
        
        return accessLayout
    }
    
    private fun createDeviceSettings(): LinearLayout {
        val deviceLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Device settings background
            val deviceGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#6B7280"))
                alpha = 230
            }
            background = deviceGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val deviceTitle = TextView(this).apply {
            text = "📱 Device Settings"
            textSize = 22f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        val deviceOptions = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 0, 20, 0)
        }
        
        // Bluetooth Device Management
        deviceOptions.addView(createSettingButton("🔗 Bluetooth Device Management") {
            speak("Opening Bluetooth device management")
            // Add Bluetooth management logic here
        })
        
        // Camera Settings
        deviceOptions.addView(createSettingButton("📷 Camera Settings") {
            speak("Opening camera settings")
            // Add camera settings logic here
        })
        
        // GPS Settings
        deviceOptions.addView(createSettingButton("📍 GPS Settings") {
            speak("Opening GPS settings")
            // Add GPS settings logic here
        })
        
        deviceLayout.addView(deviceTitle)
        deviceLayout.addView(deviceOptions)
        
        return deviceLayout
    }
    
    private fun createSettingItem(title: String, value: String, type: String, onClick: () -> Unit): LinearLayout {
        val itemLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(0, 10, 0, 10)
        }
        
        val titleText = TextView(this).apply {
            text = title
            textSize = 18f
            setTextColor(Color.parseColor("#374151"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 8)
        }
        
        val valueLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 0)
        }
        
        val valueText = TextView(this).apply {
            text = value
            textSize = 16f
            setTextColor(Color.parseColor("#6B7280"))
            gravity = Gravity.CENTER
            setPadding(10, 0, 10, 0)
        }
        
        valueLayout.addView(valueText)
        
        if (type == "slider") {
            val slider = createSlider()
            valueLayout.addView(slider)
        } else if (type == "button") {
            val button = createSmallButton("Change")
            valueLayout.addView(button)
        }
        
        itemLayout.addView(titleText)
        itemLayout.addView(valueLayout)
        
        return itemLayout
    }
    
    private fun createSettingToggle(title: String, isEnabled: Boolean, onClick: () -> Unit): LinearLayout {
        val toggleLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(20, 15, 20, 15)
        }
        
        val titleText = TextView(this).apply {
            text = title
            textSize = 18f
            setTextColor(Color.parseColor("#374151"))
            gravity = Gravity.START or Gravity.CENTER_VERTICAL
            setTypeface(null, android.graphics.Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1.0f
            )
        }
        
        val toggleButton = createLargeToggle(isEnabled) {
            // Handle toggle change
        }
        
        toggleLayout.addView(titleText)
        toggleLayout.addView(toggleButton)
        
        return toggleLayout
    }
    
    private fun createSettingButton(text: String, onClick: () -> Unit): LinearLayout {
        val buttonText = text  // Capture the text parameter for use in setOnClickListener
        
        val buttonLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(20, 10, 20, 10)
        }
        
        val textView = TextView(this).apply {
            this.text = buttonText
            textSize = 18f
            setTextColor(Color.parseColor("#374151"))
            gravity = Gravity.START or Gravity.CENTER_VERTICAL
            setTypeface(null, android.graphics.Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1.0f
            )
        }
        
        val arrowButton = Button(this).apply {
            this.text = "→"
            textSize = 18f
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#6B7280"))
            setPadding(20, 15, 20, 15)
            setOnClickListener {
                speak("Opening $buttonText")
                // Add navigation logic here
                onClick()
            }
            
            val btnGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#6B7280"))
                cornerRadius = 20f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = btnGradient
            
            val params = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                0.2f
            )
            params.setMargins(10, 0, 0, 0)
            layoutParams = params
        }
        
        buttonLayout.addView(textView)
        buttonLayout.addView(arrowButton)
        
        return buttonLayout
    }
    
    private fun createSlider(): SeekBar {
        return SeekBar(this).apply {
            max = 100
            progress = 50
            setPadding(20, 0, 20, 0)
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            layoutParams = params
            
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                    if (fromUser) {
                        // Handle slider change
                        speak("Value changed to $progress percent")
                    }
                }
                
                override fun onStartTrackingTouch(seekBar: SeekBar?) {}
                override fun onStopTrackingTouch(seekBar: SeekBar?) {}
            })
        }
    }
    
    private fun createLargeToggle(isEnabled: Boolean, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = if (isEnabled) "ON" else "OFF"
            textSize = 16f
            setTextColor(Color.WHITE)
            setBackgroundColor(if (isEnabled) Color.parseColor("#10B981") else Color.parseColor("#6B7280"))
            setPadding(30, 20, 30, 20)
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            val toggleGradient = GradientDrawable().apply {
                setColor(if (isEnabled) Color.parseColor("#10B981") else Color.parseColor("#6B7280"))
                cornerRadius = 25f
                setStroke(3, Color.parseColor("#FFFFFF"))
            }
            background = toggleGradient
            
            val params = LinearLayout.LayoutParams(
                100,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            layoutParams = params
            
            setOnClickListener {
                // Toggle state change handled in parent
                onClick()
            }
        }
    }
    
    private fun createSmallButton(text: String): Button {
        return Button(this).apply {
            this.text = text
            textSize = 14f
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#8B5CF6"))
            setPadding(20, 10, 20, 10)
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            val btnGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#8B5CF6"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = btnGradient
        }
    }
    
    private fun createActionButtons(): LinearLayout {
        val buttonLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 20, 0, 20)
            layoutParams = params
        }
        
        val saveButton = Button(this).apply {
            text = "💾 Save Settings"
            textSize = 16f
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#10B981"))
            setPadding(30, 18, 30, 18)
            setTypeface(null, android.graphics.Typeface.BOLD)
            setOnClickListener {
                speak("Settings saved successfully")
                // Add save logic here
            }
            
            val saveGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#10B981"))
                cornerRadius = 25f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = saveGradient
            
            val params = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1.0f
            )
            params.setMargins(0, 0, 10, 0)
            layoutParams = params
        }
        
        val backButton = Button(this).apply {
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
            
            val params = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1.0f
            )
            params.setMargins(10, 0, 0, 0)
            layoutParams = params
        }
        
        buttonLayout.addView(saveButton)
        buttonLayout.addView(backButton)
        
        return buttonLayout
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
}
