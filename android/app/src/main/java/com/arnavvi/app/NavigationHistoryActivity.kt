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
import android.view.View
import java.util.*

class NavigationHistoryActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private val navigationHistory = mutableListOf<NavigationItem>()
    
    data class NavigationItem(
        val destination: String,
        val dateTime: String,
        val distance: String
    )
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Initialize sample navigation history
        initializeSampleHistory()
        
        // Create history layout with premium gradient background
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
        
        // History Display List
        val historyList = createHistoryList()
        
        // Action Buttons
        val actionButtons = createActionButtons()
        
        // Back Button
        val backButton = createBackButton()
        
        // Add all views to main layout
        mainLayout.addView(titleCard)
        mainLayout.addView(historyList)
        mainLayout.addView(actionButtons)
        mainLayout.addView(backButton)
        
        setContentView(mainLayout)
        
        // Welcome message
        Handler(Looper.getMainLooper()).postDelayed({
            speak("Navigation History opened. You have ${navigationHistory.size} previous destinations.")
        }, 1000)
    }
    
    private fun initializeSampleHistory() {
        // Add sample navigation history items
        navigationHistory.add(NavigationItem("Central Park Entrance", "2024-03-09 09:30 AM", "2.5 km"))
        navigationHistory.add(NavigationItem("Coffee Shop Downtown", "2024-03-08 02:15 PM", "1.8 km"))
        navigationHistory.add(NavigationItem("Main Library", "2024-03-07 11:45 AM", "3.2 km"))
        navigationHistory.add(NavigationItem("City Hospital", "2024-03-06 04:20 PM", "5.1 km"))
        navigationHistory.add(NavigationItem("Grocery Store", "2024-03-05 06:30 PM", "1.2 km"))
        navigationHistory.add(NavigationItem("Train Station", "2024-03-04 08:15 AM", "4.5 km"))
        navigationHistory.add(NavigationItem("Restaurant District", "2024-03-03 07:00 PM", "2.8 km"))
        navigationHistory.add(NavigationItem("Shopping Mall", "2024-03-02 01:30 PM", "3.7 km"))
        navigationHistory.add(NavigationItem("Home", "2024-03-01 10:00 PM", "0.8 km"))
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
            text = "📜 Navigation History"
            textSize = 32f
            setTextColor(Color.parseColor("#1E3A8A"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        return titleCard
    }
    
    private fun createHistoryList(): LinearLayout {
        val listLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // History list background
            val listGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#6B7280"))
                alpha = 230
            }
            background = listGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val listTitle = TextView(this).apply {
            text = "Previous Destinations"
            textSize = 20f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        val itemsList = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
        }
        
        // Add navigation history items
        navigationHistory.forEachIndexed { index, item ->
            val historyItem = createHistoryItem(item, index + 1)
            itemsList.addView(historyItem)
        }
        
        listLayout.addView(listTitle)
        listLayout.addView(itemsList)
        
        return listLayout
    }
    
    private fun createHistoryItem(item: NavigationItem, number: Int): LinearLayout {
        val itemLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 15, 20, 15)
            
            // Item background
            val itemGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#F9FAFB"))
                cornerRadius = 12f
                setStroke(1, Color.parseColor("#E5E7EB"))
                alpha = 200
            }
            background = itemGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 5, 0, 5)
            layoutParams = params
        }
        
        // Destination row
        val destinationRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 0, 0, 8)
        }
        
        val numberText = TextView(this).apply {
            text = "$number."
            textSize = 16f
            setTextColor(Color.parseColor("#6B7280"))
            gravity = Gravity.START
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 10, 0)
        }
        
        val destinationText = TextView(this).apply {
            text = "📍 ${item.destination}"
            textSize = 18f
            setTextColor(Color.parseColor("#1E40AF"))
            gravity = Gravity.START
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        destinationRow.addView(numberText)
        destinationRow.addView(destinationText)
        
        // Date and Time row
        val dateTimeRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 5, 0, 5)
        }
        
        val dateTimeText = TextView(this).apply {
            text = "📅 ${item.dateTime}"
            textSize = 14f
            setTextColor(Color.parseColor("#6B7280"))
            gravity = Gravity.START
        }
        
        val distanceText = TextView(this).apply {
            text = "📏 ${item.distance}"
            textSize = 14f
            setTextColor(Color.parseColor("#059669"))
            gravity = Gravity.END
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        dateTimeRow.addView(dateTimeText)
        dateTimeRow.addView(distanceText)
        
        // Action buttons for this item
        val actionRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, 8, 0, 0)
        }
        
        val navigateButton = createSmallButton("Navigate Again", Color.parseColor("#10B981")) {
            navigateToDestination(item.destination)
        }
        
        val deleteButton = createSmallButton("Delete", Color.parseColor("#EF4444")) {
            deleteHistoryItem(item)
        }
        
        actionRow.addView(navigateButton)
        actionRow.addView(deleteButton)
        
        itemLayout.addView(destinationRow)
        itemLayout.addView(dateTimeRow)
        itemLayout.addView(actionRow)
        
        return itemLayout
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
        
        val clearButton = createLargeButton("🗑️ Clear All History", Color.parseColor("#EF4444")) {
            clearAllHistory()
        }
        
        buttonLayout.addView(clearButton)
        
        return buttonLayout
    }
    
    private fun createSmallButton(text: String, color: Int, onClick: () -> Unit): Button {
        return Button(this).apply {
            this.text = text
            textSize = 12f
            setTextColor(Color.WHITE)
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            val gradient = GradientDrawable().apply {
                setColor(color)
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = gradient
            
            setPadding(15, 8, 15, 8)
            
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
    
    private fun createLargeButton(text: String, color: Int, onClick: () -> Unit): Button {
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
            
            setPadding(30, 18, 30, 18)
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 0)
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
    private fun navigateToDestination(destination: String) {
        speak("Navigating again to $destination")
        // Add navigation logic here
        // This would typically launch NavigationActivity with the destination
        finish()
    }
    
    private fun deleteHistoryItem(item: NavigationItem) {
        navigationHistory.remove(item)
        speak("Deleted ${item.destination} from history")
        // Refresh the UI
        recreateActivity()
    }
    
    private fun clearAllHistory() {
        navigationHistory.clear()
        speak("All navigation history cleared")
        // Refresh the UI
        recreateActivity()
    }
    
    private fun recreateActivity() {
        // Simple way to refresh the UI
        Handler(Looper.getMainLooper()).postDelayed({
            recreate()
        }, 500)
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
