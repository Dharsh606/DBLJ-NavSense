// GPS Tracking and Location History Service
// Advanced real-time GPS tracking with location history and analytics

export interface LocationPoint {
  latitude: number
  longitude: number
  altitude?: number | null
  accuracy: number | null
  timestamp: number
  speed?: number | null
  heading?: number | null
}

export interface LocationHistory {
  id: string
  userId: string
  locations: (LocationPoint | null)[]
  startTime: Date
  endTime?: Date
  purpose: 'navigation' | 'emergency' | 'exploration' | 'commute'
  distance: number
  duration: number
}

export interface LocationAnalytics {
  totalDistance: number
  totalTime: number
  averageSpeed: number
  maxSpeed: number
  locationsVisited: number
  emergencyAlerts: number
  lastLocation: LocationPoint | null
}

class GPSTrackingService {
  private watchId: number | null = null
  private currentLocation: LocationPoint | null = null
  private locationHistory: LocationHistory[] = []
  private isTracking: boolean = false
  private trackingInterval: NodeJS.Timeout | null = null
  private errorCallback: ((error: Error) => void) | null = null

  constructor() {
    this.loadLocationHistory()
  }

  // Start GPS tracking
  async startTracking(errorCallback?: ((error: Error) => void)): Promise<void> {
    if (this.isTracking) {
      return
    }

    this.errorCallback = errorCallback || this.defaultErrorHandler

    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser')
      }

