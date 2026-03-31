// Haptic Feedback Service for Enhanced Accessibility
// Provides advanced vibration patterns and tactile feedback for visually impaired users

export interface HapticPattern {
  name: string
  pattern: number[]
  description: string
  category: 'notification' | 'warning' | 'error' | 'success' | 'navigation'
}

export interface HapticSettings {
  enabled: boolean
  intensity: number // 0-100
  duration: number // milliseconds
  enabledPatterns: string[]
}

class HapticFeedbackService {
  private settings: HapticSettings
  private vibrationQueue: Array<{ pattern: number[], delay: number }> = []
  private isVibrating: boolean = false

  constructor() {
    this.settings = this.loadSettings()
  }

  // Load haptic settings from localStorage
  private loadSettings(): HapticSettings {
    try {
      const saved = localStorage.getItem('hapticSettings')
      if (saved) {
        return JSON.parse(saved)
      }
      
      return {
        enabled: true,
        intensity: 50,
        duration: 200,
        enabledPatterns: ['tap', 'success', 'warning', 'error', 'navigation']
      }
    } catch (error) {
      console.error('Failed to load haptic settings:', error)
      return {
        enabled: true,
        intensity: 50,
        duration: 200,
        enabledPatterns: ['tap', 'success', 'warning', 'error', 'navigation']
      }
    }
  }

