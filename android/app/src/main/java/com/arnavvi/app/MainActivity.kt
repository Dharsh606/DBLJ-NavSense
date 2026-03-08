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

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create main dashboard layout with enhanced gradient background
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(40, 60, 40, 60)
            
            // Enhanced gradient background with more depth
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
        
        // Enhanced App Title with card background
        val titleCard = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(30, 25, 30, 25)
            
            // Card background for title
            val cardGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 20f
                setStroke(2, Color.parseColor("#2563EB"))
                alpha = 180 // Semi-transparent
            }
            background = cardGradient
        }
        
        // App Title
        val title = TextView(this).apply {
            text = "DBLJ NavSense"
            textSize = 36f
            setTextColor(Color.parseColor("#1E3A8A")) // Deep blue text
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 8)
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        // Enhanced Subtitle
        val subtitle = TextView(this).apply {
            text = "Sense the Path. Navigate the World."
            textSize = 16f
            setTextColor(Color.parseColor("#64748B")) // Slate grey text
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 0)
        }
        
        // Add title and subtitle to card
        titleCard.addView(title)
        titleCard.addView(subtitle)
        
        // Enhanced Navigation Button with better colors
        val navButton = createAestheticButton("🧭 Navigation", 
            intArrayOf(Color.parseColor("#3B82F6"), Color.parseColor("#2563EB")), 0) {
            startActivity(Intent(this, NavigationActivity::class.java))
        }
        
        // Enhanced Surround Scan Button
        val scanButton = createAestheticButton("📡 Surround Scan", 
            intArrayOf(Color.parseColor("#10B981"), Color.parseColor("#059669")), 1) {
            startActivity(Intent(this, SurroundScanActivity::class.java))
        }
        
        // Enhanced Bluetooth Control Button
        val bluetoothButton = createAestheticButton("🔗 Bluetooth Devices", 
            intArrayOf(Color.parseColor("#F59E0B"), Color.parseColor("#D97706")), 2) {
            startActivity(Intent(this, BluetoothActivity::class.java))
        }
        
        // Enhanced Emergency Button
        val emergencyButton = createAestheticButton("🚨 Emergency", 
            intArrayOf(Color.parseColor("#EF4444"), Color.parseColor("#DC2626")), 3) {
            startActivity(Intent(this, EmergencyActivity::class.java))
        }
        
        // Add all views to layout with better spacing
        layout.addView(titleCard)
        layout.addView(navButton)
        layout.addView(scanButton)
        layout.addView(bluetoothButton)
        layout.addView(emergencyButton)
        
        setContentView(layout)
    }
    
    private fun createAestheticButton(text: String, colors: IntArray, index: Int, onClick: () -> Unit): Button {
        return Button(this).apply {
            this.text = text
            textSize = 20f
            setTextColor(Color.WHITE)
            setShadowLayer(6f, 2f, 2f, Color.parseColor("#000000"))
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            // Enhanced gradient background with better styling
            val gradient = GradientDrawable().apply {
                this.colors = colors
                gradientType = GradientDrawable.LINEAR_GRADIENT
                cornerRadius = 30f
                setStroke(4, Color.parseColor("#FFFFFF"))
            }
            background = gradient
            
            // Enhanced padding and margins
            setPadding(50, 40, 50, 40)
            
            // Make visible immediately
            alpha = 1f
            
            // Enhanced button press effect
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
            // Enhanced margins between buttons
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 20, 0, 20)
            layoutParams = params
        }
    }
}
