'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Mic, 
  Camera, 
  Navigation, 
  AlertTriangle,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  SkipForward,
  HelpCircle,
  Settings,
  Eye,
  Shield,
  Smartphone,
  ArrowLeft,
  CheckCircle,
  BookOpen,
  Phone,
  Mail,
  AlertCircle,
  Bluetooth
} from 'lucide-react'

interface HelpSection {
  id: string
  title: string
  icon: any
  content: string[]
  expanded?: boolean
}

export default function HelpPage() {
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [isReading, setIsReading] = useState(false)
  const [currentReadingIndex, setCurrentReadingIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'logo',
      content: [
        'DBLJ NavSense is designed to help visually impaired users navigate safely using voice guidance and real-time obstacle detection.',
        'When you first open the app, grant permissions for location, camera, and microphone when prompted.',
        'The home dashboard shows your system status and provides quick access to all features.',
        'Use voice commands for hands-free control of the application.',
        'All features are optimized for screen readers and accessibility.'
      ]
    },
    {
      id: 'navigation',
      title: 'Using Navigation',
      icon: MapPin,
      content: [
        'Tap "Start Navigation" or say "Open navigation" to begin.',
        'Enter your destination by typing or using voice input.',
        'The app will calculate the best walking route and provide step-by-step voice guidance.',
        'Follow the voice instructions to reach your destination safely.',
        'Use the "Repeat" button if you need to hear the last instruction again.',
        'You can pause or stop navigation at any time using the control buttons.'
      ]
    },
    {
      id: 'voice-commands',
      title: 'Voice Commands',
      icon: Mic,
      content: [
        'Tap the microphone button or say "Voice command" to activate voice control.',
        'Available commands include: "Open navigation", "Start camera", "Where am I", "Emergency", and more.',
        'Speak clearly and naturally for best recognition results.',
        'The system will confirm your commands with voice feedback.',
        'Voice commands work even when the screen is locked on some devices.'
      ]
    },
    {
      id: 'camera-detection',
      title: 'Camera Obstacle Detection',
      icon: Camera,
      content: [
        'Tap "AR Camera Detection" or say "Start camera" to activate obstacle detection.',
        'Point your camera forward to detect obstacles in your path.',
        'The app will identify objects like people, vehicles, chairs, and doors.',
        'Voice warnings will alert you to nearby obstacles.',
        'Colored bounding boxes show detected objects on screen.',
        'Detection works best in well-lit environments.'
      ]
    },
    {
      id: 'bluetooth-devices',
      title: 'Bluetooth Devices',
      icon: Bluetooth,
      content: [
        'Connect assistive Bluetooth devices like headphones or sensors.',
        'Tap "Scan for Devices" to find nearby Bluetooth devices.',
        'Select a device to connect and test the connection.',
        'Connected devices show battery level and signal strength.',
        'Enable auto-connect in settings for faster pairing.'
      ]
    },
    {
      id: 'emergency-assistance',
      title: 'Emergency Assistance',
      icon: Phone,
      content: [
        'Press and hold the SOS button for 10 seconds to send emergency alerts.',
        'Your current location will be sent to all emergency contacts.',
        'Quick call buttons provide immediate access to emergency services.',
        'Emergency contacts can be managed in the settings.',
        'The app will play alert sounds when emergency is activated.'
      ]
    },
    {
      id: 'accessibility',
      title: 'Accessibility Features',
      icon: Eye,
      content: [
        'Large text mode increases font sizes for better readability.',
        'High contrast mode improves visibility for low vision users.',
        'Vibration alerts provide tactile feedback when available.',
        'Screen reader compatibility ensures full accessibility.',
        'Voice-first design allows complete control without touching the screen.',
        'All buttons and controls are designed for easy interaction.'
      ]
    },
    {
      id: 'settings',
      title: 'Settings and Customization',
      icon: Settings,
      content: [
        'Adjust voice speed, language, and volume in voice settings.',
        'Set walking speed and alert distances in navigation settings.',
        'Enable accessibility features based on your needs.',
        'Configure Bluetooth and camera auto-start options.',
        'Reset settings to default if needed.',
        'All settings are saved automatically for your convenience.'
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: AlertCircle,
      content: [
        'If navigation doesn\'t work, check your internet connection and location services.',
        'For camera issues, ensure camera permissions are granted and lens is clean.',
        'Voice commands may not work in noisy environments - try speaking louder.',
        'Bluetooth connection problems can be solved by restarting Bluetooth.',
        'If the app crashes, restart it and check for updates.',
        'Contact support if issues persist after trying these solutions.'
      ]
    }
  ]

  useEffect(() => {
    const savedVoiceSetting = localStorage.getItem('voiceEnabled')
    if (savedVoiceSetting) {
      setVoiceEnabled(JSON.parse(savedVoiceSetting))
    }
  }, [])

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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const readSection = (section: HelpSection) => {
    if (!voiceEnabled) return
    
    const fullText = `${section.title}. ${section.content.join(' ')}`
    speak(fullText)
  }

  const readAllContent = () => {
    if (!voiceEnabled || isReading) return
    
    setIsReading(true)
    setCurrentReadingIndex(0)
    
    const readNext = (index: number) => {
      if (index >= helpSections.length) {
        setIsReading(false)
        setCurrentReadingIndex(0)
        return
      }
      
      const section = helpSections[index]
      const fullText = `${section.title}. ${section.content.join(' ')}`
      
      const utterance = new SpeechSynthesisUtterance(fullText)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onend = () => {
        setCurrentReadingIndex(index + 1)
        setTimeout(() => readNext(index + 1), 1000)
      }
      
      window.speechSynthesis.speak(utterance)
    }
    
    readNext(0)
  }

  const stopReading = () => {
    window.speechSynthesis.cancel()
    setIsReading(false)
    setCurrentReadingIndex(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {isClient ? (
        <>
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
            <h1 className="text-xl font-semibold">Help & Accessibility Guide</h1>
          </div>
          <div className="flex items-center space-x-2">
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
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Reading Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Voice Reading</h2>
              <p className="text-gray-600 text-sm">
                {isReading 
                  ? `Reading section ${currentReadingIndex + 1} of ${helpSections.length}`
                  : 'Listen to the help guide with voice playback'
                }
              </p>
            </div>
            <div className="flex space-x-2">
              {!isReading ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={readAllContent}
                  disabled={!voiceEnabled}
                  className={`btn-primary ${!voiceEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Read All
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopReading}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Stop Reading
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-6 mb-6 text-white"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2" />
            Quick Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-bold">1</span>
              </div>
              <p>Always grant location and camera permissions for full functionality</p>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-bold">2</span>
              </div>
              <p>Use voice commands for hands-free operation</p>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-bold">3</span>
              </div>
              <p>Keep your device charged for reliable navigation assistance</p>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-bold">4</span>
              </div>
              <p>Test emergency features when you're in a safe environment</p>
            </div>
          </div>
        </motion.div>

        {/* Help Sections */}
        <div className="space-y-4">
          {helpSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <motion.button
                whileHover={{ backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {section.icon === 'logo' ? (
                      <img src="/logo.png" alt="DBLJ NavSense" className="w-10 h-10 text-primary-500 mr-3" />
                    ) : (
                      <section.icon className="w-6 h-6 text-primary-500 mr-3" />
                    )}
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        readSection(section)
                      }}
                      disabled={!voiceEnabled}
                      className={`p-2 rounded-lg ${voiceEnabled ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </motion.button>
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </motion.button>
              
              {expandedSections.has(section.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-6 pt-0">
                    <div className="space-y-3">
                      {section.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6 mt-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            Need More Help?
          </h2>
          <p className="text-gray-700 mb-4">
            If you need additional assistance or have questions about DBLJ NavSense, we're here to help.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
            >
              <BookOpen className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">User Manual</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200"
            >
              <Phone className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">Call Support</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-accent-100 text-accent-700 rounded-lg hover:bg-accent-200"
            >
              <Mail className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">Email Support</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading help content...</p>
          </div>
        </div>
      )}
    </div>
  )
}