      // Request high accuracy GPS
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      })

      if (position && position.coords) {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || null,
          accuracy: position.coords.accuracy || null,
          timestamp: Date.now(),
          speed: position.coords.speed || null,
          heading: position.coords.heading || null
        }
      }

      // Start continuous tracking
      this.watchId = navigator.geolocation.watchPosition(
        this.handlePositionUpdate.bind(this),
        (error: GeolocationPositionError) => {
          console.error('GPS Error:', error.message)
          this.speakLocationUpdate(`GPS error: ${error.message}`)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )

      this.isTracking = true
      this.startTrackingInterval()

      // Create new location history entry
      const historyEntry: LocationHistory = {
        id: this.generateId(),
        userId: this.getUserId(),
        locations: [this.currentLocation],
        startTime: new Date(),
        purpose: 'navigation',
        distance: 0,
        duration: 0
      }

      this.locationHistory.push(historyEntry)
      this.saveLocationHistory()

      console.log('GPS tracking started:', this.currentLocation)
      
    } catch (error) {
      console.error('Failed to start GPS tracking:', error)
      this.errorCallback?.(error as Error)
    }
  }

  // Handle GPS position updates
  private handlePositionUpdate(position: GeolocationPosition): void {
    const newLocation: LocationPoint = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now(),
      speed: position.coords.speed,
      heading: position.coords.heading
    }

    // Calculate distance from previous location
    if (this.currentLocation) {
      const distance = this.calculateDistance(
        this.currentLocation.latitude,
        this.currentLocation.longitude,
        newLocation.latitude,
        newLocation.longitude
      )

      // Update current history entry
      const currentEntry = this.locationHistory[this.locationHistory.length - 1]
      if (currentEntry) {
        currentEntry.locations.push(newLocation)
        currentEntry.distance += distance
        currentEntry.endTime = new Date()
        currentEntry.duration = Date.now() - currentEntry.startTime.getTime()
      }

      this.currentLocation = newLocation
      this.saveLocationHistory()

      // Trigger location update event
      this.notifyLocationUpdate(newLocation, distance)
    }
  }

  // Calculate distance between two GPS coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLon / 2)
    const c = Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    const d = Math.sqrt((a * a) + (c * c))
    const distance = R * d * 1000 // Convert to meters

    return distance
  }

  // Notify location updates to main app
  private notifyLocationUpdate(location: LocationPoint, distance: number): void {
    const event = new CustomEvent('locationUpdate', {
      detail: {
        location,
        distance,
        timestamp: Date.now(),
        accuracy: location.accuracy,
        speed: location.speed
      }
    })
    
    window.dispatchEvent(event)

    // Voice feedback for significant movements
    if (distance > 10) {
      this.speakLocationUpdate(`Moved ${Math.round(distance)} meters`)
    }
  }

  // Voice feedback for location updates
  private speakLocationUpdate(message: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Start tracking interval for periodic updates
  private startTrackingInterval(): void {
    this.trackingInterval = setInterval(() => {
      if (this.currentLocation) {
        // Periodic location announcements
        this.speakLocationUpdate(
          `Location: ${this.currentLocation.latitude.toFixed(6)}, ${this.currentLocation.longitude.toFixed(6)}. Accuracy: ${this.currentLocation.accuracy?.toFixed(0) || 'unknown'} meters`
        )
      }
    }, 30000) // Every 30 seconds
  }

  // Stop GPS tracking
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }

    if (this.trackingInterval !== null) {
      clearInterval(this.trackingInterval)
      this.trackingInterval = null
    }

    this.isTracking = false

    // Finalize current tracking session
    if (this.locationHistory.length > 0) {
      const currentEntry = this.locationHistory[this.locationHistory.length - 1]
      if (currentEntry && currentEntry.endTime === undefined) {
        currentEntry.endTime = new Date()
        currentEntry.duration = Date.now() - currentEntry.startTime.getTime()
      }
    }

    this.saveLocationHistory()
    this.speakLocationUpdate('GPS tracking stopped')
  }

  // Get current tracking status
  getStatus(): { isTracking: boolean; currentLocation: LocationPoint | null; history: LocationHistory[] } {
    return {
      isTracking: this.isTracking,
      currentLocation: this.currentLocation,
      history: this.locationHistory
    }
  }

  // Get location analytics
  getAnalytics(): LocationAnalytics {
    const totalDistance = this.locationHistory.reduce((sum, entry) => sum + entry.distance, 0)
    const totalTime = this.locationHistory.reduce((sum, entry) => sum + (entry.duration || 0), 0)
    const locationsVisited = this.locationHistory.length
    const emergencyAlerts = this.locationHistory.filter(entry => entry.purpose === 'emergency').length

    return {
      totalDistance,
      totalTime,
      averageSpeed: totalTime > 0 ? (totalDistance / (totalTime / 1000 / 3600)) : 0, // km/h
      maxSpeed: this.getMaxSpeed(),
      locationsVisited,
      emergencyAlerts,
      lastLocation: this.currentLocation
    }
  }

  // Get maximum speed from history
  private getMaxSpeed(): number {
    let maxSpeed = 0
    this.locationHistory.forEach(entry => {
      entry.locations.forEach(loc => {
        const speed = loc?.speed
        if (typeof speed === 'number' && speed > maxSpeed) {
          maxSpeed = speed
        }
      })
    })
    return maxSpeed
  }

  // Load location history from localStorage
  private loadLocationHistory(): void {
    try {
      const saved = localStorage.getItem('locationHistory')
      if (saved) {
        this.locationHistory = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load location history:', error)
    }
  }

  // Save location history to localStorage
  private saveLocationHistory(): void {
    try {
      // Keep only last 50 entries to save space
      const recentHistory = this.locationHistory.slice(-50)
      localStorage.setItem('locationHistory', JSON.stringify(recentHistory))
    } catch (error) {
      console.error('Failed to save location history:', error)
    }
  }

  // Clear location history
  clearHistory(): void {
    this.locationHistory = []
    localStorage.removeItem('locationHistory')
  }

  // Export location history
  exportHistory(): void {
    const dataStr = JSON.stringify(this.locationHistory, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `location-history-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Get specific location history entry
  getHistoryEntry(id: string): LocationHistory | null {
    return this.locationHistory.find(entry => entry.id === id) || null
  }

  // Delete specific history entry
  deleteHistoryEntry(id: string): boolean {
    const index = this.locationHistory.findIndex(entry => entry.id === id)
    if (index > -1) {
      this.locationHistory.splice(index, 1)
      this.saveLocationHistory()
      return true
    }
    return false
  }

  // Generate unique ID for history entries
  private generateId(): string {
    return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get user ID (simplified for demo)
  private getUserId(): string {
    return 'user_001' // In real app, this would come from authentication
  }

  // Default error handler
  private defaultErrorHandler = (error: Error): void => {
    console.error('GPS Error:', error)
    this.speakLocationUpdate(`GPS error: ${error.message}`)
  }

  // Cleanup resources
  dispose(): void {
    this.stopTracking()
    this.currentLocation = null
    this.locationHistory = []
  }
}

// Export singleton instance
export const gpsTrackingService = new GPSTrackingService()
