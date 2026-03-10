'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Volume2,
  VolumeX,
  Globe,
  Eye,
  Accessibility,
  Vibrate,
  Bell,
  Map,
  Navigation,
  Camera,
  Mic,
  Bluetooth,
  Wifi,
  Moon,
  Sun,
  Type,
  Check,
  X,
  MapPin,
  Settings
} from 'lucide-react'

interface Settings {
  voice: {
    enabled: boolean
    speed: number
    language: string
    volume: number
  }
  navigation: {
    walkingSpeed: 'slow' | 'normal' | 'fast'
    alertDistance: number
    avoidStairs: boolean
    preferAccessible: boolean
  }
  accessibility: {
    largeText: boolean
    highContrast: boolean
    vibrationAlerts: boolean
    screenReader: boolean
  }
  system: {
    darkMode: boolean
    autoStartCamera: boolean
    bluetoothAutoConnect: boolean
    locationSharing: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    voice: {
      enabled: true,
      speed: 0.9,
      language: 'en-US',
      volume: 1.0
    },
    navigation: {
      walkingSpeed: 'normal',
      alertDistance: 10,
      avoidStairs: false,
      preferAccessible: true
    },
    accessibility: {
      largeText: false,
      highContrast: false,
      vibrationAlerts: true,
      screenReader: false
    },
    system: {
      darkMode: false,
      autoStartCamera: false,
      bluetoothAutoConnect: false,
      locationSharing: true
    }
  })

  const [hasVibration, setHasVibration] = useState(false)
  const [testVoice, setTestVoice] = useState(false)

  useEffect(() => {
    loadSettings()
    checkVibrationSupport()
  }, [])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('navsenseSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings)
    localStorage.setItem('navsenseSettings', JSON.stringify(newSettings))
  }

  const checkVibrationSupport = () => {
    setHasVibration('vibrate' in navigator)
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window && settings.voice.enabled) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = settings.voice.speed
      utterance.lang = settings.voice.language
      utterance.volume = settings.voice.volume
      window.speechSynthesis.speak(utterance)
    }
  }

  const testVoiceSettings = () => {
    setTestVoice(true)
    speak('This is a test of your voice settings. If you can hear this clearly, your settings are configured correctly.')
    setTimeout(() => setTestVoice(false), 3000)
  }

  const testVibration = () => {
    if (hasVibration) {
      navigator.vibrate([200, 100, 200])
    }
  }

  const updateVoiceSettings = (key: keyof Settings['voice'], value: any) => {
    const newSettings = {
      ...settings,
      voice: {
        ...settings.voice,
        [key]: value
      }
    }
    saveSettings(newSettings)
  }

  const updateNavigationSettings = (key: keyof Settings['navigation'], value: any) => {
    const newSettings = {
      ...settings,
      navigation: {
        ...settings.navigation,
        [key]: value
      }
    }
    saveSettings(newSettings)
  }

  const updateAccessibilitySettings = (key: keyof Settings['accessibility'], value: any) => {
    const newSettings = {
      ...settings,
      accessibility: {
        ...settings.accessibility,
        [key]: value
      }
    }
    saveSettings(newSettings)
  }

  const updateSystemSettings = (key: keyof Settings['system'], value: any) => {
    const newSettings = {
      ...settings,
      system: {
        ...settings.system,
        [key]: value
      }
    }
    saveSettings(newSettings)
  }

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
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Voice Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Volume2 className="w-5 h-5 mr-2" />
            Voice Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Enable Voice Guidance</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateVoiceSettings('enabled', !settings.voice.enabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.voice.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.voice.enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>

            <div>
              <label className="text-gray-700 block mb-2">Voice Speed</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings.voice.speed}
                onChange={(e) => updateVoiceSettings('speed', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Slow</span>
                <span>{settings.voice.speed}x</span>
                <span>Fast</span>
              </div>
            </div>

            <div>
              <label className="text-gray-700 block mb-2">Language</label>
              <select
                value={settings.voice.language}
                onChange={(e) => updateVoiceSettings('language', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="it-IT">Italian</option>
                <option value="pt-BR">Portuguese</option>
                <option value="zh-CN">Chinese</option>
                <option value="ja-JP">Japanese</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 block mb-2">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.voice.volume}
                onChange={(e) => updateVoiceSettings('volume', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Quiet</span>
                <span>{Math.round(settings.voice.volume * 100)}%</span>
                <span>Loud</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={testVoiceSettings}
              disabled={!settings.voice.enabled}
              className={`w-full btn-secondary ${!settings.voice.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {testVoice ? 'Testing...' : 'Test Voice Settings'}
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <img src="/logo.png" alt="DBLJ NavSense" className="w-10 h-10 mr-3" />
            Navigation Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-700 block mb-2">Walking Speed</label>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'normal', 'fast'] as const).map(speed => (
                  <motion.button
                    key={speed}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateNavigationSettings('walkingSpeed', speed)}
                    className={`p-2 rounded-lg capitalize ${
                      settings.navigation.walkingSpeed === speed
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {speed}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-700 block mb-2">Alert Distance</label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.navigation.alertDistance}
                onChange={(e) => updateNavigationSettings('alertDistance', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>5m</span>
                <span>{settings.navigation.alertDistance}m</span>
                <span>50m</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">Avoid Stairs</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateNavigationSettings('avoidStairs', !settings.navigation.avoidStairs)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.navigation.avoidStairs ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.navigation.avoidStairs ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">Prefer Accessible Routes</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateNavigationSettings('preferAccessible', !settings.navigation.preferAccessible)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.navigation.preferAccessible ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.navigation.preferAccessible ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Accessibility Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Accessibility className="w-5 h-5 mr-2" />
            Accessibility
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Large Text</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateAccessibilitySettings('largeText', !settings.accessibility.largeText)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.accessibility.largeText ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.accessibility.largeText ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">High Contrast</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateAccessibilitySettings('highContrast', !settings.accessibility.highContrast)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.accessibility.highContrast ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.accessibility.highContrast ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Vibrate className="w-4 h-4 mr-2" />
                <span className="text-gray-700">Vibration Alerts</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateAccessibilitySettings('vibrationAlerts', !settings.accessibility.vibrationAlerts)}
                disabled={!hasVibration}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.accessibility.vibrationAlerts && hasVibration ? 'bg-green-500' : 'bg-gray-300'
                } ${!hasVibration ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.accessibility.vibrationAlerts && hasVibration ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>

            {hasVibration && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={testVibration}
                className="w-full btn-secondary"
              >
                Test Vibration
              </motion.button>
            )}

            <div className="flex items-center justify-between">
              <span className="text-gray-700">Screen Reader Mode</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateAccessibilitySettings('screenReader', !settings.accessibility.screenReader)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.accessibility.screenReader ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.accessibility.screenReader ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* System Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            System Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {settings.system.darkMode ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                <span className="text-gray-700">Dark Mode</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSystemSettings('darkMode', !settings.system.darkMode)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.system.darkMode ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.system.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                <span className="text-gray-700">Auto-start Camera</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSystemSettings('autoStartCamera', !settings.system.autoStartCamera)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.system.autoStartCamera ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.system.autoStartCamera ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bluetooth className="w-4 h-4 mr-2" />
                <span className="text-gray-700">Auto-connect Bluetooth</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSystemSettings('bluetoothAutoConnect', !settings.system.bluetoothAutoConnect)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.system.bluetoothAutoConnect ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.system.bluetoothAutoConnect ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-gray-700">Location Sharing</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateSystemSettings('locationSharing', !settings.system.locationSharing)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.system.locationSharing ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.system.locationSharing ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Reset Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Reset Settings</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (confirm('Are you sure you want to reset all settings to default?')) {
                localStorage.removeItem('navsenseSettings')
                window.location.reload()
              }
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl"
          >
            Reset to Default
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
