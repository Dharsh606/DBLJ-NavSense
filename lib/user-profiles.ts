// User Profile and Preferences System
// Comprehensive user profiles with accessibility preferences, customization options, and personalization

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  dateOfBirth?: Date
  emergencyContact?: string
  accessibilityNeeds: {
    visualImpairment: 'none' | 'low' | 'moderate' | 'severe'
    hearingImpairment: 'none' | 'low' | 'moderate' | 'severe'
    mobilityImpairment: 'none' | 'low' | 'moderate' | 'severe'
    cognitiveImpairment: 'none' | 'low' | 'moderate' | 'severe'
  }
  preferences: UserPreferences
  createdAt: Date
  lastLogin: Date
  isActive: boolean
}

export interface UserPreferences {
  language: string
  voiceSpeed: number // 0.5 - 2.0
  voicePitch: number // 0.5 - 2.0
  hapticIntensity: number // 0-100
  hapticEnabled: boolean
  textSize: 'small' | 'medium' | 'large' | 'extra-large'
  highContrast: boolean
  colorBlindMode: boolean
  autoDetectObstacles: boolean
  voiceCommands: boolean
  gestureControls: boolean
  darkMode: boolean
  theme: 'light' | 'dark' | 'high-contrast' | 'blue-light' | 'sepia'
  notifications: {
    voice: boolean
    haptic: boolean
    visual: boolean
    sound: boolean
  }
  privacy: {
    shareLocation: boolean
    analytics: boolean
    crashReports: boolean
  }
  navigation: {
    defaultTransport: 'walking' | 'car' | 'public' | 'wheelchair'
    avoidTolls: boolean
    preferHighways: boolean
    voiceGuidance: boolean
  }
}

export interface UserSession {
  id: string
  userId: string
  loginTime: Date
  lastActivity: Date
  deviceInfo: {
    userAgent: string
    platform: string
    screenReader: boolean
    hapticSupport: boolean
    gpsSupport: boolean
  }
  preferences: UserPreferences
}

class UserProfileService {
  private currentUser: UserProfile | null = null
  private profiles: Map<string, UserProfile> = new Map()
  private sessions: Map<string, UserSession> = new Map()
  private defaultPreferences: UserPreferences

  constructor() {
    this.defaultPreferences = this.getDefaultPreferences()
    this.loadProfiles()
    this.loadCurrentProfile()
  }

  // Get default user preferences
  private getDefaultPreferences(): UserPreferences {
    return {
      language: 'en-US',
      voiceSpeed: 1.0,
      voicePitch: 1.0,
      hapticIntensity: 50,
      hapticEnabled: true,
      textSize: 'medium',
      highContrast: false,
      colorBlindMode: false,
      autoDetectObstacles: true,
      voiceCommands: true,
      gestureControls: true,
      darkMode: false,
      theme: 'light',
      notifications: {
        voice: true,
        haptic: true,
        visual: true,
        sound: true
      },
      privacy: {
        shareLocation: true,
        analytics: true,
        crashReports: true
      },
      navigation: {
        defaultTransport: 'walking',
        avoidTolls: false,
        preferHighways: false,
        voiceGuidance: true
      }
    }
  }

  // Load user profiles
  private loadProfiles(): void {
    try {
      const saved = localStorage.getItem('userProfiles')
      if (saved) {
        const profiles = JSON.parse(saved)
        profiles.forEach((profile: UserProfile) => {
          this.profiles.set(profile.id, profile)
        })
      }
    } catch (error) {
      console.error('Failed to load user profiles:', error)
    }
  }

  // Save user profiles
  private saveProfiles(): void {
    try {
      const profilesArray = Array.from(this.profiles.values())
      localStorage.setItem('userProfiles', JSON.stringify(profilesArray))
    } catch (error) {
      console.error('Failed to save user profiles:', error)
    }
  }

  // Load current user profile
  private loadCurrentProfile(): void {
    try {
      const currentProfileId = localStorage.getItem('currentProfileId')
      if (currentProfileId) {
        const profile = this.profiles.get(currentProfileId)
        if (profile) {
          this.currentUser = profile
        }
      }
    } catch (error) {
      console.error('Failed to load current profile:', error)
    }
  }

  // Save current user profile
  private saveCurrentProfile(): void {
    if (this.currentUser) {
      localStorage.setItem('currentProfileId', this.currentUser.id)
      this.profiles.set(this.currentUser.id, this.currentUser)
      this.saveProfiles()
    }
  }