  // Save haptic settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('hapticSettings', JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save haptic settings:', error)
    }
  }

  // Predefined haptic patterns
  private getPatterns(): Record<string, HapticPattern> {
    return {
      // Notification patterns
      tap: {
        name: 'Tap',
        pattern: [50],
        description: 'Single tap feedback',
        category: 'notification'
      },
      
      doubleTap: {
        name: 'Double Tap',
        pattern: [50, 100],
        description: 'Double tap confirmation',
        category: 'notification'
      },
      
      longPress: {
        name: 'Long Press',
        pattern: [50, 50, 50, 100, 100, 100],
        description: 'Long press action',
        category: 'notification'
      },
      
      // Success patterns
      success: {
        name: 'Success',
        pattern: [100, 50, 100],
        description: 'Action completed successfully',
        category: 'success'
      },
      
      achievement: {
        name: 'Achievement',
        pattern: [200, 100, 200],
        description: 'Goal or milestone reached',
        category: 'success'
      },
      
      // Warning patterns
      warning: {
        name: 'Warning',
        pattern: [200, 100, 200, 100],
        description: 'Warning or caution',
        category: 'warning'
      },
      
      // Error patterns
      error: {
        name: 'Error',
        pattern: [300, 200, 300, 200, 100],
        description: 'Error occurred',
        category: 'error'
      },
      
      // Navigation patterns
      navigation: {
        name: 'Navigation',
        pattern: [100, 50, 100],
        description: 'Turn or direction instruction',
        category: 'navigation'
      },
      
      turnLeft: {
        name: 'Turn Left',
        pattern: [150, 100, 150, 100],
        description: 'Turn left instruction',
        category: 'navigation'
      },
      
      turnRight: {
        name: 'Turn Right',
        pattern: [150, 100, 150, 100],
        description: 'Turn right instruction',
        category: 'navigation'
      },
      
      obstacle: {
        name: 'Obstacle',
        pattern: [300, 150, 300, 150, 100],
        description: 'Obstacle detected nearby',
        category: 'warning'
      },
      
      destination: {
        name: 'Destination',
        pattern: [200, 100, 200],
        description: 'Destination reached',
        category: 'success'
      }
    }
  }

  // Check if haptic feedback is supported
  isSupported(): boolean {
    return 'vibrate' in navigator
  }

  // Vibrate device with pattern
  vibrate(patternName: string, intensity?: number): void {
    if (!this.settings.enabled || !this.isSupported()) {
      return
    }

    const pattern = this.getPatterns()[patternName]
    if (!pattern) {
      console.warn(`Haptic pattern '${patternName}' not found`)
      return
    }

    const vibratePattern = pattern.pattern.map(duration => 
      intensity || this.settings.intensity
    )

    // Execute vibration
    try {
      navigator.vibrate(vibratePattern)
      
      // Add to queue for complex patterns
      if (pattern.pattern.length > 1) {
        this.vibrationQueue.push({
          pattern: pattern.pattern.slice(1),
          delay: pattern.pattern[0] + 100 // Wait for first vibration to complete
        })
      }
    } catch (error) {
      console.error('Haptic feedback failed:', error)
    }
  }

  // Execute queued vibrations
  private executeVibrationQueue(): void {
    if (this.vibrationQueue.length === 0 || this.isVibrating) {
      return
    }

    this.isVibrating = true
    const { pattern, delay } = this.vibrationQueue.shift()!
    
    setTimeout(() => {
      this.vibratePattern(pattern.pattern, pattern.intensity)
      this.isVibrating = false
      
      // Execute next in queue
      if (this.vibrationQueue.length > 0) {
        setTimeout(() => this.executeVibrationQueue(), delay)
      }
    }, pattern.pattern[0] + pattern.pattern[1])
  }

  // Simple haptic feedback methods
  tap(): void {
    this.vibrate('tap')
  }

  doubleTap(): void {
    this.vibrate('doubleTap')
  }

  longPress(): void {
    this.vibrate('longPress')
  }

  success(): void {
    this.vibrate('success')
  }

  achievement(): void {
    this.vibrate('achievement')
  }

  warning(): void {
    this.vibrate('warning')
  }

  error(): void {
    this.vibrate('error')
  }

  navigation(direction: 'left' | 'right'): void {
    this.vibrate(direction === 'left' ? 'turnLeft' : 'turnRight')
  }

  obstacle(): void {
    this.vibrate('obstacle')
  }

  destination(): void {
    this.vibrate('destination')
  }

  // Navigation-specific feedback
  startNavigation(): void {
    this.vibrate('navigation')
    setTimeout(() => this.vibrate('navigation'), 500)
  }

  turnInstruction(): void {
    this.vibrate('navigation')
  }

  approachingTurn(): void {
    this.vibrate('navigation')
    setTimeout(() => this.vibrate('navigation'), 1000)
  }

  // Accessibility features
  heartbeat(): void {
    const pattern = [50, 100, 50, 100, 100, 50, 100, 50, 100]
    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.error('Heartbeat haptic failed:', error)
    }
  }

  sos(): void {
    // Emergency SOS pattern
    const sosPattern = [500, 200, 500, 200, 500, 200, 500, 200, 500, 200]
    try {
      navigator.vibrate(sosPattern)
    } catch (error) {
      console.error('SOS haptic failed:', error)
    }
  }

  // Settings management
  updateSettings(newSettings: Partial<HapticSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
  }

  getSettings(): HapticSettings {
    return this.settings
  }

  // Enable/disable haptic feedback
  setEnabled(enabled: boolean): void {
    this.updateSettings({ enabled })
  }

  setIntensity(intensity: number): void {
    this.updateSettings({ intensity: Math.max(0, Math.min(100, intensity)) })
  }

  setDuration(duration: number): void {
    this.updateSettings({ duration: Math.max(10, Math.min(1000, duration)) })
  }

  enablePattern(patternName: string): void {
    if (!this.settings.enabledPatterns.includes(patternName)) {
      return
    }
    this.updateSettings({ 
      enabledPatterns: [...this.settings.enabledPatterns, patternName]
    })
  }

  disablePattern(patternName: string): void {
    this.updateSettings({ 
      enabledPatterns: this.settings.enabledPatterns.filter(p => p !== patternName)
    })
  }

  // Get available patterns
  getAvailablePatterns(): HapticPattern[] {
    return Object.values(this.getPatterns()).filter(pattern => 
      this.settings.enabledPatterns.includes(pattern.name)
    )
  }

  // Test haptic feedback
  testPattern(patternName: string): void {
    const pattern = this.getPatterns()[patternName]
    if (pattern) {
      console.log(`Testing haptic pattern: ${pattern.name}`)
      console.log(`Pattern: ${pattern.pattern}`)
      console.log(`Description: ${pattern.description}`)
      this.vibrate(pattern.name)
    }
  }

  // Test all patterns
  testAllPatterns(): void {
    console.log('Testing all haptic patterns...')
    const patterns = this.getAvailablePatterns()
    
    patterns.forEach((pattern, index) => {
      setTimeout(() => {
        this.testPattern(pattern.name)
      }, index * 1000) // Test each pattern with 1 second delay
    })
  }

  // Cleanup
  dispose(): void {
    this.vibrationQueue = []
    this.isVibrating = false
    
    // Cancel any ongoing vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(0)
    }
  }
}

// Export singleton instance
export const hapticFeedbackService = new HapticFeedbackService()
