// AI-Powered Obstacle Detection Service
// Uses TensorFlow.js and COCO-SSD model for real-time object detection

import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

export interface DetectedObject {
  class: string
  score: number
  bbox: [number, number, number, number] // [x, y, width, height]
  timestamp: number
}

export interface DetectionResult {
  objects: DetectedObject[]
  timestamp: number
  confidence: number
}

class ObstacleDetectionService {
  private model: cocoSsd.ObjectDetection | null = null
  private isInitialized: boolean = false
  private isDetecting: boolean = false
  private lastWarningAt = 0
  private warningCooldownMs = 2500

  constructor() {
    this.model = null
    this.isInitialized = false
    this.isDetecting = false
  }

  // Initialize the AI model
  async initializeModel(): Promise<void> {
    if (this.isInitialized && this.model) return
    try {
      console.log('Loading COCO-SSD model...')
      this.model = await cocoSsd.load({ base: 'mobilenet_v2' })
      this.isInitialized = true
      console.log('Model loaded successfully')
    } catch (error) {
      console.error('Failed to load model:', error)
      throw new Error('Failed to initialize obstacle detection model')
    }
  }

  // Start camera and begin detection
  async startDetection(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.isInitialized || !this.model) {
      throw new Error('Model not initialized')
    }

    if (this.isDetecting) {
      return
    }

    this.isDetecting = true

    try {
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })

      videoElement.srcObject = stream

      // Process video frames for obstacle detection
      await videoElement.play()
      this.processVideoFrames(videoElement)
    } catch (error) {
      console.error('Failed to start camera:', error)
      this.isDetecting = false
      throw error
    }
  }

  // Process video frames for real-time detection
  private async processVideoFrames(videoElement: HTMLVideoElement): Promise<void> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 640
    canvas.height = 480

    const detectFrame = async () => {
      if (!this.isDetecting || !this.model) return

      // Draw video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
      
      const detections = await this.model.detect(canvas)
      const obstacles = this.processDetections(detections)
      
      // Send results to main app
      this.notifyObstacles(obstacles)
      
      // Continue detection
      requestAnimationFrame(detectFrame)
    }

    // Start detection loop
    detectFrame()
  }

  // Process AI detection results
  private processDetections(detections: cocoSsd.DetectedObject[]): DetectedObject[] {
    const obstacles: DetectedObject[] = []
    
    // Filter for relevant obstacles for visually impaired users
    const relevantClasses = [
      'person', 'car', 'bicycle', 'motorcycle', 'bus', 'truck',
      'traffic light', 'stop sign', 'bench', 'chair', 'cup',
      'bottle', 'cell phone', 'book', 'laptop', 'backpack'
    ]

    for (const detection of detections) {
      const className = detection.class
      const score = detection.score
      const bbox = detection.bbox

      // Only consider high-confidence detections
      if (score > 0.5 && relevantClasses.includes(className)) {
        obstacles.push({
          class: className,
          score,
          bbox: [bbox[0], bbox[1], bbox[2], bbox[3]],
          timestamp: Date.now()
        })
      }
    }

    return obstacles
  }

  // Notify main app of detected obstacles
  private notifyObstacles(obstacles: DetectedObject[]): void {
    // Create custom event for obstacle detection
    const event = new CustomEvent('obstacleDetected', {
      detail: {
        obstacles,
        timestamp: Date.now(),
        confidence: this.calculateConfidence(obstacles)
      }
    })
    
    window.dispatchEvent(event)
    
    // Voice feedback for critical obstacles
    const criticalObstacles = obstacles.filter(obj => 
      ['person', 'car', 'bicycle', 'motorcycle'].includes(obj.class)
    )
    
    if (criticalObstacles.length > 0) {
      this.speakObstacleWarning(criticalObstacles)
    }
  }

  // Calculate overall confidence level
  calculateConfidence(obstacles: DetectedObject[]): number {
    if (obstacles.length === 0) return 0
    
    const totalScore = obstacles.reduce((sum, obj) => sum + obj.score, 0)
    return totalScore / obstacles.length
  }

  // Voice feedback for obstacle warnings
  private speakObstacleWarning(obstacles: DetectedObject[]): void {
    if (Date.now() - this.lastWarningAt < this.warningCooldownMs) return
    this.lastWarningAt = Date.now()
    const messages = obstacles.map(obj => {
      const distance = this.estimateDistance(obj.bbox)
      const direction = this.getDirection(obj.bbox)
      
      return `${obj.class} detected ${distance} ahead to the ${direction}. Please be careful.`
    })

    // Use speech synthesis for voice feedback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(messages.join(' '))
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    }

    // Send haptic feedback
    this.triggerHapticFeedback()
  }

  // Estimate distance to detected object
  private estimateDistance(bbox: number[]): string {
    const width = bbox[2]
    // Assume average object width and calculate approximate distance
    const assumedWidth = 0.5 // meters
    const distance = (assumedWidth / width) * 10
    
    if (distance < 2) return 'very close'
    if (distance < 5) return 'close'
    if (distance < 10) return 'moderate'
    return 'far'
  }

  // Get direction of detected object
  private getDirection(bbox: number[]): string {
    const centerX = bbox[0] + (bbox[2] / 2)
    const frameWidth = 640
    
    if (centerX < frameWidth * 0.3) return 'left'
    if (centerX > frameWidth * 0.7) return 'right'
    return 'center'
  }

  // Trigger haptic feedback
  private triggerHapticFeedback(): void {
    if ('vibrate' in navigator) {
      // Strong vibration pattern for obstacles
      navigator.vibrate([200, 100, 200, 100, 200])
    }
  }

  // Stop detection
  stopDetection(): void {
    this.isDetecting = false
    
    // Stop camera stream
    const videoElement = document.querySelector('video') as HTMLVideoElement
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject
      stream.getTracks().forEach(track => track.stop())
    }
  }

  // Get detection status
  getStatus(): { isInitialized: boolean; isDetecting: boolean } {
    return {
      isInitialized: this.isInitialized,
      isDetecting: this.isDetecting
    }
  }
}

// Export singleton instance
export const obstacleDetectionService = new ObstacleDetectionService()