  // Create new user profile
  createProfile(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'lastLogin' | 'isActive'>): string {
    const id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newProfile: UserProfile = {
      ...profileData,
      id,
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: false
    }
    
    this.profiles.set(id, newProfile)
    this.saveProfiles()
    
    console.log(`User profile created: ${newProfile.name}`)
    return id
  }

  // Update user profile
  updateProfile(id: string, updates: Partial<UserProfile>): boolean {
    const profile = this.profiles.get(id)
    if (!profile) {
      console.error(`Profile with id ${id} not found`)
      return false
    }
    
    const updatedProfile: UserProfile = {
      ...profile,
      ...updates
    }
    
    this.profiles.set(id, updatedProfile)
    this.saveProfiles()
    
    if (this.currentUser?.id === id) {
      this.currentUser = updatedProfile
    }
    
    console.log(`User profile updated: ${updatedProfile.name}`)
    return true
  }

  // Delete user profile
  deleteProfile(id: string): boolean {
    const profile = this.profiles.get(id)
    if (!profile) {
      console.error(`Profile with id ${id} not found`)
      return false
    }
    
    this.profiles.delete(id)
    this.saveProfiles()
    
    // If current profile was deleted, switch to default
    if (this.currentUser?.id === id) {
      const profiles = Array.from(this.profiles.values())
      this.currentUser = profiles.length > 0 ? profiles[0] : null
      if (this.currentUser) {
        localStorage.setItem('currentProfileId', this.currentUser.id)
      } else {
        localStorage.removeItem('currentProfileId')
      }
    }
    
    console.log(`User profile deleted: ${profile.name}`)
    return true
  }

  // Switch to user profile
  switchProfile(id: string): boolean {
    const profile = this.profiles.get(id)
    if (!profile) {
      console.error(`Profile with id ${id} not found`)
      return false
    }
    
    // Deactivate current profile
    if (this.currentUser) {
      this.currentUser.isActive = false
      this.saveCurrentProfile()
    }
    
    // Activate new profile
    profile.isActive = true
    profile.lastLogin = new Date()
    this.currentUser = profile
    this.saveCurrentProfile()
    
    console.log(`Switched to profile: ${profile.name}`)
    return true
  }

  // Get all user profiles
  getAllProfiles(): UserProfile[] {
    return Array.from(this.profiles.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Get current user profile
  getCurrentProfile(): UserProfile | null {
    return this.currentUser
  }

  // Update user preferences
  updatePreferences(preferences: Partial<UserPreferences>): void {
    if (!this.currentUser) {
      console.error('No current user profile')
      return
    }
    
    const updatedProfile: UserProfile = {
      ...this.currentUser,
      preferences: {
        ...this.currentUser.preferences,
        ...preferences
      }
    }
    
    this.currentUser = updatedProfile
    this.saveCurrentProfile()
    
    console.log('User preferences updated')
  }

  // Get user preferences
  getPreferences(): UserPreferences {
    return this.currentUser?.preferences || this.defaultPreferences
  }

  // Create user session
  createSession(userId: string): UserSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const session: UserSession = {
      id: sessionId,
      userId,
      loginTime: new Date(),
      lastActivity: new Date(),
      deviceInfo: this.getDeviceInfo(),
      preferences: this.getPreferences()
    }
    
    this.sessions.set(sessionId, session)
    this.saveSessions()
    
    console.log(`User session created: ${sessionId}`)
    return sessionId
  }

  // Get device information
  private getDeviceInfo(): UserSession['deviceInfo'] {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenReader: this.detectScreenReader(),
      hapticSupport: 'vibrate' in navigator,
      gpsSupport: 'geolocation' in navigator
    }
  }

  // Detect screen reader
  private detectScreenReader(): boolean {
    // Common screen reader detection
    return (
      'speechSynthesis' in window ||
      window.speechSynthesis?.getVoices().length > 0 ||
      // Check for common screen reader software
      /JAWS|NVDA|VoiceOver|TalkBack|ChromeVox/i.test(navigator.userAgent)
    )
  }

  // Get user session
  getSession(sessionId: string): UserSession | null {
    return this.sessions.get(sessionId) || null
  }

  // Get active sessions
  getActiveSessions(): UserSession[] {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
    return Array.from(this.sessions.values()).filter(session => 
      session.lastActivity.getTime() > cutoffTime
    )
  }

