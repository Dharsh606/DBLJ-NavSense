'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bluetooth, 
  BluetoothOff, 
  ArrowLeft,
  Search,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Volume2,
  Vibrate,
  RotateCcw,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface BluetoothDevice {
  id: string
  name: string
  connected: boolean
  signalStrength: number
  batteryLevel?: number
  deviceType: 'headphone' | 'speaker' | 'wearable' | 'sensor' | 'unknown'
  lastSeen: Date
}

export default function BluetoothPage() {
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<BluetoothDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null)
  const [bluetoothError, setBluetoothError] = useState('')

  useEffect(() => {
    checkBluetoothAvailability()
    return () => {
      if (isScanning) {
        stopScanning()
      }
    }
  }, [])

  const checkBluetoothAvailability = () => {
    if ('bluetooth' in navigator) {
      setIsBluetoothEnabled(true)
      loadSavedDevices()
    } else {
      setBluetoothError('Bluetooth is not supported in your browser')
      setIsBluetoothEnabled(false)
    }
  }

  const loadSavedDevices = () => {
    // Load previously paired devices from localStorage
    const savedDevices = localStorage.getItem('bluetoothDevices')
    if (savedDevices) {
      try {
        const parsed = JSON.parse(savedDevices)
        setDevices(parsed.map((d: any) => ({
          ...d,
          lastSeen: new Date(d.lastSeen)
        })))
      } catch (error) {
        console.error('Error loading saved devices:', error)
      }
    }
  }

  const saveDevices = (updatedDevices: BluetoothDevice[]) => {
    localStorage.setItem('bluetoothDevices', JSON.stringify(updatedDevices))
  }

  const startScanning = async () => {
    if (!('bluetooth' in navigator)) {
      setBluetoothError('Bluetooth is not supported in your browser')
      return
    }

    setIsScanning(true)
    setBluetoothError('')

    try {
      // Request Bluetooth device
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      })

      // Add device to list
      const newDevice: BluetoothDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: false,
        signalStrength: Math.floor(Math.random() * 100),
        deviceType: getDeviceType(device),
        lastSeen: new Date()
      }

      const updatedDevices = [...devices.filter(d => d.id !== device.id), newDevice]
      setDevices(updatedDevices)
      saveDevices(updatedDevices)

    } catch (error) {
      console.error('Bluetooth scanning error:', error)
      setBluetoothError('No devices found or scanning cancelled')
    } finally {
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  const getDeviceType = (device: any): 'headphone' | 'speaker' | 'wearable' | 'sensor' | 'unknown' => {
    const name = device.name?.toLowerCase() || ''
    
    if (name.includes('headphone') || name.includes('earbud') || name.includes('airpod')) {
      return 'headphone'
    }
    if (name.includes('speaker') || name.includes('sound')) {
      return 'speaker'
    }
    if (name.includes('watch') || name.includes('band') || name.includes('fitbit')) {
      return 'wearable'
    }
    if (name.includes('sensor') || name.includes('beacon')) {
      return 'sensor'
    }
    
    return 'unknown'
  }

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      // In a real implementation, this would connect to the actual Bluetooth device
      // For demo purposes, we'll simulate the connection
      
      const updatedDevices = devices.map(d => 
        d.id === device.id 
          ? { ...d, connected: true, signalStrength: Math.floor(Math.random() * 30) + 70 }
          : d
      )
      
      setDevices(updatedDevices)
      saveDevices(updatedDevices)
      setSelectedDevice(device)
      
      speak(`Connected to ${device.name}`)
      
    } catch (error) {
      console.error('Connection error:', error)
      setBluetoothError(`Failed to connect to ${device.name}`)
    }
  }

  const disconnectFromDevice = (device: BluetoothDevice) => {
    const updatedDevices = devices.map(d => 
      d.id === device.id 
        ? { ...d, connected: false, signalStrength: 0 }
        : d
    )
    
    setDevices(updatedDevices)
    saveDevices(updatedDevices)
    
    if (selectedDevice?.id === device.id) {
      setSelectedDevice(null)
    }
    
    speak(`Disconnected from ${device.name}`)
  }

  const testDevice = (device: BluetoothDevice) => {
    // Simulate device test
    speak(`Testing ${device.name}. Beep.`)
    
    // In a real implementation, this would send a test signal to the device
    setTimeout(() => {
      speak(`Test complete for ${device.name}`)
    }, 2000)
  }

  const removeDevice = (device: BluetoothDevice) => {
    const updatedDevices = devices.filter(d => d.id !== device.id)
    setDevices(updatedDevices)
    saveDevices(updatedDevices)
    
    if (selectedDevice?.id === device.id) {
      setSelectedDevice(null)
    }
    
    speak(`${device.name} removed from device list`)
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'headphone':
        return <Volume2 className="w-5 h-5" />
      case 'speaker':
        return <Volume2 className="w-5 h-5" />
      case 'wearable':
        return <Vibrate className="w-5 h-5" />
      case 'sensor':
        return <Wifi className="w-5 h-5" />
      default:
        return <Bluetooth className="w-5 h-5" />
    }
  }

  const getSignalStrengthColor = (strength: number) => {
    if (strength > 70) return 'text-green-500'
    if (strength > 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getBatteryIcon = (level?: number) => {
    if (!level) return <Battery className="w-4 h-4" />
    if (level > 50) return <Battery className="w-4 h-4 text-green-500" />
    if (level > 20) return <Battery className="w-4 h-4 text-yellow-500" />
    return <BatteryLow className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-gray-100 mr-3"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <img src="/logo.png" alt="DBLJ NavSense" className="w-7 h-7 mr-2" />
            <h1 className="text-xl font-semibold">Bluetooth Devices</h1>
          </div>
          <div className="flex items-center space-x-2">
            {isBluetoothEnabled ? (
              <Bluetooth className="w-6 h-6 text-blue-500" />
            ) : (
              <BluetoothOff className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Bluetooth Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isBluetoothEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
              )}
              <span className="font-medium">
                Bluetooth is {isBluetoothEnabled ? 'enabled' : 'disabled'}
              </span>
            </div>
            {isBluetoothEnabled && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isScanning ? stopScanning : startScanning}
                className={`btn-primary ${isScanning ? 'bg-red-500 hover:bg-red-600' : ''}`}
                disabled={isScanning}
              >
                <Search className="w-5 h-5 mr-2" />
                {isScanning ? 'Scanning...' : 'Scan for Devices'}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Error Message */}
        {bluetoothError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-4"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{bluetoothError}</span>
            </div>
          </motion.div>
        )}

        {/* Devices List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {devices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <BluetoothOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Devices Found</h3>
              <p className="text-gray-500 mb-4">
                {isBluetoothEnabled 
                  ? 'Tap "Scan for Devices" to find nearby Bluetooth devices'
                  : 'Bluetooth is not available on this device'
                }
              </p>
            </div>
          ) : (
            devices.map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-lg p-4 ${selectedDevice?.id === device.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${device.connected ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {getDeviceIcon(device.deviceType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{device.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">{device.deviceType}</span>
                        <div className="flex items-center">
                          <Wifi className={`w-4 h-4 mr-1 ${getSignalStrengthColor(device.signalStrength)}`} />
                          <span>{device.signalStrength}%</span>
                        </div>
                        {device.batteryLevel && (
                          <div className="flex items-center">
                            {getBatteryIcon(device.batteryLevel)}
                            <span className="ml-1">{device.batteryLevel}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {device.connected ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => testDevice(device)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => disconnectFromDevice(device)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Disconnect
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => connectToDevice(device)}
                        className="px-4 py-2 btn-primary"
                      >
                        Connect
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeDevice(device)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      <XCircle className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Selected Device Details */}
        {selectedDevice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mt-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Device Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Connection Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Signal Strength:</span>
                    <span className={getSignalStrengthColor(selectedDevice.signalStrength)}>
                      {selectedDevice.signalStrength}%
                    </span>
                  </div>
                  {selectedDevice.batteryLevel && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Battery:</span>
                      <span>{selectedDevice.batteryLevel}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Device Actions</h4>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => testDevice(selectedDevice)}
                    className="w-full btn-secondary"
                  >
                    Test Connection
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => disconnectFromDevice(selectedDevice)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Disconnect Device
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
