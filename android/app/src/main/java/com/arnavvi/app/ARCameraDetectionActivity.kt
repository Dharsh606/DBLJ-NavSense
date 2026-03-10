package com.arnavvi.app

import android.annotation.SuppressLint
import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.Log
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.cardview.widget.CardView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.util.*
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class ARCameraDetectionActivity : AppCompatActivity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private lateinit var previewView: PreviewView
    private lateinit var cameraExecutor: ExecutorService
    private var cameraProvider: ProcessCameraProvider? = null
    private var imageCapture: ImageCapture? = null
    private var imageAnalyzer: ImageAnalysis? = null
    
    private var isDetecting = false
    private var isPaused = false
    private var currentDistance = "Scanning..."
    private var currentObstacle = "None"
    
    // UI References
    private lateinit var statusTextView: TextView
    private lateinit var distanceTextView: TextView
    
    companion object {
        private const val TAG = "ARCameraDetection"
        private const val REQUEST_CODE_PERMISSIONS = 10
        private val REQUIRED_PERMISSIONS = arrayOf(
            Manifest.permission.CAMERA
        )
        
        val PRIMARY_DARK = Color.parseColor("#0F172A")
        val PRIMARY_MEDIUM = Color.parseColor("#1E293B")
        val SUCCESS_GREEN = Color.parseColor("#10B981")
        val WARNING_AMBER = Color.parseColor("#F59E0B")
        val DANGER_ROSE = Color.parseColor("#F43F5E")
        val SURFACE_WHITE = Color.parseColor("#FFFFFF")
        val SURFACE_DARK = Color.parseColor("#1F2937")
        val TEXT_PRIMARY = Color.parseColor("#F8FAFC")
        val TEXT_SECONDARY = Color.parseColor("#94A3B8")
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        try {
            super.onCreate(savedInstanceState)
            
            // Initialize Text-to-Speech and Executor
            tts = TextToSpeech(this, this)
            cameraExecutor = Executors.newSingleThreadExecutor()
            
            // Create UI
            val mainLayout = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.TOP
                setPadding(16, 16, 16, 16)
                
                val gradient = GradientDrawable().apply {
                    orientation = GradientDrawable.Orientation.TOP_BOTTOM
                    colors = intArrayOf(PRIMARY_DARK, PRIMARY_MEDIUM)
                    gradientType = GradientDrawable.LINEAR_GRADIENT
                }
                background = gradient
            }
            
            mainLayout.addView(createModernHeader())
            mainLayout.addView(createModernCameraFrame())
            mainLayout.addView(createDetectionStatusCard())
            mainLayout.addView(createModernDistanceCard())
            mainLayout.addView(createModernControlsCard())
            
            setContentView(mainLayout)
            
            // Request permissions and start camera
            if (allPermissionsGranted()) {
                Handler(Looper.getMainLooper()).postDelayed({
                    startCamera()
                }, 500) // Small delay to ensure UI is ready
            } else {
                requestPermissions()
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error in onCreate: ${e.message}", e)
            Toast.makeText(this, "Error initializing AR Camera", Toast.LENGTH_LONG).show()
            finish()
        }
    }
    
    private fun createModernHeader(): CardView {
        return CardView(this).apply {
            radius = 16f
            cardElevation = 8f
            setCardBackgroundColor(SURFACE_DARK)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(0, 0, 0, 16) }
            
            val headerLayout = LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(20, 16, 20, 16)
            }
            
            headerLayout.addView(TextView(context).apply {
                text = "📷"
                textSize = 24f
                setPadding(0, 0, 12, 0)
            })
            
            val textLayout = LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }
            
            textLayout.addView(TextView(context).apply {
                text = "AR Vision Dashboard"
                textSize = 18f
                setTextColor(TEXT_PRIMARY)
                setTypeface(null, android.graphics.Typeface.BOLD)
            })
            
            headerLayout.addView(textLayout)
            addView(headerLayout)
        }
    }
    
    private fun createModernCameraFrame(): CardView {
        try {
            return CardView(this).apply {
                radius = 20f
                cardElevation = 8f
                
                val cameraContainer = FrameLayout(this).apply {
                    setBackgroundColor(SURFACE_DARK)
                    layoutParams = FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        600
                    )
            val indicator = LinearLayout(context).apply {
                background = GradientDrawable().apply {
                    setColor(Color.parseColor("#AA000000"))
                    cornerRadius = 20f
                }
                setPadding(12, 6, 12, 6)
                addView(TextView(context).apply {
                    text = "● LIVE"
                    setTextColor(SUCCESS_GREEN)
                    textSize = 12f
                    setTypeface(null, android.graphics.Typeface.BOLD)
                })
            }
            addView(indicator)
        }
        cameraLayout.addView(overlay)
        cameraCard.addView(cameraLayout)
        
        return cameraCard
    }
    
    private fun createDetectionStatusCard(): CardView {
        return CardView(this).apply {
            radius = 16f
            cardElevation = 4f
            setCardBackgroundColor(SURFACE_DARK)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(0, 0, 0, 12) }
            
            val layout = LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(16, 12, 16, 12)
            }
            
            statusTextView = TextView(context).apply {
                text = "System Ready - Waiting for Input"
                textSize = 14f
                setTextColor(SUCCESS_GREEN)
                setTypeface(null, android.graphics.Typeface.BOLD)
            }
            
            layout.addView(statusTextView)
            addView(layout)
        }
    }
    
    private fun createModernDistanceCard(): CardView {
        return CardView(this).apply {
            radius = 16f
            cardElevation = 6f
            setCardBackgroundColor(SURFACE_WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(0, 0, 0, 16) }
            
            val layout = LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(20, 16, 20, 16)
            }
            
            layout.addView(TextView(context).apply {
                text = "NEAREST OBSTACLE"
                textSize = 10f
                setTextColor(Color.GRAY)
                letterSpacing = 0.1f
            })
            
            distanceTextView = TextView(context).apply {
                text = "None Detected"
                textSize = 20f
                setTextColor(PRIMARY_DARK)
                setTypeface(null, android.graphics.Typeface.BOLD)
                setPadding(0, 4, 0, 0)
            }
            
            layout.addView(distanceTextView)
            addView(layout)
        }
    }
    
    private fun createModernControlsCard(): CardView {
        val card = CardView(this).apply {
            radius = 16f
            cardElevation = 8f
            setCardBackgroundColor(SURFACE_DARK)
        }
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(12, 12, 12, 12)
        }
        
        layout.addView(createModernControlButton("▶ Start", SUCCESS_GREEN) { startDetection() })
        layout.addView(createModernControlButton("⏸ Pause", WARNING_AMBER) { togglePauseDetection() })
        layout.addView(createModernControlButton("⏹ Stop", DANGER_ROSE) { stopDetection() })
        
        card.addView(layout)
        return card
    }
    
    private fun createModernControlButton(label: String, color: Int, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            setTextColor(Color.WHITE)
            background = GradientDrawable().apply {
                setColor(color)
                cornerRadius = 12f
            }
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                setMargins(4, 0, 4, 0)
            }
            setOnClickListener { onClick() }
        }
    }
    
    private fun allPermissionsGranted() = REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(baseContext, it) == PackageManager.PERMISSION_GRANTED
    }
    
    private fun startCamera() {
        try {
            Log.d(TAG, "Starting camera initialization...")
            
            val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
            cameraProviderFuture.addListener({
                try {
                    cameraProvider = cameraProviderFuture.get()
                    
                    val preview = Preview.Builder()
                        .build()
                        .also {
                            it.setSurfaceProvider(previewView.surfaceProvider)
                        }
                    
                    imageCapture = ImageCapture.Builder().build()
                    
                    imageAnalyzer = ImageAnalysis.Builder()
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                        .build()
                        .also {
                            it.setAnalyzer(cameraExecutor, ObjectDetectionAnalyzer())
                        }
                    
                    val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                    
                    try {
                        cameraProvider?.unbindAll()
                        cameraProvider?.bindToLifecycle(
                            this, cameraSelector, preview, imageCapture, imageAnalyzer
                        )
                        Log.d(TAG, "Camera successfully bound to lifecycle")
                        
                        // Start detection after camera is ready
                        Handler(Looper.getMainLooper()).postDelayed({
                            isDetecting = true
                            updateDetectionStatus("Camera ready", "Scanning environment...")
                        }, 1000)
                        
                    } catch (e: Exception) {
                        Log.e(TAG, "Camera binding failed", e)
                        speak("Camera initialization failed")
                        runOnUiThread {
                            updateDetectionStatus("Camera Error", "Failed to initialize")
                        }
                    }
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Camera provider error", e)
                    speak("Camera provider error")
                    runOnUiThread {
                        updateDetectionStatus("Camera Error", "Provider failed")
                    }
                }
                
            }, ContextCompat.getMainExecutor(this))
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start camera", e)
            speak("Camera start failed")
            runOnUiThread {
                updateDetectionStatus("Camera Error", "Failed to start")
            }
        }
    }
    
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            if (allPermissionsGranted()) {
                startCamera()
            } else {
                Toast.makeText(this, "Camera permission is required for AR detection", Toast.LENGTH_LONG).show()
                finish()
            }
        }
    }
    
    private inner class ObjectDetectionAnalyzer : ImageAnalysis.Analyzer {
        private var lastAnalysisTime = 0L

        override fun analyze(image: ImageProxy) {
            if (!isDetecting || isPaused) {
                image.close()
                return
            }

            // Analyze every 1 second to avoid overwhelming TTS and UI
            val currentTime = System.currentTimeMillis()
            if (currentTime - lastAnalysisTime >= 1500) {
                lastAnalysisTime = currentTime
                
                // Placeholder for real AI logic (e.g., TFLite)
                val detectedObject = runSimulatedDetection()
                
                runOnUiThread {
                    updateDetectionUI(detectedObject)
                }
            }
            
            image.close()
        }
        
        private fun runSimulatedDetection(): String {
            val obstacles = listOf("Chair", "Table", "Wall", "Door", "Person", "Vehicle")
            return if (Random().nextDouble() > 0.6) obstacles.random() else "None"
        }
    }
    
    private fun updateDetectionUI(detectedObject: String) {
        if (detectedObject != "None") {
            currentObstacle = detectedObject
            currentDistance = estimateDistance(detectedObject)
            
            statusTextView.text = "⚠️ $currentObstacle Detected!"
            statusTextView.setTextColor(DANGER_ROSE)
            
            distanceTextView.text = "$currentObstacle at $currentDistance"
            distanceTextView.setTextColor(DANGER_ROSE)
            
            speak("Warning: $currentObstacle detected at $currentDistance")
        } else {
            statusTextView.text = "Scanning - Path Clear"
            statusTextView.setTextColor(SUCCESS_GREEN)
            
            distanceTextView.text = "No immediate obstacles"
            distanceTextView.setTextColor(PRIMARY_DARK)
        }
    }
    
    private fun estimateDistance(objectName: String): String {
        val distances = listOf("1 meter", "2 meters", "3 meters", "0.5 meters")
        return distances.random()
    }
    
    private fun startDetection() {
        isDetecting = true
        isPaused = false
        statusTextView.text = "Scanning..."
        speak("AR detection started.")
    }

    private fun togglePauseDetection() {
        if (!isDetecting) return
        isPaused = !isPaused
        if (isPaused) {
            statusTextView.text = "Detection Paused"
            speak("Detection paused")
        } else {
            statusTextView.text = "Detection Resumed"
            speak("Detection resumed")
        }
    }

    private fun stopDetection() {
        isDetecting = false
        speak("AR detection stopped")
        finish()
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
        cameraExecutor.shutdown()
        if (::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }
        super.onDestroy()
    }
}
