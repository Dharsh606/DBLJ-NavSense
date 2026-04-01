'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  PhoneOff, 
  ArrowLeft,
  MapPin,
  Users,
  AlertTriangle,
  Shield,
  Truck,
  Clock,
  CheckCircle,
  Volume2,
  VolumeX
} from 'lucide-react'
import { storageService } from '@/lib/storage-service'
import { hasWebShare } from '@/lib/browser-utils'

interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship: string
  isPrimary: boolean
}

export default function EmergencyPage() {
  const [isAlertActive, setIsAlertActive] = useState(false)
  const [alertCountdown, setAlertCountdown] = useState(10)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [alertSent, setAlertSent] = useState(false)
  const [alertAudio, setAlertAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    loadEmergencyContacts()
    getCurrentLocation()
    
    // Initialize emergency alert audio
    const audio = new Audio('/emergency-alert.mp3')
    audio.loop = true // Loop the sound for continuous alert
    audio.volume = 1.0 // Maximum volume
    setAlertAudio(audio)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAlertActive && alertCountdown > 0) {
      interval = setInterval(() => {
        setAlertCountdown(prev => prev - 1)
        
        // Play countdown beep sound
        if (alertCountdown <= 3 && alertCountdown > 1) {
          playCountdownBeep()
        }
      }, 1000)
    } else if (isAlertActive && alertCountdown === 0) {
      triggerEmergencyAlert()
    }
    return () => clearInterval(interval)
  }, [isAlertActive, alertCountdown])

  const loadEmergencyContacts = () => {
    const saved = storageService.get<EmergencyContact[]>('emergencyContacts', [])
    if (saved.length) {
      setContacts(saved)
    } else {
      // Set default contacts
      const defaultContacts: EmergencyContact[] = [
        {
          id: '1',
          name: 'Emergency Services',
          phone: '911',
          relationship: 'Emergency',
          isPrimary: true
        },
        {
          id: '2',
          name: 'Family Contact',
          phone: '+1234567890',
          relationship: 'Family',
          isPrimary: false
        }
      ]
      setContacts(defaultContacts)
      storageService.set('emergencyContacts', defaultContacts)
    }
  }

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          speak('Unable to get your location. Emergency alert will be sent without location.')
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
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

  const startEmergencyAlert = () => {
    setIsAlertActive(true)
    setAlertCountdown(3)
    speak('Emergency alert activated. Hold for 3 seconds to send alert to emergency contacts.')
    
    // Play alert sound
    playWarningSound()
  }

  const playWarningSound = () => {
    // Play a warning sound when emergency is activated
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 440 // 440 Hz warning tone
    oscillator.type = 'square'
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const playCountdownBeep = () => {
    // Create a simple beep sound for countdown
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800 // 800 Hz beep
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  const cancelEmergencyAlert = () => {
    setIsAlertActive(false)
    setAlertCountdown(3)
    
    // Stop any playing sounds
    if (alertAudio) {
      alertAudio.pause()
      alertAudio.currentTime = 0
    }
    
    speak('Emergency alert cancelled.')
  }

  const triggerEmergencyAlert = () => {
    setIsAlertActive(false)
    setAlertSent(true)
    
    // Start playing emergency alert sound
    if (alertAudio) {
      alertAudio.play().catch(error => {
        console.error('Error playing emergency sound:', error)
      })
    }
    
    // Send emergency alert to all contacts
    contacts.forEach(contact => {
      sendEmergencyAlert(contact)
    })
    
    speak('Emergency alert sent to all contacts. Help is on the way.')
    
    // Reset after 5 seconds (shorter since wait time is now 3 seconds)
    setTimeout(() => {
      setAlertSent(false)
      // Stop the alert sound
      if (alertAudio) {
        alertAudio.pause()
        alertAudio.currentTime = 0
      }
    }, 5000)
  }

  const sendEmergencyAlert = (contact: EmergencyContact) => {
    const locationText = currentLocation 
      ? `Location: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
      : 'Location unavailable'
    
    const message = `EMERGENCY ALERT from DBLJ NavSense user. ${locationText}. Please contact immediately.`
    const smsBody = encodeURIComponent(message)
    window.location.href = `sms:${contact.phone}?body=${smsBody}`
  }

  const playAlertSound = () => {
    // Create alert sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800 // Alert frequency
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.2)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
    
    // Repeat sound while alert is active
    if (isAlertActive) {
      setTimeout(() => playAlertSound(), 500)
    }
  }

  const callContact = (contact: EmergencyContact) => {
    speak(`Calling ${contact.name}`)
    window.location.href = `tel:${contact.phone}`
  }

  const shareLocation = () => {
    if (currentLocation && hasWebShare()) {
      navigator.share({
        title: 'My Location',
        text: `My current location: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
        url: `https://www.openstreetmap.org/?mlat=${currentLocation.lat}&mlon=${currentLocation.lng}#map=17/${currentLocation.lat}/${currentLocation.lng}`
      }).catch(console.error)
    } else if (currentLocation) {
      // Fallback: copy to clipboard
      const locationText = `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
      navigator.clipboard.writeText(locationText).then(() => {
        speak('Location copied to clipboard')
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
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
            <h1 className="text-xl font-semibold text-red-800">Emergency Assistance</h1>
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
        {/* Emergency Alert Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isAlertActive ? cancelEmergencyAlert : startEmergencyAlert}
            className={`inline-flex items-center justify-center w-48 h-48 rounded-full cursor-pointer transition-all ${
              isAlertActive 
                ? 'bg-red-600 animate-pulse' 
                : alertSent 
                  ? 'bg-green-500' 
                  : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            <div className="text-white text-center">
              {alertSent ? (
                <CheckCircle className="w-20 h-20 mx-auto mb-2" />
              ) : isAlertActive ? (
                <>
                  <Clock className="w-20 h-20 mx-auto mb-2" />
                  <div className="text-3xl font-bold">{alertCountdown}</div>
                </>
              ) : (
                <AlertTriangle className="w-20 h-20 mx-auto" />
              )}
              <div className="text-lg font-semibold mt-2">
                {alertSent ? 'Alert Sent' : isAlertActive ? 'Cancel' : 'SOS'}
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            {alertSent ? (
              <p className="text-green-700 text-lg font-medium">
                Emergency alert sent! Help is on the way.
              </p>
            ) : isAlertActive ? (
              <p className="text-red-700 text-lg font-medium">
                Hold to send emergency alert to all contacts...
              </p>
            ) : (
              <p className="text-gray-700 text-lg">
                Press and hold the SOS button to send emergency alert
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Current Location */}
        {currentLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-500" />
              Current Location
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700">
                Latitude: {currentLocation.lat.toFixed(6)}<br />
                Longitude: {currentLocation.lng.toFixed(6)}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareLocation}
              className="w-full btn-secondary"
            >
              Share Location
            </motion.button>
          </motion.div>
        )}

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Emergency Contacts
          </h3>
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  contact.isPrimary 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      {contact.name}
                      {contact.isPrimary && (
                        <Shield className="w-4 h-4 ml-2 text-red-500" />
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => callContact(contact)}
                    className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600"
                  >
                    <Phone className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Emergency Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => callContact({ id: 'police', name: 'Police', phone: '911', relationship: 'Emergency', isPrimary: false })}
            className="bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl"
          >
            <Shield className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <h4 className="font-semibold">Police</h4>
            <p className="text-sm text-gray-600">Emergency: 911</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => callContact({ id: 'medical', name: 'Medical', phone: '911', relationship: 'Emergency', isPrimary: false })}
            className="bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl"
          >
            <Truck className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <h4 className="font-semibold">Medical</h4>
            <p className="text-sm text-gray-600">Emergency: 911</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => callContact({ id: 'fire', name: 'Fire Department', phone: '911', relationship: 'Emergency', isPrimary: false })}
            className="bg-white rounded-xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl"
          >
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-orange-500" />
            <h4 className="font-semibold">Fire</h4>
            <p className="text-sm text-gray-600">Emergency: 911</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
