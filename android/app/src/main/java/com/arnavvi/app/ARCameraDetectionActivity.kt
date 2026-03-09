package com.arnavvi.app

import android.app.Activity
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Button
import android.widget.FrameLayout
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.speech.tts.TextToSpeech
import android.util.Log
import android.os.Handler
import android.os.Looper
import android.os.CountDownTimer
import android.view.Gravity
import android.view.View
import android.Manifest
import android.widget.Toast
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.cardview.widget.CardView
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.*
import android.annotation.SuppressLint

class ARCameraDetectionActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private lateinit var previewView: PreviewView
    private lateinit var cameraExecutor: ExecutorService
    private lateinit var cameraProvider: ProcessCameraProvider
    private lateinit var imageCapture: ImageCapture
    private lateinit var imageAnalyzer: ImageAnalysis
    
    private var isDetecting = false
    private var isPaused = false
    private var currentDistance = "Unknown"
    private var currentObstacle = "None"
    
    companion object {
        private const val TAG = "ARCameraDetection"
        private const val REQUEST_CODE_PERMISSIONS = 10
        private val REQUIRED_PERMISSIONS = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO
        )
        
        val PRIMARY_DARK = Color.parseColor("#0F172A")
        val PRIMARY_MEDIUM = Color.parseColor("#1E293B")
        val ACCENT_EMERALD = Color.parseColor("#10B981")
        val ACCENT_ROSE = Color.parseColor("#F43F5E")
        val ACCENT_AMBER = Color.parseColor("#F59E0B")
        val SUCCESS_GREEN = Color.parseColor("#10B981")
        val WARNING_AMBER = Color.parseColor("#F59E0B")
        val DANGER_ROSE = Color.parseColor("#F43F5E")
        val SURFACE_WHITE = Color.parseColor("#FFFFFF")
        val SURFACE_DARK = Color.parseColor("#1F2937")
        val TEXT_PRIMARY = Color.parseColor("#1F2937")
        val TEXT_SECONDARY = Color.parseColor("#6B7280")
        val ACCENT_BLUE = Color.parseColor("#3B82F6")
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
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
        
        // Start Camera after UI is initialized
        if (allPermissionsGranted()) {
            startCamera()
        } else {
            ActivityCompat.requestPermissions(this, REQUIRED_PERMISSIONS, REQUEST_CODE_PERMISSIONS)
        }
        
        Handler(Looper.getMainLooper()).postDelayed({
            speak("AR Vision activated. Point camera for obstacle detection.")
        }, 800)
    }
    
    private fun createModernHeader(): CardView {
        val headerCard = CardView(this).apply {
            radius = 16f
            cardElevation = 8f
            setCardBackgroundColor(SURFACE_WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(0, 0, 0, 16) }
        }
        
        val headerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(20, 16, 20, 16)
        }
        
        val iconText = TextView(this).apply {
            text = "📷"
            textSize = 28f
            setTextColor(PRIMARY_DARK)
            setPadding(0, 0, 12, 0)
        }
        
        val textLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        
        textLayout.addView(TextView(this).apply {
            text = "AR Vision"
            textSize = 22f
            setTextColor(PRIMARY_DARK)
            setTypeface(null, android.graphics.Typeface.BOLD)
        })
        
        textLayout.addView(TextView(this).apply {
            text = "Smart Obstacle Detection"
            textSize = 12f
            setTextColor(TEXT_SECONDARY)
        })
        
        headerLayout.addView(iconText)
        headerLayout.addView(textLayout)
        headerCard.addView(headerLayout)
        
        return headerCard
    }
    
    private fun createModernCameraFrame(): CardView {
        val cameraCard = CardView(this).apply {
            radius = 20f
            cardElevation = 12f
            setCardBackgroundColor(Color.BLACK)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 400
            ).apply { setMargins(0, 0, 0, 16) }
        }
        
        val cameraLayout = FrameLayout(this)
        previewView = PreviewView(this)
        cameraLayout.addView(previewView)
        
        val overlayLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.TOP or Gravity.END
            setPadding(16, 16, 16, 16)
        }
        overlayLayout.addView(createLiveIndicator())
        cameraLayout.addView(overlayLayout)
        cameraCard.addView(cameraLayout)
        
        return cameraCard
    }
    
    private fun createLiveIndicator(): LinearLayout {
        return LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(12, 6, 12, 6)
            background = GradientDrawable().apply {
                setColor(PRIMARY_MEDIUM)
                cornerRadius = 20f
                alpha = 200
            }
            addView(TextView(this@ARCameraDetectionActivity).apply {
                text = "●"
                textSize = 12f
                setTextColor(SUCCESS_GREEN)
            })
            addView(TextView(this@ARCameraDetectionActivity).apply {
                text = "LIVE"
                textSize = 10f
                setTextColor(SUCCESS_GREEN)
                setTypeface(null, android.graphics.Typeface.BOLD)
                setPadding(4, 0, 0, 0)
            })
        }
    }
    
    private fun createDetectionStatusCard(): CardView {
        val statusCard = CardView(this).apply {
            radius = 16f
            cardElevation = 6f
            setCardBackgroundColor(SURFACE_DARK)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(0, 0, 0, 16) }
        }
        
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(20, 16, 20, 16)
        }
        
        layout.addView(TextView(this).apply {
            text = "🔍"
            textSize = 20f
            setPadding(0, 0, 12, 0)
        })
        
        layout.addView(TextView(this).apply {
            id = 1001
            text = "Detection Active - Scanning"
            textSize = 14f
            setTextColor(TEXT_PRIMARY)
            setTypeface(null, android.graphics.Typeface.BOLD)
        })
        
        statusCard.addView(layout)
        return statusCard
    }
    
    private fun createModernDistanceCard(): CardView {
        val card = CardView(this).apply {
            radius = 16f
            cardElevation = 6f
            setCardBackgroundColor(SURFACE_WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { setMargins(0, 0, 0, 16) }
        }
        
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(20, 16, 20, 16)
        }
        
        layout.addView(TextView(this).apply {
            text = "📏"
            textSize = 20f
            setPadding(0, 0, 12, 0)
        })
        
        val infoLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
        }
        infoLayout.addView(TextView(this).apply {
            text = "Nearest Obstacle"
            textSize = 12f
            setTextColor(TEXT_SECONDARY)
        })
        infoLayout.addView(TextView(this).apply {
            id = 1002
            text = "Scanning..."
            textSize = 16f
            setTextColor(ACCENT_AMBER)
            setTypeface(null, android.graphics.Typeface.BOLD)
        })
        
        layout.addView(infoLayout)
        card.addView(layout)
        return card
    }
    
    private fun createModernControlsCard(): CardView {
        val card = CardView(this).apply {
            radius = 16f
            cardElevation = 8f
            setCardBackgroundColor(SURFACE_WHITE)
        }
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(16, 16, 16, 16)
        }
        
        layout.addView(createModernControlButton("▶", "Start", SUCCESS_GREEN) { startDetection() })
        layout.addView(createModernControlButton("⏸", "Pause", WARNING_AMBER) { togglePauseDetection() })
        layout.addView(createModernControlButton("⏹", "Stop", DANGER_ROSE) { stopDetection() })
        
        card.addView(layout)
        return card
    }
    
    private fun createModernControlButton(icon: String, label: String, color: Int, onClick: () -> Unit): LinearLayout {
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(16, 12, 16, 12)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
                setMargins(4, 0, 4, 0)
            }
            background = GradientDrawable().apply {
                setColor(color)
                cornerRadius = 12f
            }
            setOnClickListener { onClick() }
            addView(TextView(this@ARCameraDetectionActivity).apply {
                text = icon
                textSize = 20f
                setTextColor(Color.WHITE)
            })
            addView(TextView(this@ARCameraDetectionActivity).apply {
                text = label
                textSize = 10f
                setTextColor(Color.WHITE)
                setTypeface(null, android.graphics.Typeface.BOLD)
            })
        }
    }
    
    private fun allPermissionsGranted() = REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(baseContext, it) == PackageManager.PERMISSION_GRANTED
    }
    
    @SuppressLint("MissingPermission")
    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()
            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }
            imageCapture = ImageCapture.Builder().build()
            imageAnalyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor, ObjectDetectionAnalyzer())
                }
            
            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    this as androidx.lifecycle.LifecycleOwner, 
                    CameraSelector.DEFAULT_BACK_CAMERA, 
                    preview, imageCapture, imageAnalyzer
                )
            } catch (exc: Exception) {
                Log.e(TAG, "Use case binding failed", exc)
            }
            
        }, ContextCompat.getMainExecutor(this))
    }
    
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            if (allPermissionsGranted()) startCamera()
            else {
                Toast.makeText(this, "Permissions not granted.", Toast.LENGTH_SHORT).show()
                finish()
            }
        }
    }
    
    private inner class ObjectDetectionAnalyzer : ImageAnalysis.Analyzer {
        override fun analyze(image: ImageProxy) {
            val rotationDegrees = image.imageInfo.rotationDegrees
            val detectedObject = detectObstaclesFromImage(image)
            
            runOnUiThread { updateDetectionUI(detectedObject) }
            image.close()
        }
        
        private fun detectObstaclesFromImage(image: ImageProxy): String {
            val obstacles = listOf("Chair", "Table", "Wall", "Door", "Person", "Vehicle")
            return if (Random().nextDouble() > 0.7) obstacles.random() else "None"
        }
    }
    
    private fun updateDetectionUI(detectedObject: String) {
        currentObstacle = detectedObject
        currentDistance = estimateDistance(detectedObject)
        
        findViewById<TextView>(1001)?.text = "Obstacle $currentDistance ahead."
        
        val warningText = findViewById<TextView>(1002)
        if (detectedObject != "None") {
            warningText?.text = "⚠️ $detectedObject detected at $currentDistance"
            warningText?.setTextColor(Color.parseColor("#DC2626"))
            speak("Warning: $detectedObject detected at $currentDistance")
        } else {
            warningText?.text = "No obstacles detected"
            warningText?.setTextColor(Color.parseColor("#059669"))
        }
    }
    
    private fun estimateDistance(objectName: String): String {
        val distances = mapOf(
            "Wall" to "1 meter", "Chair" to "2 meters", "Table" to "3 meters",
            "Door" to "2 meters", "Person" to "4 meters", "Vehicle" to "8 meters"
        )
        return distances[objectName] ?: "Unknown"
    }
    
    private fun startDetection() {
        isDetecting = true
        isPaused = false
        speak("AR detection started.")
        startDetectionSimulation()
    }

    private fun togglePauseDetection() {
        if (!isDetecting) return
        isPaused = !isPaused
        speak(if (isPaused) "Paused" else "Resumed")
    }

    private fun stopDetection() {
        isDetecting = false
        speak("AR detection stopped")
        finish()
    }

    private fun startDetectionSimulation() {
        if (!isDetecting) return
        val objects = listOf("Person", "Chair", "Table", "Wall", "Door")
        val distances = listOf("5 meters", "3 meters", "2 meters", "1 meter", "0.5 meters")

        val timer = object : CountDownTimer(6000, 6000) {
            override fun onTick(millisUntilFinished: Long) {}
            override fun onFinish() {
                if (isDetecting && !isPaused) {
                    val distanceText = findViewById<TextView>(1002)
                    val randomDistance = distances.random()
                    val randomObject = objects.random()
                    distanceText?.text = "Obstacle $randomDistance ahead."
                    if (randomDistance == "1 meter" || randomDistance == "0.5 meters") {
                        speak("Warning: $randomObject nearby!")
                    }
                    speak("$randomObject detected at $randomDistance.")
                    start()
                } else if (isDetecting) {
                    start()
                }
            }
        }
        timer.start()
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
        super.onDestroy()
        cameraExecutor.shutdown()
        if (::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }
    }
}
