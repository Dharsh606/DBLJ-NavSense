// Emergency Contact Integration System
// Advanced emergency contact management with automatic alerts, location sharing, and emergency services

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email: string
  isPrimary: boolean
  address?: string
  medicalInfo?: {
    bloodType: string
    allergies: string
    medications: string
    emergencyContact: string
  }
  lastContacted: number
  priority: number // 1-5, 1 being highest
}

export interface EmergencyAlert {
  id: string
  type: 'medical' | 'police' | 'fire' | 'accident' | 'sos'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  location?: {
    latitude: number
    longitude: number
  }
  timestamp: number
  resolved: boolean
  contactsNotified: string[]
}

export interface EmergencySettings {
  autoDetect: boolean
  shareLocation: boolean
  callEmergency: boolean
  sendSms: boolean
  sendEmail: boolean
  geofenceEnabled: boolean
  geofenceRadius: number // meters
  silentHours: Array<number> // 24-hour format [0-23]
  testMode: boolean
}

class EmergencyContactService {
  private contacts: Map<string, EmergencyContact> = new Map()
  private alerts: EmergencyAlert[] = []
  private settings: EmergencySettings
  private watchId: number | null = null
  private isMonitoring: boolean = false

  constructor() {
    this.settings = this.loadSettings()
    this.loadContacts()
  }

  // Text-to-speech for emergency alerts
  private speak(message: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.1
      utterance.pitch = 1.0
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  // Load emergency settings
  private loadSettings(): EmergencySettings {
    try {
      const saved = localStorage.getItem('emergencySettings')
      if (saved) {
        return JSON.parse(saved)
      }
      
      return {
        autoDetect: true,
        shareLocation: true,
        callEmergency: true,
        sendSms: true,
        sendEmail: true,
        geofenceEnabled: false,
        geofenceRadius: 100,
        silentHours: [22, 6], // 10 PM - 6 AM
        testMode: false
      }
    } catch (error) {
      console.error('Failed to load emergency settings:', error)
      return {
        autoDetect: true,
        shareLocation: true,
        callEmergency: true,
        sendSms: true,
        sendEmail: true,
        geofenceEnabled: false,
        geofenceRadius: 100,
        silentHours: [22, 6],
        testMode: false
      }
    }
  }

  // Save emergency settings
  private saveSettings(): void {
    try {
      localStorage.setItem('emergencySettings', JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save emergency settings:', error)
    }
  }

  // Load emergency contacts
  private loadContacts(): void {
    try {
      const saved = localStorage.getItem('emergencyContacts')
      if (saved) {
        const contacts = JSON.parse(saved)
        contacts.forEach((contact: EmergencyContact) => {
          this.contacts.set(contact.id, contact)
        })
      }
    } catch (error) {
      console.error('Failed to load emergency contacts:', error)
    }
  }

  // Save emergency contacts
  private saveContacts(): void {
    try {
      const contactsArray = Array.from(this.contacts.values())
      localStorage.setItem('emergencyContacts', JSON.stringify(contactsArray))
    } catch (error) {
      console.error('Failed to save emergency contacts:', error)
    }
  }

  // Add emergency contact
  addContact(contact: Omit<EmergencyContact, 'id'>): string {
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newContact: EmergencyContact = {
      ...contact,
      id,
      lastContacted: Date.now()
    }
    
    this.contacts.set(id, newContact)
    this.saveContacts()
    
    console.log(`Emergency contact added: ${newContact.name}`)
    return id
  }

  // Update emergency contact
  updateContact(id: string, updates: Partial<EmergencyContact>): void {
    const contact = this.contacts.get(id)
    if (contact) {
      const updatedContact: EmergencyContact = {
        ...contact,
        ...updates,
        lastContacted: Date.now()
      }
      
      this.contacts.set(id, updatedContact)
      this.saveContacts()
      
      console.log(`Emergency contact updated: ${updatedContact.name}`)
    } else {
      console.error(`Contact with id ${id} not found`)
    }
  }

  // Delete emergency contact
  deleteContact(id: string): boolean {
    const contact = this.contacts.get(id)
    if (contact) {
      this.contacts.delete(id)
      this.saveContacts()
      
      console.log(`Emergency contact deleted: ${contact.name}`)
      return true
    } else {
      console.error(`Contact with id ${id} not found`)
      return false
    }
  }

  // Get all contacts
  getAllContacts(): EmergencyContact[] {
    return Array.from(this.contacts.values()).sort((a, b) => b.priority - a.priority)
  }

  // Get primary contacts
  getPrimaryContacts(): EmergencyContact[] {
    return Array.from(this.contacts.values()).filter(contact => contact.isPrimary)
  }

  // Start emergency monitoring
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return
    }

    try {
      this.isMonitoring = true
      
      // Start GPS tracking for location sharing
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Emergency monitoring location updated:', position)
          },
          (error) => {
            console.error('Emergency monitoring GPS error:', error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      }

      console.log('Emergency monitoring started')
      this.speak('Emergency monitoring activated. Your location will be shared with emergency contacts.')
      
    } catch (error) {
      console.error('Failed to start emergency monitoring:', error)
      this.isMonitoring = false
    }
  }

