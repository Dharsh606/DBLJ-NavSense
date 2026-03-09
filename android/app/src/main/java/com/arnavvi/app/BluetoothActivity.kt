package com.arnavvi.app

import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
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
import android.Manifest
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.util.*

class BluetoothActivity : Activity(), TextToSpeech.OnInitListener {
    
    private lateinit var tts: TextToSpeech
    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bluetoothManager: BluetoothManager? = null
    private var bluetoothLeScanner: BluetoothLeScanner? = null
    
    private var bluetoothEnabled = false
    private var isScanning = false
    private var deviceConnected = false
    private var currentDeviceName = "No Device Connected"
    private var discoveredDevices = mutableListOf<BluetoothDevice>()
    private var connectedDevice: BluetoothDevice? = null

    // UI View References
    private var bluetoothStatusTextView: TextView? = null
    private var deviceNameTextView: TextView? = null
    private var connectionStrengthTextView: TextView? = null
    private var batteryLevelTextView: TextView? = null
    private var statusCardLayout: LinearLayout? = null
    
    companion object {
        private const val REQUEST_BLUETOOTH_PERMISSION = 300
        private const val REQUEST_ENABLE_BLUETOOTH = 301
        private val BLUETOOTH_PERMISSIONS = arrayOf(
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_ADMIN,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.ACCESS_FINE_LOCATION
        )
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            // Check and request Bluetooth permissions
            if (!checkBluetoothPermissions()) {
                ActivityCompat.requestPermissions(
                    this, 
                    BLUETOOTH_PERMISSIONS, 
                    REQUEST_BLUETOOTH_PERMISSION
                )
                // We'll continue initialization in onRequestPermissionsResult if granted
            }
            
            // Initialize Text-to-Speech
            tts = TextToSpeech(this, this)
            
            // Initialize Bluetooth services
            initializeBluetoothServices()
            
            // Create main layout with premium gradient background
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
            
            // Title Card
            val titleCard = createTitleCard()
            
            // Connection Status Card
            val statusCard = createConnectionStatusCard()
            
            // Primary Buttons Section
            val buttonsSection = createPrimaryButtonsSection()
            
            // Device List Section
            val deviceListSection = createDeviceListSection()
            
            // Device Control Panel (shown when device connected)
            val controlPanel = createDeviceControlPanel()
            controlPanel.visibility = View.GONE
            
            // Alert Panel
            val alertPanel = createAlertPanel()
            alertPanel.visibility = View.GONE
            
            // Emergency Test Button
            val emergencyButton = createEmergencyTestButton()
            
            // Back Button
            val backButton = createBackButton()
            
            // Add all views to main layout
            mainLayout.addView(titleCard)
            mainLayout.addView(statusCard)
            mainLayout.addView(buttonsSection)
            mainLayout.addView(deviceListSection)
            mainLayout.addView(controlPanel)
            mainLayout.addView(alertPanel)
            mainLayout.addView(emergencyButton)
            mainLayout.addView(backButton)
            
            setContentView(mainLayout)
            
            // Welcome message
            Handler(Looper.getMainLooper()).postDelayed({
                speak("Bluetooth management screen ready. Manage your device connections here.")
            }, 800)
            
            updateUI()
            
        } catch (e: Exception) {
            Log.e("BluetoothActivity", "Error in onCreate: ${e.message}", e)
            Toast.makeText(this, "Error initializing Bluetooth screen", Toast.LENGTH_LONG).show()
            finish() 
        }
    }
    
    private fun createTitleCard(): LinearLayout {
        val titleCard = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(25, 20, 25, 20)
            
            val cardGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 20f
                setStroke(2, Color.parseColor("#EA580C"))
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
            text = "🔗 Bluetooth Device Dashboard"
            textSize = 28f
            setTextColor(Color.parseColor("#7C2D12"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 8)
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        titleCard.addView(title)
        return titleCard
    }
    
    private fun createConnectionStatusCard(): LinearLayout {
        statusCardLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(25, 25, 25, 25)
            
            val cardGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(3, Color.parseColor("#DC2626")) 
                alpha = 230
            }
            background = cardGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        bluetoothStatusTextView = TextView(this).apply {
            text = "🔴 Bluetooth: OFF"
            textSize = 22f
            setTextColor(Color.parseColor("#DC2626"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        deviceNameTextView = TextView(this).apply {
            text = "Device: $currentDeviceName"
            textSize = 18f
            setTextColor(Color.parseColor("#374151"))
            gravity = Gravity.CENTER
            setPadding(0, 8, 0, 8)
        }
        
        connectionStrengthTextView = TextView(this).apply {
            text = "Signal: No Signal"
            textSize = 16f
            setTextColor(Color.parseColor("#6B7280"))
            gravity = Gravity.CENTER
        }
        
        batteryLevelTextView = TextView(this).apply {
            text = "Battery: --"
            textSize = 16f
            setTextColor(Color.parseColor("#6B7280"))
            gravity = Gravity.CENTER
        }
        
        statusCardLayout?.addView(bluetoothStatusTextView)
        statusCardLayout?.addView(deviceNameTextView)
        statusCardLayout?.addView(connectionStrengthTextView)
        statusCardLayout?.addView(batteryLevelTextView)
        
        return statusCardLayout!!
    }
    
    private fun createPrimaryButtonsSection(): LinearLayout {
        val buttonsLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val row1 = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 10)
        }
        
        val bluetoothToggle = createPrimaryButton("🔵 Turn Bluetooth ON", 
            intArrayOf(Color.parseColor("#3B82F6"), Color.parseColor("#2563EB"))) {
            toggleBluetooth()
        }
        
        val scanButton = createPrimaryButton("🔍 Scan for Devices", 
            intArrayOf(Color.parseColor("#10B981"), Color.parseColor("#059669"))) {
            startRealBluetoothScan()
        }
        
        row1.addView(bluetoothToggle)
        row1.addView(scanButton)
        
        val row2 = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }
        
        val connectButton = createPrimaryButton("🔗 Connect Device", 
            intArrayOf(Color.parseColor("#8B5CF6"), Color.parseColor("#7C3AED"))) {
            connectToDemoDevice()
        }
        
        val disconnectButton = createPrimaryButton("❌ Disconnect", 
            intArrayOf(Color.parseColor("#EF4444"), Color.parseColor("#DC2626"))) {
            disconnectFromDevice()
        }
        
        row2.addView(connectButton)
        row2.addView(disconnectButton)
        
        buttonsLayout.addView(row1)
        buttonsLayout.addView(row2)
        
        return buttonsLayout
    }
    
    private fun createDeviceListSection(): LinearLayout {
        val deviceListLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val sectionTitle = TextView(this).apply {
            text = "📱 Available Devices"
            textSize = 20f
            setTextColor(Color.parseColor("#FFFFFF"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 15)
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        val deviceList = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            
            addView(createDeviceCard("Smart Walking Cane", "Strong", "Available"))
            addView(createDeviceCard("Wearable Sensor", "Medium", "Available"))
            addView(createDeviceCard("Obstacle Detector", "Weak", "Available"))
        }
        
        deviceListLayout.addView(sectionTitle)
        deviceListLayout.addView(deviceList)
        
        return deviceListLayout
    }
    
    private fun createDeviceCard(deviceName: String, signal: String, status: String): LinearLayout {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(20, 15, 20, 15)
            
            val cardGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 12f
                setStroke(2, Color.parseColor("#D1D5DB"))
                alpha = 200
            }
            background = cardGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 5, 0, 5)
            layoutParams = params
        }
        
        val deviceInfo = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.START
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f)
        }
        
        val nameText = TextView(this).apply {
            text = deviceName
            textSize = 18f
            setTextColor(Color.parseColor("#1F2937"))
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        val signalText = TextView(this).apply {
            text = "Signal: $signal"
            textSize = 14f
            setTextColor(Color.parseColor("#6B7280"))
        }
        
        val statusText = TextView(this).apply {
            text = "Status: $status"
            textSize = 14f
            setTextColor(Color.parseColor("#059669"))
        }
        
        deviceInfo.addView(nameText)
        deviceInfo.addView(signalText)
        deviceInfo.addView(statusText)
        
        val connectButton = Button(this).apply {
            text = "Connect"
            setTextColor(Color.WHITE)
            textSize = 14f
            setPadding(20, 10, 20, 10)
            setOnClickListener {
                connectToDeviceByName(deviceName)
            }
            
            val btnGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#10B981"))
                cornerRadius = 8f
            }
            background = btnGradient
        }
        
        card.addView(deviceInfo)
        card.addView(connectButton)
        
        return card
    }
    
    private fun createDeviceControlPanel(): LinearLayout {
        val controlPanel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            
            val panelGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FFFFFF"))
                cornerRadius = 15f
                setStroke(2, Color.parseColor("#10B981"))
                alpha = 230
            }
            background = panelGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val panelTitle = TextView(this).apply {
            text = "🎮 Device Controls"
            textSize = 20f
            setTextColor(Color.parseColor("#064E3B"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 15)
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        val controlsRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }
        
        controlsRow.addView(createControlButton("▶️ Activate", Color.parseColor("#10B981")) { speak("Device activated") })
        controlsRow.addView(createControlButton("⏸️ Deactivate", Color.parseColor("#F59E0B")) { speak("Device deactivated") })
        controlsRow.addView(createControlButton("🎯 Calibrate", Color.parseColor("#8B5CF6")) { speak("Device calibration started") })
        controlsRow.addView(createControlButton("🔔 Test Alert", Color.parseColor("#EF4444")) { speak("Testing device alert") })
        
        controlPanel.addView(panelTitle)
        controlPanel.addView(controlsRow)
        
        return controlPanel
    }
    
    private fun createControlButton(text: String, color: Int, onClick: () -> Unit): Button {
        return Button(this).apply {
            this.text = text
            textSize = 14f
            setTextColor(Color.WHITE)
            setPadding(15, 12, 15, 12)
            setOnClickListener { onClick() }
            
            val btnGradient = GradientDrawable().apply {
                setColor(color)
                cornerRadius = 8f
            }
            background = btnGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(5, 0, 5, 0)
            layoutParams = params
        }
    }
    
    private fun createAlertPanel(): LinearLayout {
        val alertPanel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 15, 20, 15)
            
            val alertGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#FEF3C7"))
                cornerRadius = 12f
                setStroke(2, Color.parseColor("#F59E0B"))
                alpha = 230
            }
            background = alertGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
        }
        
        val alertTitle = TextView(this).apply {
            text = "⚠️ Device Alert"
            textSize = 18f
            setTextColor(Color.parseColor("#92400E"))
            gravity = Gravity.CENTER
            setTypeface(null, android.graphics.Typeface.BOLD)
        }
        
        val alertMessage = TextView(this).apply {
            text = "No active alerts"
            textSize = 16f
            setTextColor(Color.parseColor("#78350F"))
            gravity = Gravity.CENTER
            setPadding(0, 8, 0, 0)
        }
        
        alertPanel.addView(alertTitle)
        alertPanel.addView(alertMessage)
        
        return alertPanel
    }
    
    private fun createEmergencyTestButton(): Button {
        return Button(this).apply {
            text = "🆘 EMERGENCY TEST"
            textSize = 20f
            setTextColor(Color.WHITE)
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(40, 25, 40, 25)
            
            val emergencyGradient = GradientDrawable().apply {
                setColor(Color.parseColor("#DC2626"))
                cornerRadius = 15f
                setStroke(3, Color.parseColor("#FFFFFF"))
            }
            background = emergencyGradient
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(0, 0, 0, 20)
            layoutParams = params
            
            setOnClickListener {
                speak("Emergency test activated. Device vibration and alert test initiated.")
            }
        }
    }
    
    private fun createBackButton(): Button {
        return Button(this).apply {
            text = "⬅️ Back to Dashboard"
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
    
    private fun createPrimaryButton(text: String, colors: IntArray, onClick: () -> Unit): Button {
        return Button(this).apply {
            this.text = text
            textSize = 16f
            setTextColor(Color.WHITE)
            setTypeface(null, android.graphics.Typeface.BOLD)
            
            val gradient = GradientDrawable().apply {
                this.colors = colors
                gradientType = GradientDrawable.LINEAR_GRADIENT
                cornerRadius = 25f
                setStroke(2, Color.parseColor("#FFFFFF"))
            }
            background = gradient
            
            setPadding(25, 20, 25, 20)
            
            val params = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f)
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
                speak(text)
            }
        }
    }
    
    private fun toggleBluetooth() {
        bluetoothEnabled = !bluetoothEnabled
        speak(if (bluetoothEnabled) "Bluetooth turned on" else "Bluetooth turned off")
        updateUI()
    }
    
    private fun connectToDemoDevice() {
        if (!bluetoothEnabled) {
            speak("Please turn on Bluetooth first")
            return
        }
        
        deviceConnected = true
        currentDeviceName = "Smart Walking Cane"
        speak("Connected to $currentDeviceName")
        updateUI()
    }
    
    private fun connectToDeviceByName(deviceName: String) {
        if (!bluetoothEnabled) {
            speak("Please turn on Bluetooth first")
            return
        }
        deviceConnected = true
        currentDeviceName = deviceName
        speak("Connected to $deviceName")
        updateUI()
    }
    
    private fun speak(text: String) {
        try {
            if (::tts.isInitialized) {
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
            }
        } catch (e: Exception) {
            Log.e("BluetoothActivity", "Error in TTS: ${e.message}", e)
        }
    }
    
    private fun checkBluetoothPermissions(): Boolean {
        return BLUETOOTH_PERMISSIONS.all { permission ->
            ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
        }
    }
    
    private fun initializeBluetoothServices() {
        try {
            if (!checkBluetoothPermissions()) {
                Log.w("Bluetooth", "Permissions not granted, skipping initialization")
                return
            }
            
            val manager = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
            bluetoothManager = manager
            
            if (manager == null) {
                Log.e("Bluetooth", "BluetoothManager not available")
                speak("Bluetooth not supported on this device")
                return
            }
            
            val adapter = manager.adapter
            bluetoothAdapter = adapter
            
            if (adapter == null) {
                Log.e("Bluetooth", "BluetoothAdapter not available")
                speak("Bluetooth not supported on this device")
                return
            }
            
            bluetoothLeScanner = adapter.bluetoothLeScanner
            
            if (adapter.isEnabled) {
                bluetoothEnabled = true
                speak("Bluetooth enabled and ready")
            } else {
                speak("Please enable Bluetooth to use this feature")
                showEnableBluetoothDialog()
            }
            
        } catch (e: Exception) {
            Log.e("Bluetooth", "Error initializing Bluetooth: ${e.message}", e)
            speak("Error initializing Bluetooth services")
        }
    }
    
    private val leScanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            try {
                val device = result.device
                if (!discoveredDevices.contains(device)) {
                    discoveredDevices.add(device)
                    runOnUiThread {
                        speak("Found device: ${device.name ?: "Unknown"}")
                        updateDeviceList(device)
                    }
                }
            } catch (e: SecurityException) {
                Log.e("Bluetooth", "Permission denied in scan callback")
            }
        }
        
        override fun onScanFailed(errorCode: Int) {
            Log.e("Bluetooth", "BLE scan failed with error: $errorCode")
            runOnUiThread {
                speak("Bluetooth scan failed")
                isScanning = false
                updateUI()
            }
        }
    }
    
    private fun startRealBluetoothScan() {
        if (!checkBluetoothPermissions()) {
            speak("Bluetooth permissions required")
            return
        }
        
        val adapter = bluetoothAdapter
        val scanner = bluetoothLeScanner
        
        if (adapter == null || !adapter.isEnabled) {
            speak("Please enable Bluetooth first")
            return
        }
        
        if (scanner == null) {
            speak("BLE scanner not available")
            return
        }
        
        if (isScanning) {
            speak("Already scanning for devices")
            return
        }
        
        try {
            discoveredDevices.clear()
            scanner.startScan(leScanCallback)
            isScanning = true
            speak("Scanning for Bluetooth devices")
            updateUI()
            
            Handler(Looper.getMainLooper()).postDelayed({
                if (isScanning) {
                    stopRealBluetoothScan()
                }
            }, 30000)
            
        } catch (e: SecurityException) {
            Log.e("Bluetooth", "Security exception during scan", e)
            speak("Permission denied for Bluetooth scanning")
        } catch (e: Exception) {
            Log.e("Bluetooth", "Error starting scan", e)
            speak("Error starting Bluetooth scan")
        }
    }
    
    private fun stopRealBluetoothScan() {
        if (!isScanning) return
        
        try {
            bluetoothLeScanner?.stopScan(leScanCallback)
            isScanning = false
            speak("Bluetooth scan stopped")
            updateUI()
        } catch (e: Exception) {
            Log.e("Bluetooth", "Error stopping scan", e)
        }
    }
    
    private fun connectToDevice(device: BluetoothDevice) {
        if (!checkBluetoothPermissions()) {
            speak("Bluetooth permissions required")
            return
        }
        
        try {
            connectedDevice = device
            currentDeviceName = device.name ?: "Unknown Device"
            speak("Connecting to $currentDeviceName")
            
            Handler(Looper.getMainLooper()).postDelayed({
                speak("Connected to $currentDeviceName")
                deviceConnected = true
                updateUI()
            }, 2000)
            
        } catch (e: SecurityException) {
            Log.e("Bluetooth", "Security exception during connection", e)
            speak("Permission denied for device connection")
        } catch (e: Exception) {
            Log.e("Bluetooth", "Error connecting to device", e)
            speak("Error connecting to device")
        }
    }
    
    private fun disconnectFromDevice() {
        connectedDevice = null
        deviceConnected = false
        currentDeviceName = "No Device Connected"
        speak("Device disconnected")
        updateUI()
    }
    
    private fun updateDeviceList(device: BluetoothDevice) {
        try {
            Log.d("Bluetooth", "Discovered: ${device.name} - ${device.address}")
        } catch (e: SecurityException) {
            Log.e("Bluetooth", "Permission denied getting device info")
        }
    }
    
    private fun showEnableBluetoothDialog() {
        AlertDialog.Builder(this)
            .setTitle("Enable Bluetooth")
            .setMessage("Bluetooth is required for this feature. Would you like to enable it?")
            .setPositiveButton("Enable") { _, _ ->
                try {
                    val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
                    startActivityForResult(enableBtIntent, REQUEST_ENABLE_BLUETOOTH)
                } catch (e: SecurityException) {
                    speak("Permission denied to enable Bluetooth")
                }
            }
            .setNegativeButton("Cancel") { _, _ ->
                speak("Bluetooth feature cancelled")
            }
            .show()
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_ENABLE_BLUETOOTH) {
            if (resultCode == Activity.RESULT_OK) {
                bluetoothEnabled = true
                speak("Bluetooth enabled successfully")
                updateUI()
            } else {
                speak("Bluetooth enable request denied")
            }
        }
    }
    
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_BLUETOOTH_PERMISSION) {
            if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                initializeBluetoothServices()
            } else {
                Toast.makeText(this, "Bluetooth permissions required", Toast.LENGTH_LONG).show()
                finish()
            }
        }
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

    private fun updateUI() {
        try {
            bluetoothStatusTextView?.apply {
                if (bluetoothEnabled) {
                    text = "🟢 Bluetooth: ON"
                    setTextColor(Color.parseColor("#10B981"))
                } else {
                    text = "🔴 Bluetooth: OFF"
                    setTextColor(Color.parseColor("#DC2626"))
                }
            }
            
            statusCardLayout?.let { card ->
                val cardGradient = GradientDrawable().apply {
                    setColor(Color.parseColor("#FFFFFF"))
                    cornerRadius = 15f
                    setStroke(3, if (bluetoothEnabled) Color.parseColor("#10B981") else Color.parseColor("#DC2626"))
                    alpha = 230
                }
                card.background = cardGradient
            }
            
            deviceNameTextView?.text = "Device: $currentDeviceName"
            
            if (deviceConnected) {
                connectionStrengthTextView?.text = "Signal: Strong"
                batteryLevelTextView?.text = "Battery: 85%"
            } else {
                connectionStrengthTextView?.text = "Signal: No Signal"
                batteryLevelTextView?.text = "Battery: --"
            }

        } catch (e: Exception) {
            Log.e("BluetoothActivity", "Error updating UI: ${e.message}", e)
        }
    }
}
