'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Navigation, 
  Clock, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Download,
  RefreshCw,
  Settings,
  Eye
} from 'lucide-react'
import { gpsTrackingService, LocationPoint, LocationHistory } from '@/lib/gps-tracking'

export default function GPSTrackingPage() {
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null)
  const [analytics, setAnalytics] = useState(gpsTrackingService.getAnalytics())
  const [trackingMode, setTrackingMode] = useState<'navigation' | 'emergency' | 'exploration'>('navigation')
  const [trackingInterval, setTrackingInterval] = useState(30000) // 30 seconds

  // Listen for location updates
  useEffect(() => {
    const handleLocationUpdate = (event: CustomEvent) => {
      const { location, distance, accuracy } = event.detail
      
      setCurrentLocation(location)
      setAnalytics(gpsTrackingService.getAnalytics())
      
      // Voice feedback for location updates
      if (distance > 5) {
        speakLocation(`Moved ${Math.round(distance)} meters. Accuracy: ${accuracy.toFixed(0)} meters.`)
      }
    }

    window.addEventListener('locationUpdate', handleLocationUpdate as EventListener)
    
    return () => {
      window.removeEventListener('locationUpdate', handleLocationUpdate as EventListener)
    }
  }, [])

  // Initialize location data
  useEffect(() => {
    const status = gpsTrackingService.getStatus()
    setAnalytics(gpsTrackingService.getAnalytics())
  }, [])

  // Voice feedback functions
  const speakInfo = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const speakWarning = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const speakError = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 0.8
      utterance.pitch = 0.8
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const speakLocation = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Start GPS tracking
  const startTracking = async () => {
    try {
      setIsTracking(true)
      await gpsTrackingService.startTracking((error) => {
        console.error('GPS tracking error:', error)
        speakError(`Failed to start GPS tracking: ${error instanceof Error ? error.message : 'Unknown error'}`)
      })
      
      setAnalytics(gpsTrackingService.getAnalytics())
      const status = gpsTrackingService.getStatus()
      speakInfo('GPS tracking started successfully')
      
    } catch (error) {
      console.error('Failed to start GPS tracking:', error)
      setIsTracking(false)
      speakError(`Failed to start GPS tracking: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Stop GPS tracking
  const stopTracking = () => {
    try {
      gpsTrackingService.stopTracking()
      setIsTracking(false)
      setAnalytics(gpsTrackingService.getAnalytics())
      speakInfo('GPS tracking stopped')
      
    } catch (error) {
      console.error('Failed to stop GPS tracking:', error)
      speakError(`Failed to stop GPS tracking: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Clear location history
  const clearHistory = () => {
    try {
      gpsTrackingService.clearHistory()
      speakInfo('Location history cleared')
      
    } catch (error) {
      console.error('Failed to clear history:', error)
      speakError(`Failed to clear history: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Export location history
  const exportHistory = () => {
    try {
      gpsTrackingService.exportHistory()
      speakInfo('Location history exported successfully')
      
    } catch (error) {
      console.error('Failed to export history:', error)
      speakError(`Failed to export history: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`
    } else {
      return `${(meters / 1000).toFixed(2)} km`
    }
  }

  // Format time for display
  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m`
    } else {
      return `${seconds}s`
    }
  }

  // Format speed for display
  const formatSpeed = (kmh: number): string => {
    return `${kmh.toFixed(1)} km/h`
  }

  // Get speed color based on value
  const getSpeedColor = (speed: number): string => {
    if (speed > 15) return 'text-red-600'
    if (speed > 10) return 'text-orange-600'
    if (speed > 5) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold text-white mb-4 flex items-center justify-center"
          >
            <MapPin className="w-8 h-8 mr-3" />
            GPS Tracking & Analytics
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-300 text-lg max-w-2xl"
          >
            Advanced real-time GPS tracking with location history and analytics
          </motion.p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Current Location */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-800 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Navigation className="w-6 h-6 mr-2" />
              Current Location
              {isTracking && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="ml-2 w-3 h-3 bg-green-500 rounded-full"
                />
              )}
            </h2>
            
            {/* Location Display */}
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              {currentLocation ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {currentLocation.latitude.toFixed(6)}°, {currentLocation.longitude.toFixed(6)}°
                  </div>
                  <div className="text-gray-300 text-sm">
                    Accuracy: {currentLocation.accuracy.toFixed(0)}m
                    {currentLocation.speed !== undefined && (
                      <>
                        Speed: {formatSpeed(currentLocation.speed)}
                        {currentLocation.heading !== undefined && (
                          <> • Heading: {currentLocation.heading.toFixed(0)}°</>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-lg mb-2">No GPS Signal</div>
                  <div className="text-sm">Waiting for location...</div>
                </div>
              )}
            </div>

            {/* Tracking Controls */}
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startTracking}
                disabled={isTracking}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  isTracking 
                    ? 'bg-gray-600 text-gray-400' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Tracking
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearHistory}
                className="flex items-center px-6 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Clear History
              </motion.button>
            </div>
          </motion.div>

          {/* Location Analytics */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-gray-800 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              Location Analytics
            </h2>
            
            <div className="space-y-4">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Trip Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Distance</span>
                      <span className="text-2xl font-bold text-white">{formatDistance(analytics.totalDistance)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Time</span>
                      <span className="text-2xl font-bold text-white">{formatDuration(analytics.totalTime)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Speed</span>
                      <span className={`text-2xl font-bold ${getSpeedColor(analytics.averageSpeed)}`}>
                        {formatSpeed(analytics.averageSpeed)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Max Speed</span>
                      <span className={`text-2xl font-bold ${getSpeedColor(analytics.maxSpeed)}`}>
                        {formatSpeed(analytics.maxSpeed)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Session Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Locations Visited</span>
                      <span className="text-2xl font-bold text-white">{analytics.locationsVisited}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Emergency Alerts</span>
                      <span className="text-2xl font-bold text-red-400">{analytics.emergencyAlerts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-lg text-white">
                        {analytics.lastLocation ? new Date(analytics.lastLocation.timestamp).toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Mode Selection */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Tracking Mode</h3>
                <div className="space-y-2">
                  {['navigation', 'emergency', 'exploration'].map(mode => (
                    <label key={mode} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="trackingMode"
                        value={mode}
                        checked={trackingMode === mode}
                        onChange={(e) => setTrackingMode(e.target.value as any)}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-white capitalize">
                        {mode === 'navigation' && <Navigation className="w-5 h-5 mr-2" />}
                        {mode === 'emergency' && <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />}
                        {mode === 'exploration' && <Activity className="w-5 h-5 mr-2 text-blue-500" />}
                        <span className="ml-2">{mode}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Update Interval */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Update Interval</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">Voice updates every</span>
                  <select
                    value={trackingInterval}
                    onChange={(e) => setTrackingInterval(Number(e.target.value))}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    <option value={5000}>5 seconds</option>
                    <option value={10000}>30 seconds</option>
                    <option value={30000}>5 minutes</option>
                    <option value={60000}>10 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Location History */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-gray-800 rounded-xl p-6 shadow-2xl lg:col-span-2"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
              <Clock className="w-6 h-6 mr-2" />
              Location History
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportHistory}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Export History
              </motion.button>
            </h2>
            
            {/* History List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(() => {
                const status = gpsTrackingService.getStatus()
                const history = status.history
                if (history.length === 0) {
                  return (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-lg">No location history yet</div>
                      <div className="text-sm">Start tracking to build your history</div>
                    </div>
                  )
                }
                return history.slice().reverse().map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-700 rounded-lg p-4 mb-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-medium capitalize">
                          {entry.purpose}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {new Date(entry.startTime).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => gpsTrackingService.deleteHistoryEntry(entry.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="text-white text-sm mb-2">
                      Distance: {formatDistance(entry.distance)}
                    </div>
                    <div className="text-white text-sm">
                      Locations: {entry.locations.length}
                    </div>
                    
                    {/* Location Points */}
                    {entry.locations.map((location, locIndex) => (
                      <div key={locIndex} className="bg-gray-600 rounded p-2 mb-1">
                        <div className="text-xs text-gray-400">
                          {new Date(location.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-sm text-white">
                          {location.latitude.toFixed(6)}°, {location.longitude.toFixed(6)}°
                          {location.speed && (
                            <span className="text-gray-400 ml-2">
                              {formatSpeed(location.speed)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ))
              })()}
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="fixed bottom-4 right-4"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg"
          >
            <Navigation className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
