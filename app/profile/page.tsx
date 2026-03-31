'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  User,
  Settings,
  Accessibility,
  Volume2,
  Eye,
  Moon,
  Sun,
  Smartphone,
  Globe,
  Heart,
  Shield,
  CheckCircle,
  Edit,
  Save,
  X
} from 'lucide-react'
import { userProfileService, UserProfile } from '@/lib/user-profiles'

export default function ProfilePage() {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [preferences, setPreferences] = useState({
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    hapticEnabled: true,
    textSize: 'medium' as 'small' | 'medium' | 'large' | 'extra-large',
    highContrast: false,
    darkMode: false,
    language: 'en-US'
  })

  useEffect(() => {
    setIsClient(true)
    const profile = userProfileService.getCurrentProfile()
    setCurrentProfile(profile)
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      })
      setPreferences(profile.preferences)
    }
  }, [])

  const handleSaveProfile = () => {
    if (currentProfile) {
      userProfileService.updateProfile(currentProfile.id, {
        ...currentProfile,
        ...editForm
      })
      const updatedProfile = userProfileService.getCurrentProfile()
      setCurrentProfile(updatedProfile)
      setIsEditing(false)
      speak('Profile updated successfully')
    }
  }

  const handlePreferenceChange = (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    userProfileService.updatePreferences(newPreferences)
    
    // Apply theme changes immediately
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', value)
    }
    if (key === 'highContrast') {
      document.documentElement.classList.toggle('high-contrast', value)
    }
    if (key === 'textSize') {
      document.documentElement.style.fontSize = 
        value === 'small' ? '14px' : 
        value === 'medium' ? '16px' : 
        value === 'large' ? '18px' : '20px'
    }
  }

  const speak = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = preferences.voiceSpeed
      utterance.pitch = preferences.voicePitch
      window.speechSynthesis.speak(utterance)
    }
  }

  const testVoiceSettings = () => {
    speak('Testing voice settings with current preferences')
  }

  const testHapticFeedback = () => {
    if ('vibrate' in navigator && preferences.hapticEnabled) {
      navigator.vibrate([200, 100, 200])
      speak('Haptic feedback test completed')
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
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
            <h1 className="text-xl font-semibold">User Profile & Preferences</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isEditing ? <X className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-10 h-10 text-purple-600" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-2xl font-bold text-gray-800 border-b-2 border-purple-300 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="text-gray-600 border-b border-gray-300 focus:outline-none focus:border-purple-500 w-full"
                  />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="text-gray-600 border-b border-gray-300 focus:outline-none focus:border-purple-500 w-full"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentProfile?.name || 'Guest User'}
                  </h2>
                  <p className="text-gray-600">{currentProfile?.email || 'guest@navsense.com'}</p>
                  <p className="text-gray-600">{currentProfile?.phone || 'No phone number'}</p>
                </>
              )}
            </div>
            {isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveProfile}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
              >
                <Save className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Interactive Accessibility Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Accessibility className="w-5 h-5 mr-2" />
              Accessibility Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePreferenceChange('hapticEnabled', !preferences.hapticEnabled)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  preferences.hapticEnabled 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Haptic Feedback</span>
                  <Smartphone className={`w-5 h-5 ${preferences.hapticEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {preferences.hapticEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={testHapticFeedback}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Test Vibration
                </motion.button>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePreferenceChange('highContrast', !preferences.highContrast)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  preferences.highContrast 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">High Contrast</span>
                  <Eye className={`w-5 h-5 ${preferences.highContrast ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <p className="text-sm text-gray-600">
                  {preferences.highContrast ? 'Enhanced contrast' : 'Normal contrast'}
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePreferenceChange('darkMode', !preferences.darkMode)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  preferences.darkMode 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Dark Mode</span>
                  {preferences.darkMode ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                </div>
                <p className="text-sm text-gray-600">
                  {preferences.darkMode ? 'Dark theme' : 'Light theme'}
                </p>
              </motion.button>

              <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Gesture Controls</span>
                  <Shield className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Touch gestures active</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/gps-tracking'}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                >
                  Test Gestures
                </motion.button>
              </div>
            </div>
          </div>

          {/* Interactive Voice Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Volume2 className="w-5 h-5 mr-2" />
              Voice Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Voice Speed</span>
                  <Volume2 className="w-5 h-5 text-green-500" />
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={preferences.voiceSpeed}
                  onChange={(e) => handlePreferenceChange('voiceSpeed', parseFloat(e.target.value))}
                  className="w-full mb-2"
                />
                <p className="text-sm text-gray-600">Speed: {preferences.voiceSpeed.toFixed(1)}x</p>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Voice Pitch</span>
                  <Volume2 className="w-5 h-5 text-blue-500" />
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={preferences.voicePitch}
                  onChange={(e) => handlePreferenceChange('voicePitch', parseFloat(e.target.value))}
                  className="w-full mb-2"
                />
                <p className="text-sm text-gray-600">Pitch: {preferences.voicePitch.toFixed(1)}x</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={testVoiceSettings}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Voice Settings
            </motion.button>
          </div>

          {/* Text Size Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Text Size</h3>
            <div className="flex space-x-2">
              {['small', 'medium', 'large', 'extra-large'].map((size) => (
                <motion.button
                  key={size}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePreferenceChange('textSize', size)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    preferences.textSize === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Emergency Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Emergency Information
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-2">
                Emergency contacts and medical information are configured in the Emergency Contacts section.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/emergency-contacts'}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Configure Emergency Contacts
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/themes'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Moon className="w-6 h-6 text-purple-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Themes</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/languages'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Globe className="w-6 h-6 text-blue-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Languages</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/settings'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Settings className="w-6 h-6 text-gray-600 mb-2 mx-auto" />
            <span className="text-sm font-medium">Settings</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/help'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Accessibility className="w-6 h-6 text-green-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Help</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
