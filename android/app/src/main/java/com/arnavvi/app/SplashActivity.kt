package com.arnavvi.app

import android.app.Activity
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.ImageView
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.content.Intent
import android.view.animation.AlphaAnimation
import android.view.animation.RotateAnimation
import android.view.animation.ScaleAnimation
import android.view.animation.AnimationSet
import android.view.animation.Animation
import android.view.animation.DecelerateInterpolator
import android.view.animation.Transformation

class SplashActivity : Activity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create splash layout with professional deep navy background
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(50, 100, 50, 100)
            
            // Professional deep navy blue background
            val gradient = GradientDrawable().apply {
                setColor(Color.parseColor("#0B1F3A")) // Deep navy blue
            }
            background = gradient
        }
        
        // Logo image (no animation for now)
        val logoImage = ImageView(this).apply {
            setImageResource(R.drawable.navsense_logo)
            scaleType = ImageView.ScaleType.FIT_CENTER
            setPadding(0, 0, 0, 40)
            
            // Make visible immediately
            alpha = 1f
        }
        
        // App Name (no animation for now)
        val appName = TextView(this).apply {
            text = "DBLJ NavSense"
            textSize = 42f
            setTextColor(Color.WHITE) // White text for high contrast
            setShadowLayer(8f, 2f, 2f, Color.BLACK)
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 20)
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            // Make visible immediately
            alpha = 1f
        }
        
        // Tagline (no animation for now)
        val tagline = TextView(this).apply {
            text = "Sense the Path. Navigate the World."
            textSize = 18f
            setTextColor(Color.WHITE) // White text for accessibility
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 30)
            setShadowLayer(4f, 1f, 1f, Color.BLACK)
            
            // Make visible immediately
            alpha = 1f
        }
        
        // Remove loading text for minimal, clean design as requested
        // Add all views to layout in correct order
        layout.addView(logoImage)
        layout.addView(appName)
        layout.addView(tagline)
        
        setContentView(layout)
        
        // Auto-transition to main activity after 3 seconds as specified
        Handler(Looper.getMainLooper()).postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            finish() // Close splash activity
        }, 3000)
    }
}
