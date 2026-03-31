// Gesture Controls for Navigation
// Advanced gesture recognition system for touch-based navigation controls

export interface Gesture {
  id: string
  name: string
  type: 'swipe' | 'tap' | 'double_tap' | 'long_press' | 'pinch' | 'rotate' | 'scroll'
  description: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'horizontal' | 'vertical' | 'clockwise' | 'counter_clockwise'
  threshold: number
  action: string
}

export interface GestureAction {
  gestureId: string
  action: string
  confidence: number
  timestamp: number
  coordinates?: {
    x: number
    y: number
  }
}

export interface GestureSettings {
  enabled: boolean
  sensitivity: number // 1-100
  swipeThreshold: number // 50-200
  tapThreshold: number // 10-50
  longPressThreshold: number // 500-2000
  pinchThreshold: number // 20-100
  rotationThreshold: number // 15-45
  hapticFeedback: boolean
  visualFeedback: boolean
  soundFeedback: boolean
  voiceFeedback: boolean
}

class GestureControlService {
  private settings: GestureSettings
  private isActive: boolean = false
  private gestureHistory: GestureAction[] = []
  private touchStartPoint: { x: number; y: number; time: number } | null = null
  private currentGestures: Map<string, Gesture> = new Map()
  private gestureCallbacks: Map<string, (gesture: Gesture) => void> = new Map()

  constructor() {
    this.settings = this.loadSettings()
    this.initializeGestures()
  }

  // Load gesture settings
  private loadSettings(): GestureSettings {
    try {
      const saved = localStorage.getItem('gestureSettings')
      if (saved) {
        return JSON.parse(saved)
      }
      
      return {
        enabled: true,
        sensitivity: 70,
        swipeThreshold: 100,
        tapThreshold: 25,
        longPressThreshold: 1000,
        pinchThreshold: 50,
        rotationThreshold: 30,
        hapticFeedback: true,
        visualFeedback: true,
        soundFeedback: true,
        voiceFeedback: true
      }
    } catch (error) {
      console.error('Failed to load gesture settings:', error)
      return this.getDefaultSettings()
    }
  }

