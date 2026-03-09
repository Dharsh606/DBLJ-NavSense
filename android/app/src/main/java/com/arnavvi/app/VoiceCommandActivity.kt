package com.arnavvi.app

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Button
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.speech.tts.TextToSpeech
import android.speech.RecognitionListener
import android.speech.SpeechRecognizer
import android.speech.RecognizerIntent
import android.util.Log
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.Manifest
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.util.*

class VoiceCommandActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private lateinit var speechRecognizer: SpeechRecognizer
    private lateinit var recognizerIntent: Intent
    
    private var isListening = false
    private var currentStatus = "Ready"
    private var commandHistory = mutableListOf<String>()
    private var lastCommand = ""
    
    companion object {
        private const val REQUEST_RECORD_AUDIO_PERMISSION = 100
    }

    // IDs for dynamic views
    private val ID_MIC_ICON = 1001
    private val ID_STATUS_TEXT = 1002
    private val ID_LISTENING_INDICATOR = 1003
    private val ID_FEEDBACK_MESSAGE = 1004
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check and request audio recording permissions
        if (!checkAudioPermission()) {
            ActivityCompat.requestPermissions(
                this, 
                arrayOf(Manifest.permission.RECORD_AUDIO), 
                REQUEST_RECORD_AUDIO_PERMISSION
            )
        }
        
        // Initialize Text-to-Speech
        tts = TextToSpeech(this, this)
        
        // Initialize Speech Recognizer
        initializeSpeechRecognizer()
        
        // Create voice command layout with premium gradient background
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
        
        // Microphone Area
        val microphoneArea = createMicrophoneArea()
        
        // Voice Command Buttons
        val commandButtons = createVoiceCommandButtons()
        
        // Command History
        val commandHistoryView = createCommandHistory()
        
        // Voice Feedback
        val voiceFeedback = createVoiceFeedback()
        
        // Back Button
        val backButton = createBackButton()
        
        // Add all views to main layout
        mainLayout.addView(titleCard)
        mainLayout.addView(microphoneArea)
        mainLayout.addView(commandButtons)
        mainLayout.addView(commandHistoryView)
        mainLayout.addView(voiceFeedback)
        mainLayout.addView(backButton)
        
        setContentView(mainLayout)
        
        // Initialize with welcome message
        speak("Voice Navigation Assistant ready. Say a command to get started.")
    }

    private fun checkAudioPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun initializeSpeechRecognizer() {
        if (SpeechRecognizer.isRecognitionAvailable(this)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
            recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            }
        }
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
            text = "🎤 Voice Navigation Assistant"
            textSize = 28f
            setTextColor(Color.parseColor("#1E3A8A"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        return titleCard
    }
    
    private fun createMicrophoneArea(): LinearLayout {
        val micLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 30, 20, 30)
            
            // Microphone area background
            val micGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 25f
                setStroke(3, Color.parseColor("#8B5CF6"))
                alpha = 230
            }
            background = micGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        // Large Microphone Icon
        val microphoneIcon = TextView(this).apply {
            text = "🎤"
            textSize = 80f
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 20)
            id = ID_MIC_ICON
        }
        
        // Status Message
        val statusText = TextView(this).apply {
            text = currentStatus
            textSize = 24f
            setTextColor(Color.parseColor("#8B5CF6"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 10)
            id = ID_STATUS_TEXT
        }
        
        // Listening Indicator
        val listeningIndicator = createListeningIndicator()
        
        micLayout.addView(microphoneIcon)
        micLayout.addView(statusText)
        micLayout.addView(listeningIndicator)
        
        return micLayout
    }
    
    private fun createListeningIndicator(): LinearLayout {
        val indicatorLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(10, 5, 10, 5)
            visibility = View.GONE
            id = ID_LISTENING_INDICATOR
        }
        
        val indicatorDot = TextView(this).apply {
            text = "🔴"
            textSize = 20f
            gravity = Gravity.CENTER
            setPadding(5, 0, 5, 0)
        }
        
        val indicatorText = TextView(this).apply {
            text = "Listening..."
            textSize = 16f
            setTextColor(Color.parseColor("#EF4444"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        indicatorLayout.addView(indicatorDot)
        indicatorLayout.addView(indicatorText)
        
        return indicatorLayout
    }
    
    private fun createVoiceCommandButtons(): LinearLayout {
        val buttonsLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val startButton = createVoiceButton("🎤 Start Listening", Color.parseColor("#10B981")) {
            startListening()
        }
        
        val stopButton = createVoiceButton("⏹️ Stop Listening", Color.parseColor("#EF4444")) {
            stopListening()
        }
        
        val repeatButton = createVoiceButton("🔁 Repeat Last Command", Color.parseColor("#F59E0B")) {
            repeatLastCommand()
        }
        
        buttonsLayout.addView(startButton)
        buttonsLayout.addView(stopButton)
        buttonsLayout.addView(repeatButton)
        
        return buttonsLayout
    }
    
    private fun createCommandHistory(): LinearLayout {
        val historyLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // History background
            val historyGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#D1D5DB"))
                alpha = 230
            }
            background = historyGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val historyTitle = TextView(this).apply {
            text = "📜 Command History"
            textSize = 18f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 15)
        }
        
        val historyList = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.START
            setPadding(20, 0, 20, 0)
        }
        
        // Add sample commands to history
        val sampleCommands = listOf(
            "Navigate to Cafeteria",
            "Where am I",
            "Stop Navigation",
            "Find nearest exit",
            "Call emergency contact"
        )
        
        sampleCommands.forEachIndexed { index, command ->
            val commandItem = createCommandItem(command, index + 1)
            historyList.addView(commandItem)
        }
        
        historyLayout.addView(historyTitle)
        historyLayout.addView(historyList)
        
        return historyLayout
    }
    
    private fun createCommandItem(command: String, number: Int): LinearLayout {
        val itemLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 8, 0, 8)
        }
        
        val numberText = TextView(this).apply {
            text = "$number."
            textSize = 14f
            setTextColor(Color.parseColor("#6B7280"))
            gravity = Gravity.START
            setPadding(0, 0, 10, 0)
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        val commandText = TextView(this).apply {
            text = command
            textSize = 16f
            setTextColor(Color.parseColor("#374151"))
            gravity = Gravity.START
            setPadding(0, 0, 0, 0)
        }
        
        itemLayout.addView(numberText)
        itemLayout.addView(commandText)
        
        return itemLayout
    }
    
    private fun createVoiceFeedback(): LinearLayout {
        val feedbackLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            // Feedback background
            val feedbackGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#F0FDF4"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#3B82F6"))
                alpha = 230
            }
            background = feedbackGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val feedbackTitle = TextView(this).apply {
            text = "🔊 Voice Feedback"
            textSize = 18f
            setTextColor(Color.parseColor("#1F2937"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 10)
        }
        
        val feedbackMessage = TextView(this).apply {
            text = "Ready to assist with voice commands."
            textSize = 16f
            setTextColor(Color.parseColor("#3B82F6"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 10)
            id = ID_FEEDBACK_MESSAGE
        }
        
        feedbackLayout.addView(feedbackTitle)
        feedbackLayout.addView(feedbackMessage)
        
        return feedbackLayout
    }
    
    private fun createVoiceButton(text: String, color: Int, onClick: () -> Unit): Button {
        return Button(this).apply {
            this.text = text
            textSize = 14f
            setTextColor(Color.WHITE)
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            val gradient = GradientDrawable().apply {
                setColor(color)
                cornerRadius = 25f
                setStroke(3, Color.parseColor("#FFFFFF"))
            }
            background = gradient
            
            setPadding(20, 15, 20, 15)
            
            val params = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1.0f
            )
            params.setMargins(5, 0, 5, 0)
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
    
    // Voice Command Functions
    private fun startListening() {
        isListening = true
        currentStatus = "Listening..."
        
        val statusText = findViewById<TextView>(ID_STATUS_TEXT)
        val micIcon = findViewById<TextView>(ID_MIC_ICON)
        val listeningIndicator = findViewById<LinearLayout>(ID_LISTENING_INDICATOR)
        
        statusText?.text = currentStatus
        statusText?.setTextColor(Color.parseColor("#EF4444"))
        micIcon?.text = "🔴"
        listeningIndicator?.visibility = View.VISIBLE
        
        speak("Listening for your command...")
        
        // Simulate voice recognition
        simulateVoiceRecognition()
    }
    
    private fun stopListening() {
        isListening = false
        currentStatus = "Ready"
        
        val statusText = findViewById<TextView>(ID_STATUS_TEXT)
        val micIcon = findViewById<TextView>(ID_MIC_ICON)
        val listeningIndicator = findViewById<LinearLayout>(ID_LISTENING_INDICATOR)
        
        statusText?.text = currentStatus
        statusText?.setTextColor(Color.parseColor("#8B5CF6"))
        micIcon?.text = "🎤"
        listeningIndicator?.visibility = View.GONE
        
        speak("Voice recognition stopped.")
    }
    
    private fun repeatLastCommand() {
        if (lastCommand.isNotEmpty()) {
            speak("Last command was: $lastCommand")
            updateFeedback("Repeating: $lastCommand")
        } else {
            speak("No previous command to repeat.")
            updateFeedback("No previous command available.")
        }
    }
    
    private fun simulateVoiceRecognition() {
        if (!isListening) return
        
        val commands = listOf(
            "Navigate to Cafeteria",
            "Where am I",
            "Stop Navigation",
            "Find nearest exit",
            "Call emergency contact",
            "Start navigation home",
            "What's around me"
        )
        
        val processingTimes = listOf(2000L, 3000L, 2500L, 1500L, 3500L)
        val randomTime = processingTimes.random()
        
        // Show processing status
        Handler(Looper.getMainLooper()).postDelayed({
            if (isListening) {
                val statusText = findViewById<TextView>(ID_STATUS_TEXT)
                statusText?.text = "Processing command..."
                
                // Simulate command recognition
                Handler(Looper.getMainLooper()).postDelayed({
                    if (isListening) {
                        val recognizedCommand = commands.random()
                        lastCommand = recognizedCommand
                        
                        // Add to history
                        commandHistory.add(recognizedCommand)
                        if (commandHistory.size > 10) {
                            commandHistory.removeAt(0)
                        }
                        
                        // Update status
                        currentStatus = "Command recognized"
                        statusText?.text = currentStatus
                        statusText?.setTextColor(Color.parseColor("#10B981"))
                        
                        // Provide voice feedback
                        processCommand(recognizedCommand)
                        
                        // Auto-stop listening after command
                        Handler(Looper.getMainLooper()).postDelayed({
                            stopListening()
                        }, 2000L)
                    }
                }, randomTime)
            }
        }, 1000L)
    }
    
    private fun processCommand(command: String) {
        val response = when {
            command.contains("Navigate") -> {
                val destination = command.replace("Navigate to ", "")
                "Starting navigation to $destination."
            }
            command.contains("Where am I") -> {
                "You are currently on the main floor near the elevator."
            }
            command.contains("Stop Navigation") -> {
                "Navigation stopped. Voice assistant ready."
            }
            command.contains("exit") -> {
                "Nearest exit is 50 meters ahead on your right."
            }
            command.contains("emergency") -> {
                "Emergency contact being called now."
            }
            command.contains("home") -> {
                "Starting navigation to your home location."
            }
            command.contains("around") -> {
                "I detect a chair on your left and a door ahead."
            }
            else -> {
                "Command recognized. Processing your request."
            }
        }
        
        speak(response)
        updateFeedback(response)
    }
    
    private fun updateFeedback(message: String) {
        val feedbackText = findViewById<TextView>(ID_FEEDBACK_MESSAGE)
        feedbackText?.text = message
    }
    
    private fun speak(text: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
    }
    
    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.setLanguage(Locale.US)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::speechRecognizer.isInitialized) {
            speechRecognizer.destroy()
        }
        if (::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }
    }
}