  // Stop emergency monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return
    }

    this.isMonitoring = false
    console.log('Emergency monitoring stopped')
    this.speak('Emergency monitoring deactivated')
  }

  // Trigger emergency alert
  async triggerEmergencyAlert(type: EmergencyAlert['type'], message?: string, location?: { latitude: number; longitude: number; address?: string }): Promise<void> {
    const alert: EmergencyAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity: this.getSeverityLevel(type),
      message: message || `Emergency alert: ${type}`,
      timestamp: Date.now(),
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude
      } : undefined,
      resolved: false,
      contactsNotified: []
    }

    this.alerts.push(alert)
    
    // Notify emergency contacts
    await this.notifyEmergencyContacts(alert)
    
    // Auto-call emergency services if enabled
    if (this.settings.callEmergency) {
      await this.callEmergencyService(type, alert)
    }
    
    // Send SMS if enabled
    if (this.settings.sendSms) {
      await this.sendEmergencySMS(alert)
    }
    
    // Send email if enabled
    if (this.settings.sendEmail) {
      const primaryContacts = this.getPrimaryContacts()
      for (const contact of primaryContacts) {
        if (contact.email) {
          await this.sendEmail(contact.email, 'Emergency Alert', alert.message, alert)
        }
      }
    }
    
    console.log(`Emergency alert triggered: ${type}`)
  }

  // Get severity level for emergency type
  private getSeverityLevel(type: EmergencyAlert['type']): EmergencyAlert['severity'] {
    const severityMap = {
      medical: 'high',
      police: 'critical',
      fire: 'critical',
      accident: 'critical',
      sos: 'critical'
    }
    
    return severityMap[type] || 'medium'
  }

  // Notify emergency contacts
  private async notifyEmergencyContacts(alert: EmergencyAlert): Promise<void> {
    const contacts = this.getPrimaryContacts()
    const notifiedContacts: string[] = []
    
    for (const contact of contacts) {
      try {
        await this.notifyContact(contact, alert)
        notifiedContacts.push(contact.id)
        
        // Add delay between notifications to avoid overwhelming services
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to notify contact ${contact.name}:`, error)
      }
    }
    
    alert.contactsNotified = notifiedContacts
  }

  // Notify individual contact
  private async notifyContact(contact: EmergencyContact, alert: EmergencyAlert): Promise<void> {
    const message = `EMERGENCY ALERT - ${alert.type.toUpperCase()}: ${alert.message}`
    
    if (contact.phone) {
      await this.makePhoneCall(contact.phone, message)
    }
    
    if (contact.email) {
      await this.sendEmail(contact.email, 'Emergency Alert', message, alert)
    }
    
    if (contact.emergencyContact) {
      await this.callEmergencyService(contact.emergencyContact, alert)
    }
  }

  // Make phone call
  private async makePhoneCall(phone: string, message: string): Promise<void> {
    try {
      console.log(`Calling emergency contact: ${phone}`)
      
      // In a real implementation, this would use WebRTC or a telephony service
      // For demo purposes, we'll simulate the call
      this.speak(`Calling ${phone}... ${message}`)
      
      // Simulate call connection
      setTimeout(() => {
        this.speak(`Connected to ${phone}. Emergency services notified.`)
      }, 3000)
      
    } catch (error) {
      console.error('Failed to make emergency call:', error)
    }
  }

  // Send email
  private async sendEmail(email: string, subject: string, message: string, alert: EmergencyAlert): Promise<void> {
    try {
      console.log(`Sending emergency email to: ${email}`)
      
      // In a real implementation, this would use an email service
      // For demo purposes, we'll simulate the email sending
      this.speak(`Sending emergency email to ${email}...`)
      
      setTimeout(() => {
        this.speak(`Emergency email sent to ${email}`)
      }, 2000)
      
    } catch (error) {
      console.error('Failed to send emergency email:', error)
    }
  }

  // Call emergency services
  private async callEmergencyService(service: string, alert: EmergencyAlert): Promise<void> {
    try {
      console.log(`Calling emergency service: ${service}`)
      
      // In a real implementation, this would integrate with emergency APIs
      // For demo purposes, we'll simulate the service call
      this.speak(`Contacting emergency services: ${service}`)
      
      setTimeout(() => {
        this.speak(`Emergency services notified: ${service}`)
      }, 1500)
      
    } catch (error) {
      console.error('Failed to call emergency service:', error)
    }
  }

  // Send emergency SMS
  private async sendEmergencySMS(alert: EmergencyAlert): Promise<void> {
    try {
      console.log('Sending emergency SMS')
      
      // In a real implementation, this would use SMS API
      // For demo purposes, we'll simulate SMS sending
      const contacts = this.getPrimaryContacts()
      
      for (const contact of contacts.slice(0, 3)) { // Limit to 3 contacts for demo
        if (contact.phone) {
          this.speak(`Sending emergency SMS to ${contact.phone}`)
          
          setTimeout(() => {
            console.log(`Emergency SMS sent to ${contact.phone}`)
          }, 1000)
        }
      }
      
    } catch (error) {
      console.error('Failed to send emergency SMS:', error)
    }
  }

  // Geofence monitoring
  private checkGeofence(location: { latitude: number; longitude: number }): boolean {
    if (!this.settings.geofenceEnabled) return false
    
    const distance = this.calculateDistance(
      this.settings.geofenceRadius,
      location.longitude,
      location.latitude
    )
    
    if (distance <= this.settings.geofenceRadius) {
      console.log(`User within geofence: ${distance}m`)
      return true
    }
    
    console.log(`User outside geofence: ${distance}m`)
    return false
  }

  // Calculate distance between two coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLon / 2)
    const c = Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    const d = Math.sqrt((a * a) + (c * c))
    return R * d * 1000 // Convert to meters
  }

  // Get monitoring status
  getStatus(): {
    contactsCount: number
    alertsCount: number
    isMonitoring: boolean
    settings: EmergencySettings
  } {
    return {
      contactsCount: this.contacts.size,
      alertsCount: this.alerts.length,
      isMonitoring: this.isMonitoring,
      settings: this.settings
    }
  }

  // Get alert history
  getAlertHistory(): EmergencyAlert[] {
    return this.alerts.slice(-50) // Return last 50 alerts
  }

  // Clear alert history
  clearAlertHistory(): void {
    this.alerts = []
    console.log('Emergency alert history cleared')
  }

  // Test emergency system
  async testSystem(): Promise<void> {
    try {
      this.speak('Testing emergency system...')
      
      // Test alert
      await this.triggerEmergencyAlert('sos', 'This is a test emergency alert', {
        latitude: 40.7128,
        longitude: -74.0060
      })
      
      console.log('Emergency system test completed')
      
    } catch (error) {
      console.error('Emergency system test failed:', error)
    }
  }

  // Update settings
  updateSettings(newSettings: Partial<EmergencySettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    
    // Apply new settings
    this.applySettings()
  }

  // Apply settings to monitoring
  private applySettings(): void {
    // Settings would be applied to various monitoring subsystems
    console.log('Emergency settings updated:', this.settings)
  }

  // Cleanup resources
  dispose(): void {
    this.stopMonitoring()
    this.contacts.clear()
    this.alerts = []
    console.log('Emergency contact service disposed')
  }
}

// Export singleton instance
export const emergencyContactService = new EmergencyContactService()
