'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  CameraOff, 
  AlertTriangle, 
  Shield,
  Volume2,
  Eye,
  Navigation
} from 'lucide-react'
import { obstacleDetectionService, DetectedObject } from '@/lib/obstacle-detection'

export default function AdvancedCameraDetection() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [obstacles, setObstacles] = useState<DetectedObject[]>([])
  const [confidence, setConfidence] = useState(0)
  const [cameraActive, setCameraActive] = useState(false)
  const [detectionHistory, setDetectionHistory] = useState<DetectedObject[][]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Listen for obstacle detection events
  useEffect(() => {
    const handleObstacleDetection = (event: CustomEvent) => {
      const { obstacles: detectedObstacles, timestamp } = event.detail
      
      setObstacles(detectedObstacles)
      
      // Update confidence level
      const overallConfidence = obstacleDetectionService.calculateConfidence ? 
        obstacleDetectionService.calculateConfidence(detectedObstacles) : 0
      setConfidence(overallConfidence)
      
      // Add to history
      setDetectionHistory(prev => [...prev.slice(-9), detectedObstacles])
      
      // Voice feedback for critical obstacles
      const criticalObstacles = detectedObstacles.filter((obj: DetectedObject) => 
        ['person', 'car', 'bicycle', 'motorcycle'].includes(obj.class)
      )
      
      if (criticalObstacles.length > 0) {
        speakWarning(`Warning: ${criticalObstacles.map((obj: DetectedObject) => obj.class).join(', ')} detected nearby`)
      }
    }

    window.addEventListener('obstacleDetected', handleObstacleDetection as EventListener)
    
    return () => {
      window.removeEventListener('obstacleDetected', handleObstacleDetection as EventListener)
    }
  }, [])

  // Initialize AI model and camera
  const initializeDetection = async () => {
    try {
      setIsDetecting(true)
      
      // Initialize AI model
      await obstacleDetectionService.initializeModel()
      
      // Start camera detection
      if (videoRef.current) {
        await obstacleDetectionService.startDetection(videoRef.current)
        setCameraActive(true)
      }
      
      setIsDetecting(false)
    } catch (error) {
      console.error('Failed to initialize detection:', error)
      setIsDetecting(false)
      speakError('Failed to start obstacle detection. Please check camera permissions.')
    }
  }

  // Stop detection
  const stopDetection = () => {
    try {
      obstacleDetectionService.stopDetection()
      setCameraActive(false)
      setIsDetecting(false)
      speakInfo('Obstacle detection stopped')
    } catch (error) {
      console.error('Failed to stop detection:', error)
    }
  }

  // Voice feedback functions
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

  const speakInfo = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Get confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600'
    if (conf >= 0.6) return 'text-yellow-600'
    if (conf >= 0.4) return 'text-orange-600'
    return 'text-red-600'
  }

  // Get confidence level text
  const getConfidenceLevel = (conf: number) => {
    if (conf >= 0.8) return 'High'
    if (conf >= 0.6) return 'Medium'
    if (conf >= 0.4) return 'Low'
    return 'Very Low'
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
            <Eye className="w-8 h-8 mr-3" />
            AI Obstacle Detection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-300 text-lg max-w-2xl"
          >
            Advanced computer vision for real-time obstacle detection and navigation assistance
          </motion.p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Camera Feed */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-800 rounded-xl p-6 shadow-2xl"
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Camera className="w-6 h-6 mr-2" />
                Camera Feed
                {cameraActive && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="ml-2 w-3 h-3 bg-green-500 rounded-full"
                  />
                )}
              </h2>
              
              {/* Video Element */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Detection Overlay */}
                {obstacles.map((obstacle, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
                    style={{
                      left: `${(obstacle.bbox[0] / 640) * 100}%`,
                      top: `${(obstacle.bbox[1] / 480) * 100}%`,
                      width: `${((obstacle.bbox[2] - obstacle.bbox[0]) / 640) * 100}%`,
                      height: `${((obstacle.bbox[3] - obstacle.bbox[1]) / 480) * 100}%`,
                    }}
                  >
                    <div className="text-xs text-white font-semibold p-1 bg-red-600">
                      {obstacle.class}
                    </div>
                    <div className="text-xs text-white bg-red-700 px-1 py-0.5">
                      {Math.round(obstacle.score * 100)}% confidence
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Camera Controls */}
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={initializeDetection}
                disabled={isDetecting || cameraActive}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  cameraActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isDetecting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-5 h-5 mr-2"
                    >
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-pulse" />
                    </motion.div>
                    Initializing...
                  </>
                ) : cameraActive ? (
                  <>
                    <CameraOff className="w-5 h-5 mr-2" />
                    Stop Detection
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    Start Detection
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Detection Stats */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-gray-800 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2" />
              Detection Statistics
            </h2>
            
            <div className="space-y-4">
              {/* Confidence Level */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Confidence Level</h3>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getConfidenceColor(confidence)}`}>
                    {getConfidenceLevel(confidence)}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {confidence > 0 ? `${Math.round(confidence * 100)}%` : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3 mt-2">
                  <div 
                    className={`h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-300`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Obstacles Count */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Current Obstacles</h3>
                <div className="text-3xl font-bold text-white">
                  {obstacles.length}
                </div>
                <div className="text-gray-400 text-sm">
                  objects detected
                </div>
              </div>

              {/* Recent Detections */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Recent Detections</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {detectionHistory.length === 0 ? (
                    <p className="text-gray-400">No detections yet</p>
                  ) : (
                    detectionHistory.map((history, historyIndex) => (
                      <div key={historyIndex} className="bg-gray-600 rounded p-2">
                        <div className="text-xs text-gray-400">
                          {new Date(history[0]?.timestamp || 0).toLocaleTimeString()}
                        </div>
                        <div className="text-sm">
                          {history.map((obj, objIndex) => (
                            <div key={objIndex} className="flex items-center justify-between text-white">
                              <span className="font-medium">{obj.class}</span>
                              <span className="text-gray-400">
                                {Math.round(obj.score * 100)}% confidence
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Model Status */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-gray-800 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Volume2 className="w-6 h-6 mr-2" />
              AI Model Status
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">COCO-SSD Model</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    obstacleDetectionService.getStatus().isInitialized 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {obstacleDetectionService.getStatus().isInitialized ? 'Loaded' : 'Not Loaded'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Detection Status</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    obstacleDetectionService.getStatus().isDetecting 
                      ? 'bg-green-600 text-white animate-pulse' 
                      : 'bg-gray-600 text-white'
                  }`}>
                    {obstacleDetectionService.getStatus().isDetecting ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Processing</span>
                  <span className="text-sm text-gray-400">
                    Real-time AI analysis
                  </span>
                </div>
              </div>

              {/* Model Info */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Detection Classes</h3>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>• Person detection</div>
                  <div>• Vehicle detection (car, bicycle, motorcycle)</div>
                  <div>• Traffic signs and signals</div>
                  <div>• Everyday objects (chair, table, bottle)</div>
                  <div>• Electronic devices (phone, laptop)</div>
                </div>
              </div>
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