  // End user session
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
      this.sessions.set(sessionId, session)
      this.saveSessions()
      console.log(`User session ended: ${sessionId}`)
    }
  }

  // Save sessions
  private saveSessions(): void {
    try {
      const sessionsArray = Array.from(this.sessions.values())
        .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
        .slice(0, 50) // Keep only last 50 sessions
      
      localStorage.setItem('userSessions', JSON.stringify(sessionsArray))
    } catch (error) {
      console.error('Failed to save user sessions:', error)
    }
  }

  // Load sessions
  private loadSessions(): void {
    try {
      const saved = localStorage.getItem('userSessions')
      if (saved) {
        const sessions = JSON.parse(saved)
        sessions.forEach((session: UserSession) => {
          this.sessions.set(session.id, session)
        })
      }
    } catch (error) {
      console.error('Failed to load user sessions:', error)
    }
  }

  // Get accessibility recommendations
  getAccessibilityRecommendations(): Array<{ feature: string; recommendation: string; priority: 'high' | 'medium' | 'low' }> {
    const recommendations = []
    const preferences = this.getPreferences()
    
    if (this.currentUser?.accessibilityNeeds.visualImpairment === 'severe') {
      recommendations.push(
        { feature: 'Voice Commands', recommendation: 'Enable all voice commands with high confidence', priority: 'high' },
        { feature: 'High Contrast Mode', recommendation: 'Enable high contrast theme for better visibility', priority: 'high' },
        { feature: 'Large Text Size', recommendation: 'Use extra-large text size for readability', priority: 'high' },
        { feature: 'Haptic Feedback', recommendation: 'Enable strong haptic feedback for all interactions', priority: 'high' },
        { feature: 'Auto Obstacle Detection', recommendation: 'Keep obstacle detection always active', priority: 'high' }
      )
    }
    
    if (this.currentUser?.accessibilityNeeds.hearingImpairment === 'severe') {
      recommendations.push(
        { feature: 'Visual Notifications', recommendation: 'Use strong visual alerts with flashing', priority: 'high' },
        { feature: 'Vibration Patterns', recommendation: 'Use distinct vibration patterns for different alerts', priority: 'high' },
        { feature: 'Sound Alerts', recommendation: 'Enable loud, distinct sound alerts', priority: 'medium' }
      )
    }
    
    if (this.currentUser?.accessibilityNeeds.mobilityImpairment === 'severe') {
      recommendations.push(
        { feature: 'Gesture Controls', recommendation: 'Enable comprehensive gesture controls for navigation', priority: 'high' },
        { feature: 'Voice Navigation', recommendation: 'Enable step-by-step voice guidance', priority: 'high' },
        { feature: 'Wheelchair Accessibility', recommendation: 'Enable wheelchair-friendly route options', priority: 'high' }
      )
    }
    
    return recommendations
  }

  // Export user data
  exportUserData(): string {
    const userData = {
      profiles: Array.from(this.profiles.values()),
      sessions: Array.from(this.sessions.values()),
      currentProfile: this.currentUser,
      preferences: this.getPreferences(),
      exportDate: new Date().toISOString()
    }
    
    return JSON.stringify(userData, null, 2)
  }

  // Import user data
  async importUserData(data: string): Promise<boolean> {
    try {
      const userData = JSON.parse(data)
      
      // Import profiles
      if (userData.profiles) {
        userData.profiles.forEach((profile: UserProfile) => {
          this.profiles.set(profile.id, profile)
        })
        this.saveProfiles()
      }
      
      // Import sessions
      if (userData.sessions) {
        userData.sessions.forEach((session: UserSession) => {
          this.sessions.set(session.id, session)
        })
        this.saveSessions()
      }
      
      console.log('User data imported successfully')
      return true
      
    } catch (error) {
      console.error('Failed to import user data:', error)
      return false
    }
  }

  // Get service status
  getStatus(): {
    profilesCount: number
    currentProfile: UserProfile | null
    sessionsCount: number
    activeSessions: number
    isInitialized: boolean
  } {
    return {
      profilesCount: this.profiles.size,
      currentProfile: this.currentUser,
      sessionsCount: this.sessions.size,
      activeSessions: this.getActiveSessions().length,
      isInitialized: this.profiles.size > 0 || this.sessions.size > 0
    }
  }

  // Cleanup resources
  dispose(): void {
    this.profiles.clear()
    this.sessions.clear()
    this.currentUser = null
    console.log('User profile service disposed')
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService()
