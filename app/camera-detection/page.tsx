'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  CameraOff, 
  Play, 
  Pause, 
  Square, 
  ArrowLeft,
  Volume2,
  VolumeX,
  AlertTriangle,
  Eye,
  Users,
  Car,
  DoorOpen,
  Sofa
} from 'lucide-react'

interface Detection {
  class: string
  score: number
  bbox: [number, number, number, number]
}

interface ObstacleWarning {
  type: string
  distance: string
  direction: string
  urgency: 'low' | 'medium' | 'high'
}

export default function CameraDetectionPage() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [detections, setDetections] = useState<Detection[]>([])
  const [warnings, setWarnings] = useState<ObstacleWarning[]>([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [cameraError, setCameraError] = useState<string>('')
  const [modelLoaded, setModelLoaded] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const modelRef = useRef<any>(null)
  const animationFrameRef = useRef<number>()
  const lastWarningTimeRef = useRef<{ [key: string]: number }>({})

  useEffect(() => {
    loadModel()
    return () => {
      stopCamera()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const loadModel = async () => {
    try {
      // Load COCO-SSD model for object detection
      const cocoSsd = await import('@tensorflow-models/coco-ssd')
      const tf = await import('@tensorflow/tfjs')
      
      // Enable WebGL backend for better performance
      await tf.ready()
      
      const model = await cocoSsd.load()
      modelRef.current = model
      setModelLoaded(true)
    } catch (error) {
      console.error('Failed to load model:', error)
      setCameraError('Failed to load object detection model')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      
      setCameraError('')
    } catch (error) {
      console.error('Camera access error:', error)
      setCameraError('Unable to access camera. Please grant camera permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const getObstacleIcon = (className: string) => {
    switch (className.toLowerCase()) {
      case 'person':
        return <Users className="w-4 h-4" />
      case 'car':
      case 'truck':
      case 'bus':
        return <Car className="w-4 h-4" />
      case 'chair':
        return <Sofa className="w-4 h-4" />
      case 'door':
        return <DoorOpen className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getObstacleColor = (className: string) => {
    switch (className.toLowerCase()) {
      case 'person':
        return 'border-blue-500 bg-blue-100 text-blue-700'
      case 'car':
      case 'truck':
      case 'bus':
        return 'border-red-500 bg-red-100 text-red-700'
      case 'chair':
        return 'border-yellow-500 bg-yellow-100 text-yellow-700'
      case 'door':
        return 'border-purple-500 bg-purple-100 text-purple-700'
      default:
        return 'border-gray-500 bg-gray-100 text-gray-700'
    }
  }

  const estimateDistance = (bbox: [number, number, number, number]) => {
    const height = bbox[3] - bbox[1]
    const imageHeight = 480 // Approximate video height
    
    // Simple distance estimation based on object size in frame
    const relativeHeight = height / imageHeight
    
    if (relativeHeight > 0.4) return 'Very Close'
    if (relativeHeight > 0.2) return 'Close'
    if (relativeHeight > 0.1) return 'Medium'
    return 'Far'
  }

  const getDirection = (bbox: [number, number, number, number]) => {
    const centerX = (bbox[0] + bbox[2]) / 2
    const imageWidth = 640 // Approximate video width
    
    if (centerX < imageWidth * 0.3) return 'Left'
    if (centerX > imageWidth * 0.7) return 'Right'
    return 'Center'
  }

  const getUrgency = (className: string, distance: string) => {
    const highUrgencyClasses = ['person', 'car', 'truck', 'bus']
    const isHighUrgencyClass = highUrgencyClasses.includes(className.toLowerCase())
    const isClose = distance === 'Very Close' || distance === 'Close'
    
    if (isHighUrgencyClass && isClose) return 'high'
    if (isHighUrgencyClass || isClose) return 'medium'
    return 'low'
  }

  const generateWarning = useCallback((detection: Detection): ObstacleWarning => {
    const distance = estimateDistance(detection.bbox)
    const direction = getDirection(detection.bbox)
    const urgency = getUrgency(detection.class, distance)
    
    return {
      type: detection.class,
      distance,
      direction,
      urgency
    }
  }, [])

  const shouldAnnounceWarning = (warning: ObstacleWarning) => {
    const key = `${warning.type}-${warning.direction}`
    const now = Date.now()
    const lastTime = lastWarningTimeRef.current[key] || 0
    
    // Rate limit warnings based on urgency
    const cooldown = warning.urgency === 'high' ? 2000 : 
                    warning.urgency === 'medium' ? 5000 : 10000
    
    if (now - lastTime > cooldown) {
      lastWarningTimeRef.current[key] = now
      return true
    }
    return false
  }

  const detectObjects = useCallback(async () => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current || isPaused) return
    
    try {
      const predictions = await modelRef.current.detect(videoRef.current)
      
      // Filter for relevant obstacles
      const relevantClasses = ['person', 'car', 'truck', 'bus', 'chair', 'door', 'bicycle', 'motorcycle']
      const filteredPredictions = predictions.filter((p: any) =>
        relevantClasses.includes(p.class) && p.score > 0.5
      )
      
      setDetections(filteredPredictions)
      
      // Generate warnings
      const newWarnings = filteredPredictions.map(generateWarning)
      setWarnings(newWarnings)
      
      // Announce urgent warnings
      const urgentWarnings = newWarnings.filter((warning: any) => warning.urgency === 'high')
      if (urgentWarnings.length > 0) {
        const message = urgentWarnings.map((w: any) => w.message).join('. ')
        speak(`Warning: ${message}`)
      }
      
      // Draw bounding boxes
      drawBoundingBoxes(filteredPredictions)
      
    } catch (error) {
      console.error('Detection error:', error)
    }
    
    // Continue detection loop
    if (isDetecting && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(detectObjects)
    }
  }, [isDetecting, isPaused, generateWarning])

  const drawBoundingBoxes = (predictions: Detection[]) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw bounding boxes
    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox
      
      // Set color based on urgency
      const warning = generateWarning(prediction)
      let color = '#22c55e' // Default green
      if (warning.urgency === 'high') color = '#ef4444' // Red
      else if (warning.urgency === 'medium') color = '#f59e0b' // Yellow
      
      // Draw bounding box
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, width, height)
      
      // Draw label background
      ctx.fillStyle = color
      ctx.fillRect(x, y - 25, width, 25)
      
      // Draw label text
      ctx.fillStyle = 'white'
      ctx.font = '14px Arial'
      ctx.fillText(
        `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
        x + 5,
        y - 8
      )
    })
  }

  const startDetection = async () => {
    await startCamera()
    setIsDetecting(true)
    setIsPaused(false)
    speak('Camera detection started')
  }

  const pauseDetection = () => {
    setIsPaused(!isPaused)
    speak(isPaused ? 'Detection resumed' : 'Detection paused')
  }

  const stopDetection = () => {
    setIsDetecting(false)
    setIsPaused(false)
    setDetections([])
    setWarnings([])
    stopCamera()
    speak('Camera detection stopped')
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  useEffect(() => {
    if (isDetecting && !isPaused) {
      detectObjects()
    }
  }, [isDetecting, isPaused, detectObjects])

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
            <h1 className="text-xl font-semibold">AR Camera Detection</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg ${voiceEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
          >
            {voiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Camera View */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black rounded-xl shadow-lg overflow-hidden mb-4 relative"
          style={{ height: '400px' }}
        >
          {!isDetecting ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <CameraOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Camera not active</p>
                <p className="text-sm opacity-75 mt-2">Tap Start Detection to begin</p>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {isPaused && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Pause className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">Detection Paused</p>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Error Message */}
        {cameraError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-4"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{cameraError}</span>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-4"
        >
          <div className="grid grid-cols-3 gap-4">
            {!isDetecting ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startDetection}
                disabled={!modelLoaded}
                className={`col-span-3 btn-primary ${!modelLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Camera className="w-5 h-5 mr-2" />
                {modelLoaded ? 'Start Detection' : 'Loading Model...'}
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseDetection}
                  className="btn-accent"
                >
                  {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speak('Scanning surroundings')}
                  className="btn-secondary"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Scan
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopDetection}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-4 mb-4"
          >
            <h3 className="font-semibold mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              Obstacle Warnings
            </h3>
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 ${getObstacleColor(warning.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getObstacleIcon(warning.type)}
                      <span className="ml-2 font-medium capitalize">{warning.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{warning.direction}</div>
                      <div className="text-xs">{warning.distance}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Detection Info */}
        {detections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <h3 className="font-semibold mb-3">Detected Objects</h3>
            <div className="grid grid-cols-2 gap-2">
              {detections.map((detection, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{detection.class}</span>
                    <span className="text-xs text-gray-500">
                      {Math.round(detection.score * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