  // Save gesture settings
  private saveSettings(): void {
    try {
      localStorage.setItem('gestureSettings', JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save gesture settings:', error)
    }
  }

  // Get default gesture settings
  private getDefaultSettings(): GestureSettings {
    return {
      enabled: true,
      sensitivity: 70,
      swipeThreshold: 100,
      tapThreshold: 25,
      longPressThreshold: 1000,
      pinchThreshold: 50,
      rotationThreshold: 30,
      hapticFeedback: true,
      visualFeedback: true,
      soundFeedback: true,
      voiceFeedback: true
    }
  }

  // Initialize gesture definitions
  private initializeGestures(): void {
    // Navigation gestures
    const navigationGestures: Gesture[] = [
      {
        id: 'swipe_up',
        name: 'Swipe Up',
        type: 'swipe',
        description: 'Swipe up to go forward or increase volume',
        direction: 'up',
        threshold: 80,
        action: 'navigate_forward'
      },
      {
        id: 'swipe_down',
        name: 'Swipe Down',
        type: 'swipe',
        description: 'Swipe down to go back or decrease volume',
        direction: 'down',
        threshold: 80,
        action: 'navigate_back'
      },
      {
        id: 'swipe_left',
        name: 'Swipe Left',
        type: 'swipe',
        description: 'Swipe left to turn left or previous item',
        direction: 'left',
        threshold: 80,
        action: 'navigate_left'
      },
      {
        id: 'swipe_right',
        name: 'Swipe Right',
        type: 'swipe',
        description: 'Swipe right to turn right or next item',
        direction: 'right',
        threshold: 80,
        action: 'navigate_right'
      },
      {
        id: 'double_tap',
        name: 'Double Tap',
        type: 'double_tap',
        description: 'Double tap to select or confirm action',
        direction: 'up',
        threshold: 0,
        action: 'confirm'
      },
      {
        id: 'long_press',
        name: 'Long Press',
        type: 'long_press',
        description: 'Long press to access context menu or activate emergency',
        threshold: 0,
        action: 'context_menu'
      }
    ]

    // Zoom gestures
    const zoomGestures: Gesture[] = [
      {
        id: 'pinch_out',
        name: 'Pinch Out',
        type: 'pinch',
        description: 'Pinch out to zoom in',
        direction: 'out',
        threshold: 30,
        action: 'zoom_in'
      },
      {
        id: 'pinch_in',
        name: 'Pinch In',
        type: 'pinch',
        description: 'Pinch in to zoom out',
        direction: 'in',
        threshold: 30,
        action: 'zoom_out'
      },
      {
        id: 'rotate_clockwise',
        name: 'Rotate Clockwise',
        type: 'rotate',
        description: 'Rotate clockwise to increase value or next item',
        direction: 'clockwise',
        threshold: 25,
        action: 'increase_value'
      },
      {
        id: 'rotate_counter_clockwise',
        name: 'Rotate Counter-Clockwise',
        type: 'rotate',
        description: 'Rotate counter-clockwise to decrease value or previous item',
        direction: 'counter_clockwise',
        threshold: 25,
        action: 'decrease_value'
      }
    ]

    // Add all gestures to map
    navigationGestures.forEach(gesture => this.currentGestures.set(gesture.id, gesture))
    zoomGestures.forEach(gesture => this.currentGestures.set(gesture.id, gesture))
  }

  // Start gesture recognition
  startRecognition(): boolean {
    if (!('ontouchstart' in window) || this.isActive) {
      console.warn('Touch events not supported or already active')
      return false
    }

    try {
      this.isActive = true
      this.attachTouchListeners()
      console.log('Gesture recognition started')
      
      // Visual feedback
      this.showGestureOverlay()
      
      return true
    } catch (error) {
      console.error('Failed to start gesture recognition:', error)
      return false
    }
  }

  // Stop gesture recognition
  stopRecognition(): void {
    if (!this.isActive) return
    
    this.isActive = false
    this.detachTouchListeners()
    this.hideGestureOverlay()
    console.log('Gesture recognition stopped')
  }

  // Attach touch event listeners
  private attachTouchListeners(): void {
    const element = document.documentElement
    
    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false })
  }

  // Detach touch event listeners
  private detachTouchListeners(): void {
    const element = document.documentElement
    
    element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))
  }

  // Handle touch start
  private handleTouchStart(event: TouchEvent): void {
    if (!this.settings.enabled) return
    
    this.touchStartPoint = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      time: Date.now()
    }
    
    // Reset gesture detection
    this.currentGestures.clear()
  }

  // Handle touch move
  private handleTouchMove(event: TouchEvent): void {
    if (!this.settings.enabled || !this.touchStartPoint) return
    
    const currentPoint = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      time: Date.now()
    }
    
    // Detect gestures during movement
    this.detectGestures(this.touchStartPoint!, currentPoint)
    this.touchStartPoint = currentPoint
  }

  // Handle touch end
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.settings.enabled || !this.touchStartPoint) return
    
    const endPoint = {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
      time: Date.now()
    }
    
    // Final gesture detection
    this.detectGestures(this.touchStartPoint!, endPoint)
    this.touchStartPoint = null
  }

  // Handle touch cancel
  private handleTouchCancel(event: TouchEvent): void {
    this.touchStartPoint = null
    this.currentGestures.clear()
  }

  // Detect gestures
  private detectGestures(startPoint: { x: number; y: number; time: number }, endPoint: { x: number; y: number; time: number }): void {
    const deltaX = endPoint.x - startPoint.x
    const deltaY = endPoint.y - startPoint.y
    const deltaTime = endPoint.time - startPoint.time
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // Check for swipe gestures
    if (distance > this.settings.swipeThreshold && deltaTime < 500) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          this.recognizeGesture('swipe_right', deltaX, deltaY, endPoint)
        } else {
          this.recognizeGesture('swipe_left', deltaX, deltaY, endPoint)
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          this.recognizeGesture('swipe_down', deltaX, deltaY, endPoint)
        } else {
          this.recognizeGesture('swipe_up', deltaX, deltaY, endPoint)
        }
      }
    }
    
    // Check for tap gesture
    if (distance < this.settings.tapThreshold && deltaTime < 200) {
      this.recognizeGesture('tap', deltaX, deltaY, endPoint)
    }
    
    // Check for long press
    if (deltaTime > this.settings.longPressThreshold && distance < this.settings.tapThreshold) {
      this.recognizeGesture('long_press', deltaX, deltaY, endPoint)
    }
    
    // Check for pinch gesture
    if (event.touches.length === 2) {
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      
      if (currentDistance < this.settings.pinchThreshold) {
        this.recognizeGesture('pinch_in', deltaX, deltaY, endPoint)
      }
    }
  }

  // Recognize and execute gesture
  private recognizeGesture(gestureId: string, deltaX: number, deltaY: number, point: { x: number; y: number; time: number }): void {
    const gesture = this.currentGestures.get(gestureId)
    if (!gesture) return
    
    // Create gesture action
    const action: GestureAction = {
      gestureId,
      action: gesture.action,
      confidence: this.calculateGestureConfidence(gestureId, deltaX, deltaY),
      timestamp: Date.now(),
      coordinates: point
    }
    
    // Add to history
    this.gestureHistory.push(action)
    this.saveGestureHistory()
    
    // Execute callback
    const callback = this.gestureCallbacks.get(gestureId)
    if (callback) {
      callback(gesture)
    }
    
    // Provide feedback
    this.provideFeedback(gesture)
    
    console.log(`Gesture recognized: ${gesture.name} (${gesture.action})`)
  }

  // Calculate gesture confidence
  private calculateGestureConfidence(gestureId: string, deltaX: number, deltaY: number): number {
    const gesture = this.currentGestures.get(gestureId)
    if (!gesture) return 50
    
    // Base confidence on gesture type
    let confidence = 50
    
    switch (gesture.type) {
      case 'swipe':
        // Higher confidence for faster, longer swipes
        const swipeDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        confidence += Math.min(30, swipeDistance / 2)
        break
        
      case 'tap':
        // Higher confidence for quick, precise taps
        confidence += 20
        break
        
      case 'long_press':
        // Higher confidence for sustained presses
        confidence += 30
        break
        
      case 'pinch':
        // Higher confidence for clear pinch gestures
        confidence += 25
        break
        
      case 'rotate':
        // Higher confidence for smooth rotations
        confidence += 20
        break
    }
    
    return Math.min(100, confidence)
  }

  // Provide feedback for recognized gesture
  private provideFeedback(gesture: Gesture): void {
    if (!this.settings.enabled) return
    
    // Haptic feedback
    if (this.settings.hapticFeedback && 'vibrate' in navigator) {
      const vibrationPattern = this.getVibrationPattern(gesture.action)
      navigator.vibrate(vibrationPattern)
    }
    
    // Visual feedback
    if (this.settings.visualFeedback) {
      this.showVisualFeedback(gesture)
    }
    
    // Sound feedback
    if (this.settings.soundFeedback) {
      this.playGestureSound(gesture.action)
    }
    
    // Voice feedback
    if (this.settings.voiceFeedback) {
      this.speakGestureAction(gesture.action)
    }
  }

  // Get vibration pattern for gesture action
  private getVibrationPattern(action: string): number[] {
    const patterns = {
      navigate_forward: [100, 50, 100],
      navigate_back: [100, 50, 100],
      navigate_left: [150, 100, 150, 100],
      navigate_right: [150, 100, 150, 100],
      confirm: [50],
      context_menu: [200, 100, 200, 100],
      zoom_in: [80, 40, 80],
      zoom_out: [80, 40, 80],
      increase_value: [50, 30, 50],
      decrease_value: [50, 30, 50]
    }
    
    return patterns[action] || [50]
  }

  // Show visual feedback
  private showVisualFeedback(gesture: Gesture): void {
    // Create visual feedback overlay
    const overlay = document.createElement('div')
    overlay.className = 'gesture-feedback'
    overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      z-index: 10000;
      pointer-events: none;
      animation: fadeInOut 0.3s ease-in-out;
    `
    
    overlay.textContent = gesture.name.replace('_', ' ').toUpperCase()
    document.body.appendChild(overlay)
    
    // Remove after delay
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay)
      }
    }, 1000)
  }

  // Hide visual feedback overlay
  private hideGestureOverlay(): void {
    const overlays = document.querySelectorAll('.gesture-feedback')
    overlays.forEach(overlay => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay)
      }
    })
  }

  // Play gesture sound
  private playGestureSound(action: string): void {
    try {
      const audio = new Audio()
      audio.src = this.getGestureSoundUrl(action)
      audio.play().catch(error => {
        console.error('Failed to play gesture sound:', error)
      })
    } catch (error) {
      console.error('Failed to create audio for gesture sound:', error)
    }
  }

  // Get gesture sound URL
  private getGestureSoundUrl(action: string): string {
    // In a real implementation, these would be actual audio files
    // For demo purposes, we'll use data URLs
    const soundMap = {
      navigate_forward: 'data:audio/wav;base64,UklGRiQAAABQAA...',
      navigate_back: 'data:audio/wav;base64,UklGRiQAAABQAA...',
      navigate_left: 'data:audio/wav;base64,UklGRiQAAABQAA...',
      navigate_right: 'data:audio/wav;base64,UklGRiQAAABQAA...',
      confirm: 'data:audio/wav;base64,UklGRiQAAABQAA...',
      context_menu: 'data:audio/wav;base64,UklGRiQAAABQAA...',
      zoom_in: 'data:audio/wav;base64,UklGRiQAAABQAA...',
      zoom_out: 'data:audio/wav;base64,UklGRiQAAABQAA...',
      increase_value: 'data:audio/wav;base64,UklGRiQAAABQAA...',
      decrease_value: 'data:audio/wav;base64,UklGRiQAAABQAA...'
    }
    
    return soundMap[action] || soundMap.confirm
  }

  // Speak gesture action
  private speakGestureAction(action: string): void {
    if ('speechSynthesis' in window) {
      const messages = {
        navigate_forward: 'Moving forward',
        navigate_back: 'Moving back',
        navigate_left: 'Turning left',
        navigate_right: 'Turning right',
        confirm: 'Confirmed',
        context_menu: 'Menu opened',
        zoom_in: 'Zooming in',
        zoom_out: 'Zooming out',
        increase_value: 'Value increased',
        decrease_value: 'Value decreased'
      }
      
      const message = messages[action] || 'Gesture action'
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.2
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Register gesture callback
  registerCallback(gestureId: string, callback: (gesture: Gesture) => void): void {
    this.gestureCallbacks.set(gestureId, callback)
  }

  // Unregister gesture callback
  unregisterCallback(gestureId: string): void {
    this.gestureCallbacks.delete(gestureId)
  }

  // Get gesture history
  getGestureHistory(): GestureAction[] {
    return this.gestureHistory.slice(-50) // Return last 50 gestures
  }

  // Clear gesture history
  clearGestureHistory(): void {
    this.gestureHistory = []
    this.saveGestureHistory()
    console.log('Gesture history cleared')
  }

  // Save gesture history
  private saveGestureHistory(): void {
    try {
      localStorage.setItem('gestureHistory', JSON.stringify(this.gestureHistory))
    } catch (error) {
      console.error('Failed to save gesture history:', error)
    }
  }

  // Load gesture history
  private loadGestureHistory(): void {
    try {
      const saved = localStorage.getItem('gestureHistory')
      if (saved) {
        const history = JSON.parse(saved)
        this.gestureHistory = history
      }
    } catch (error) {
      console.error('Failed to load gesture history:', error)
    }
  }

  // Update gesture settings
  updateSettings(newSettings: Partial<GestureSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    console.log('Gesture settings updated')
  }

  // Get gesture settings
  getSettings(): GestureSettings {
    return this.settings
  }

  // Get service status
  getStatus(): {
    isActive: boolean
    isSupported: boolean
    gestureCount: number
    historyLength: number
  } {
    return {
      isActive: this.isActive,
      isSupported: 'ontouchstart' in window,
      gestureCount: this.currentGestures.size,
      historyLength: this.gestureHistory.length
    }
  }

  // Cleanup resources
  dispose(): void {
    this.stopRecognition()
    this.gestureCallbacks.clear()
    this.currentGestures.clear()
    this.gestureHistory = []
    console.log('Gesture control service disposed')
  }
}

// Export singleton instance
export const gestureControlService = new GestureControlService()
