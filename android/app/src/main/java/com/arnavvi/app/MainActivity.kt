package com.arnavvi.app

import android.app.Activity
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Button
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.content.Intent
import android.util.TypedValue
import android.view.Gravity
import android.view.animation.AlphaAnimation
import android.view.animation.ScaleAnimation
import android.view.animation.Animation
import android.view.animation.DecelerateInterpolator
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.Log
import android.view.View
import android.widget.ImageView
import androidx.cardview.widget.CardView
import java.util.*

class MainActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private var gpsStatus = "Active"
    private var bluetoothStatus = "Active"
    private var internetStatus = "Active"
    private var cameraStatus = "Active"
    
    // Modern premium color palette
    companion object {
        val PRIMARY_DARK = Color.parseColor("#0F172A")
        val PRIMARY_MEDIUM = Color.parseColor("#1E293B")
        val PRIMARY_LIGHT = Color.parseColor("#334155")
        val ACCENT_GOLD = Color.parseColor("#F59E0B")
        val ACCENT_EMERALD = Color.parseColor("#10B981")
        val ACCENT_ROSE = Color.parseColor("#F43F5E")
        val ACCENT_BLUE = Color.parseColor("#3B82F6")
        val ACCENT_PURPLE = Color.parseColor("#8B5CF6")
        val SURFACE_WHITE = Color.parseColor("#F8FAFC")
        val SURFACE_LIGHT = Color.parseColor("#F1F5F9")
        val TEXT_PRIMARY = Color.parseColor("#F8FAFC")
        val TEXT_SECONDARY = Color.parseColor("#CBD5E1")
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Create modern compact dashboard layout
        val mainLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.TOP
            setPadding(24, 32, 24, 32)
            
            // Modern gradient background
            val gradient = GradientDrawable().apply {
                orientation = GradientDrawable.Orientation.TOP_BOTTOM
                colors = intArrayOf(
                    PRIMARY_DARK,
                    PRIMARY_MEDIUM,
                    PRIMARY_LIGHT
                )
                gradientType = GradientDrawable.LINEAR_GRADIENT
                cornerRadius = 0f
            }
            background = gradient
        }
        
        // Modern compact header
        val headerCard = createModernHeader()
        
        // Status indicators bar
        val statusBar = createStatusBar()
        
        // Quick action grid
        val quickActions = createQuickActionGrid()
        
        // Main feature cards
        val featureCards = createFeatureCards()
        
        // Add all views to main layout
        mainLayout.addView(headerCard)
        mainLayout.addView(statusBar)
        mainLayout.addView(quickActions)
        mainLayout.addView(featureCards)
        
        setContentView(mainLayout)
        
        // Welcome message
        Handler(Looper.getMainLooper()).postDelayed({
            speak("Welcome to DBLJ NavSense. Your premium accessibility assistant is ready.")
        }, 800)
    }
    
    private fun createModernHeader(): CardView {
        val headerCard = CardView(this).apply {
            radius = 20f
            cardElevation = 12f
            setCardBackgroundColor(SURFACE_WHITE)
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val headerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(24, 20, 24, 20)
        }
        
        // App title with modern typography
        val title = TextView(this).apply {
            text = "DBLJ NavSense"
            textSize = 28f
            setTextColor(PRIMARY_DARK)
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            letterSpacing = 0.05f
        }
        
        // Subtitle with premium feel
        val subtitle = TextView(this).apply {
            text = "Premium Navigation Assistant"
            textSize = 14f
            setTextColor(TEXT_SECONDARY)
            gravity = Gravity.CENTER
            setPadding(0, 4, 0, 0)
            letterSpacing = 0.02f
        }
        
        headerLayout.addView(title)
        headerLayout.addView(subtitle)
        headerCard.addView(headerLayout)
        
        return headerCard
    }
    
    private fun createStatusBar(): LinearLayout {
        val statusLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(16, 12, 16, 12)
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 16)
            layoutParams = params
            
            // Modern status background
            val gradient = GradientDrawable().apply {
                setColor(Color.parseColor("#1E293B"))
                cornerRadius = 16f
            }
            background = gradient
        }
        
        // GPS Status
        val gpsStatus = createStatusIndicator("📍", "GPS", ACCENT_EMERALD)
        
        // Bluetooth Status
        val btStatus = createStatusIndicator("🔗", "BT", ACCENT_BLUE)
        
        // Camera Status
        val camStatus = createStatusIndicator("📷", "CAM", ACCENT_GOLD)
        
        statusLayout.addView(gpsStatus)
        statusLayout.addView(btStatus)
        statusLayout.addView(camStatus)
        
        return statusLayout
    }
    
    private fun createStatusIndicator(icon: String, label: String, color: Int): LinearLayout {
        val indicator = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(8, 4, 8, 4)
            
            val params = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            layoutParams = params
        }
        
        val iconText = TextView(this).apply {
            text = icon
            textSize = 16f
            setTextColor(color)
            gravity = Gravity.CENTER
        }
        
        val labelText = TextView(this).apply {
            text = label
            textSize = 10f
            setTextColor(TEXT_SECONDARY)
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        indicator.addView(iconText)
        indicator.addView(labelText)
        
        return indicator
    }
    
    private fun createQuickActionGrid(): LinearLayout {
        val gridLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        // Voice Command Button
        val voiceBtn = createCompactQuickAction("🎤", "Voice", ACCENT_PURPLE) {
            startActivity(Intent(this, VoiceCommandActivity::class.java))
        }
        
        // Emergency Button
        val emergencyBtn = createCompactQuickAction("🚨", "SOS", ACCENT_ROSE) {
            startActivity(Intent(this, EmergencyActivity::class.java))
        }
        
        gridLayout.addView(voiceBtn)
        gridLayout.addView(emergencyBtn)
        
        return gridLayout
    }
    
    private fun createCompactQuickAction(icon: String, label: String, color: Int, onClick: () -> Unit): CardView {
        val card = CardView(this).apply {
            radius = 16f
            cardElevation = 8f
            setCardBackgroundColor(color)
            
            val params = LinearLayout.LayoutParams(0, 80, 1f)
            params.setMargins(8, 0, 8, 0)
            layoutParams = params
            
            setOnClickListener { onClick() }
        }
        
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(16, 0, 16, 0)
        }
        
        val iconText = TextView(this).apply {
            text = icon
            textSize = 24f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
        }
        
        val labelText = TextView(this).apply {
            text = label
            textSize = 14f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(8, 0, 0, 0)
        }
        
        layout.addView(iconText)
        layout.addView(labelText)
        card.addView(layout)
        
        return card
    }
    
    private fun createFeatureCards(): LinearLayout {
        val cardsLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
        }
        
        // Navigation Card
        val navCard = createModernFeatureCard(
            "🧭 Navigation",
            "Smart GPS Guidance",
            "Voice-guided navigation with real-time directions",
            ACCENT_BLUE
        ) {
            startActivity(Intent(this, NavigationActivity::class.java))
        }
        
        // AR Detection Card
        val arCard = createModernFeatureCard(
            "📷 AR Vision",
            "Obstacle Detection",
            "AI-powered camera assistance for safe navigation",
            ACCENT_EMERALD
        ) {
            startActivity(Intent(this, ARCameraDetectionActivity::class.java))
        }
        
        // Bluetooth Card
        val btCard = createModernFeatureCard(
            "🔗 Devices",
            "Smart Connectivity",
            "Connect and manage accessibility devices",
            ACCENT_GOLD
        ) {
            startActivity(Intent(this, BluetoothActivity::class.java))
        }
        
        cardsLayout.addView(navCard)
        cardsLayout.addView(arCard)
        cardsLayout.addView(btCard)
        
        return cardsLayout
    }
    
    private fun createModernFeatureCard(title: String, subtitle: String, description: String, accentColor: Int, onClick: () -> Unit): CardView {
        val card = CardView(this).apply {
            radius = 20f
            cardElevation = 10f
            setCardBackgroundColor(SURFACE_WHITE)
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 16)
            layoutParams = params
            
            setOnClickListener { 
                // Modern press animation
                this.animate()
                    .scaleX(0.98f)
                    .scaleY(0.98f)
                    .setDuration(100)
                    .withEndAction {
                        this.animate()
                            .scaleX(1f)
                            .scaleY(1f)
                            .setDuration(100)
                            .start()
                        onClick()
                    }
                    .start()
            }
        }
        
        val cardLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(20, 16, 20, 16)
        }
        
        // Icon container
        val iconContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(0, 0, 16, 0)
            
            val params = LinearLayout.LayoutParams(60, 60)
            layoutParams = params
            
            // Modern icon background
            val iconBg = GradientDrawable().apply {
                setColor(accentColor)
                cornerRadius = 16f
            }
            background = iconBg
        }
        
        val iconText = TextView(this).apply {
            text = title.split(" ")[0] // Get emoji
            textSize = 24f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
        }
        
        iconContainer.addView(iconText)
        
        // Text content
        val textLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        
        val titleText = TextView(this).apply {
            text = title
            textSize = 18f
            setTextColor(PRIMARY_DARK)
            setTypeface(null, android.graphics.Typeface.BOLD)
            letterSpacing = 0.02f
        }
        
        val subtitleText = TextView(this).apply {
            text = subtitle
            textSize = 12f
            setTextColor(TEXT_SECONDARY)
            setPadding(0, 2, 0, 0)
        }
        
        val descText = TextView(this).apply {
            text = description
            textSize = 11f
            setTextColor(TEXT_SECONDARY)
            setPadding(0, 4, 0, 0)
            maxLines = 2
        }
        
        textLayout.addView(titleText)
        textLayout.addView(subtitleText)
        textLayout.addView(descText)
        
        // Arrow indicator
        val arrowText = TextView(this).apply {
            text = "→"
            textSize = 20f
            setTextColor(TEXT_SECONDARY)
            setPadding(8, 0, 0, 0)
        }
        
        cardLayout.addView(iconContainer)
        cardLayout.addView(textLayout)
        cardLayout.addView(arrowText)
        
        card.addView(cardLayout)
        
        return card
    }
    
    private fun speak(text: String) {
        if (::tts.isInitialized) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
        }
    }
    
    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.setLanguage(Locale.US)
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
