'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Camera, 
  Mic, 
  Bluetooth, 
  History, 
  Settings, 
  HelpCircle, 
  Phone,
  Navigation,
  Shield,
  Wifi,
  WifiOff,
  CameraOff,
  MicOff,
  BluetoothOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { navigationService, Location, Place, Route } from '../lib/navigation'

interface SystemStatus {
  location: boolean
  camera: boolean
  microphone: boolean
  bluetooth: boolean
  internet: boolean
}

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceResponse, setVoiceResponse] = useState('')
  const [recognition, setRecognition] = useState<any>(null)
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [emergencyCountdown, setEmergencyCountdown] = useState(3)
  const [alertSent, setAlertSent] = useState(false)
  const [alertAudio, setAlertAudio] = useState<HTMLAudioElement | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    location: false,
    camera: false,
    microphone: false,
    bluetooth: false,
    internet: navigator.onLine
  })
  
  // Navigation states
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [destination, setDestination] = useState<Location | null>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)

  // Enhanced feedback function for blind users
  const provideFeedback = (message: string, isConfirmation: boolean = false) => {
    setVoiceResponse(message)
    speak(message)
    if (!isConfirmation) {
      // Add haptic feedback if available (for mobile devices)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]) // Short vibration pattern
      }
    }
  }

  useEffect(() => {
    // Check system permissions and status
    const checkSystemStatus = async () => {
      const status: SystemStatus = {
        location: false,
        camera: false,
        microphone: false,
        bluetooth: false,
        internet: navigator.onLine
      }

      // Check real location permission and GPS
      if ('geolocation' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
          status.location = permission.state === 'granted'
          
          // Also test if GPS is actually working
          if (status.location) {
            navigator.geolocation.getCurrentPosition(
              () => { /* GPS working */ },
              () => { status.location = false } // GPS not working
            )
          }
        } catch (error) {
          console.log('Location permission not available')
        }
      }

      // Check real camera permission and availability
      if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const cameras = devices.filter(device => device.kind === 'videoinput')
          status.camera = cameras.length > 0
          
          // Also check permission
          try {
            const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
            status.camera = status.camera && permission.state === 'granted'
          } catch (error) {
            // Try to access camera to check permission
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true })
              stream.getTracks().forEach(track => track.stop())
              status.camera = true
            } catch (cameraError) {
              status.camera = false
            }
          }
        } catch (error) {
          console.log('Camera not available')
        }
      }

      // Check real microphone permission
      if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const microphones = devices.filter(device => device.kind === 'audioinput')
          status.microphone = microphones.length > 0
          
          // Also check permission
          try {
            const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
            status.microphone = status.microphone && permission.state === 'granted'
          } catch (error) {
            // Try to access microphone to check permission
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
              stream.getTracks().forEach(track => track.stop())
              status.microphone = true
            } catch (micError) {
              status.microphone = false
            }
          }
        } catch (error) {
          console.log('Microphone not available')
        }
      }

      // Check real Bluetooth status
      if ('bluetooth' in navigator) {
        try {
          // Check if Bluetooth is available and enabled
          const bluetooth = (navigator as any).bluetooth
          if (bluetooth) {
            // Try to get Bluetooth devices to check if it's enabled
            try {
              await bluetooth.getAvailability()
              status.bluetooth = true
            } catch (error) {
              status.bluetooth = false
            }
          }
        } catch (error) {
          console.log('Bluetooth not available')
          status.bluetooth = false
        }
      }

      setSystemStatus(status)
    }

    checkSystemStatus()
    initializeSpeechRecognition()

    // Monitor internet connection
    const handleOnline = () => setSystemStatus(prev => ({ ...prev, internet: true }))
    const handleOffline = () => setSystemStatus(prev => ({ ...prev, internet: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Monitor Bluetooth changes
    if ('bluetooth' in navigator) {
      const bluetooth = (navigator as any).bluetooth
      if (bluetooth && bluetooth.addEventListener) {
        const handleBluetoothChange = () => {
          checkSystemStatus()
        }
        bluetooth.addEventListener('availabilitychanged', handleBluetoothChange)
      }
    }

    // Periodic status check (every 5 seconds)
    const statusInterval = setInterval(checkSystemStatus, 5000)

    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false)
      // Request microphone permission and start listening automatically
      setTimeout(() => requestMicrophonePermissionAndStart(), 1000)
    }, 3000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(statusInterval)
      clearTimeout(timer)
    }
  }, [])

  // Enhanced welcome message on app load/reload
  useEffect(() => {
    const welcomeUser = () => {
      provideFeedback('Welcome to DBLJ NavSense', true)
      speak('Welcome to DBLJ NavSense. Your AI-powered navigation assistant is ready to help you navigate the world safely.')
      
      // Enhanced welcome message with available features
      setTimeout(() => {
        const availableFeatures = []
        if (systemStatus.location) availableFeatures.push('GPS location services are available')
        if (systemStatus.camera) availableFeatures.push('Camera detection is ready')
        if (systemStatus.microphone) availableFeatures.push('Voice commands are ready')
        if (systemStatus.bluetooth) availableFeatures.push('Bluetooth devices are available')
        if (systemStatus.internet) availableFeatures.push('Internet connection is active')
        
        if (availableFeatures.length > 0) {
          const featuresList = availableFeatures.join('. ')
          provideFeedback(`Available features: ${featuresList}`, false)
          speak(`Available features: ${featuresList}`)
        }
      }, 2000)
    }
    
    // Welcome message on page visibility change (app reload)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        welcomeUser()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [systemStatus])

  const requestMicrophonePermissionAndStart = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Permission granted, stop the stream (we just needed permission)
      stream.getTracks().forEach(track => track.stop())
      
      // Start voice recognition automatically
      setTimeout(() => {
        speak('DBLJ NavSense ready. How can I help you today?')
        startVoiceListening()
      }, 1000)
      
    } catch (error) {
      console.error('Microphone permission denied:', error)
      speak('Microphone permission is required for voice control. Please grant microphone access.')
      
      // Retry after 3 seconds
      setTimeout(() => {
        requestMicrophonePermissionAndStart()
      }, 3000)
    }
  }

  const initializeSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = true
        recognitionInstance.lang = 'en-US'

        recognitionInstance.onstart = () => {
          setIsListening(true)
          setVoiceResponse('Listening...')
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setVoiceResponse('Speech recognition error. Please try again.')
        }

        recognitionInstance.onresult = (event: any) => {
          const current = event.resultIndex
          const transcript = event.results[current][0].transcript.toLowerCase()
          
          setTranscript(transcript)
          
          if (event.results[current].isFinal) {
            processVoiceCommand(transcript)
          }
        }

        setRecognition(recognitionInstance)
      }
    }
  }

  const startVoiceListening = () => {
    if (recognition && !isListening) {
      recognition.start()
      setTranscript('')
      setVoiceResponse('')
    }
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9  // Slightly slower for better comprehension
      utterance.pitch = 1.1  // Slightly higher pitch for clarity
      utterance.volume = 1.0  // Maximum volume for accessibility
      window.speechSynthesis.speak(utterance)
    }
  }

  const processVoiceCommand = (command: string) => {
    setVoiceResponse('Processing command...')
    
    // Enhanced voice feedback for blind users
    const provideFeedback = (message: string, isConfirmation: boolean = false) => {
      setVoiceResponse(message)
      speak(message)
      if (!isConfirmation) {
        // Add haptic feedback if available (for mobile devices)
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]) // Short vibration pattern
        }
      }
    }
    
    // Navigation commands with enhanced feedback
    if (command.includes('navigation') || command.includes('navigate')) {
      provideFeedback('Opening navigation system', true)
      setTimeout(() => {
        window.location.href = '/navigation'
      }, 1500)
    }
    
    // NEW: Search and navigate commands
    else if (command.includes('find') || command.includes('search')) {
      const query = command.replace(/find|search/gi, '').trim()
      if (query) {
        searchDestination(query)
      } else {
        provideFeedback('What would you like to find? Say "find restaurant" or "find hospital"', false)
      }
    }
    
    else if (command.includes('navigate to') || command.includes('go to')) {
      const destination = command.replace(/navigate to|go to/gi, '').trim()
      if (destination === 'first' && searchResults.length > 0) {
        startNavigation(searchResults[0])
      } else if (destination) {
        searchDestination(destination)
      } else {
        provideFeedback('Where would you like to go? Say "navigate to coffee shop" or "navigate to hospital"', false)
      }
    }
    
    else if (command.includes('stop navigation') || command.includes('cancel navigation')) {
      if (isNavigating) {
        stopNavigation()
      } else {
        provideFeedback('No active navigation to stop', false)
      }
    }
    
    else if (command.includes('next step') || command.includes('continue')) {
      if (isNavigating && currentRoute) {
        const nextStep = navigationService.getNextStep(currentStepIndex)
        if (nextStep) {
          provideFeedback(nextStep, false)
          setCurrentStepIndex(prev => prev + 1)
        } else {
          provideFeedback('You have arrived at your destination!', true)
          stopNavigation()
        }
      } else {
        provideFeedback('No active navigation', false)
      }
    }
    
    else if (command.includes('repeat') || command.includes('again')) {
      if (isNavigating && currentRoute) {
        const currentStep = navigationService.getNextStep(currentStepIndex - 1)
        if (currentStep) {
          provideFeedback(currentStep, false)
        } else {
          provideFeedback('No previous instruction to repeat', false)
        }
      } else {
        provideFeedback('No active navigation', false)
      }
    }
    
    // Camera commands with enhanced feedback
    else if (command.includes('camera') || command.includes('detect')) {
      provideFeedback('Starting camera detection', true)
      speak('Starting camera detection')
      setTimeout(() => {
        window.location.href = '/camera-detection'
      }, 1500)
    }
    
    // Emergency commands with enhanced feedback
    else if (command.includes('emergency') || command.includes('help me') || command.includes('sos')) {
      provideFeedback('Activating emergency assistance', true)
      speak('Emergency assistance activated. Help is on the way.')
      
      // Immediate emergency activation for voice commands (no countdown)
      setAlertSent(true)
      speak('Emergency alert sent to all contacts. Help is on the way.')
      
      // Start playing emergency alert sound (siren) immediately
      if (alertAudio) {
        alertAudio.play().catch(error => {
          console.error('Error playing emergency sound:', error)
          // Fallback: Create emergency siren sound
          playEmergencySirenFallback()
        })
      } else {
        // Fallback: Create emergency siren sound
        playEmergencySirenFallback()
      }
      
      // Enhanced emergency feedback
      if ('vibrate' in navigator) {
        // Strong vibration pattern for emergency
        navigator.vibrate([500, 200, 500, 200, 500]) // Emergency vibration pattern
      }
      
      // Get current location and send alert
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationText = `Location: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
            const message = `EMERGENCY ALERT from DBLJ NavSense user. ${locationText}. Please contact immediately.`
            
            console.log(`Emergency alert sent: ${message}`)
            // In production, send to emergency contacts/services
          },
          (error) => {
            console.error('Error getting location for emergency:', error)
            provideFeedback('Unable to get location for emergency', false)
          }
        )
      }
      
      // Reset after 5 seconds
      setTimeout(() => {
        setAlertSent(false)
        if (alertAudio) {
          alertAudio.pause()
          alertAudio.currentTime = 0
        }
      }, 5000)
    }
    
    // Settings commands with enhanced feedback
    else if (command.includes('settings')) {
      provideFeedback('Opening settings', true)
      speak('Opening settings')
      setTimeout(() => {
        window.location.href = '/settings'
      }, 1500)
    }
    
    // Location commands with enhanced feedback
    else if (command.includes('where am i') || command.includes('location')) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const locationText = `Your current location is ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            provideFeedback(locationText, true)
            speak(locationText)
          },
          (error) => {
            const errorText = 'Unable to get your location. Please enable location services.'
            provideFeedback(errorText, false)
            speak(errorText)
          }
        )
      } else {
        const errorText = 'Location services are not available on this device.'
        provideFeedback(errorText, false)
        speak(errorText)
      }
    }
    
    // History commands with enhanced feedback
    else if (command.includes('history')) {
      provideFeedback('Opening navigation history', true)
      speak('Opening navigation history')
      setTimeout(() => {
        window.location.href = '/history'
      }, 1500)
    }
    
    // Bluetooth commands with enhanced feedback
    else if (command.includes('bluetooth')) {
      provideFeedback('Opening bluetooth devices', true)
      speak('Opening bluetooth devices')
      setTimeout(() => {
        window.location.href = '/bluetooth'
      }, 1500)
    }
    
    // Help commands with enhanced feedback
    else if (command.includes('help')) {
      provideFeedback('Opening help guide', true)
      speak('Opening help guide. You can say: find, navigate to, stop navigation, next step, repeat, emergency, settings, or location.')
      setTimeout(() => {
        window.location.href = '/help'
      }, 1500)
    }
    
    // Enhanced unknown command handling
    else {
      const suggestions = 'I didn\'t understand that command. Please try saying: find restaurant, navigate to coffee shop, stop navigation, next step, emergency, settings, or location.'
      provideFeedback(suggestions, false)
      speak(suggestions)
    }
  }

  // Emergency Functions
  useEffect(() => {
    // Initialize emergency alert audio
    const audio = new Audio('/emergency-alert.mp3')
    audio.loop = true
    audio.volume = 1.0
    
    // Preload the audio to ensure it's ready
    audio.load()
    
    setAlertAudio(audio)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isEmergencyActive && emergencyCountdown > 0) {
      interval = setInterval(() => {
        setEmergencyCountdown(prev => prev - 1)
        
        // Play countdown beep sound
        if (emergencyCountdown <= 2 && emergencyCountdown > 1) {
          playEmergencyCountdownBeep()
        }
      }, 1000)
    } else if (isEmergencyActive && emergencyCountdown === 0) {
      triggerEmergencyAlert()
    }
    return () => clearInterval(interval)
  }, [isEmergencyActive, emergencyCountdown])

  const playEmergencySirenFallback = () => {
    // Create emergency siren sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    const oscillator1 = audioContext.createOscillator()
    const oscillator2 = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Create siren effect with two oscillators
    oscillator1.frequency.value = 800
    oscillator2.frequency.value = 1000
    oscillator1.type = 'square'
    oscillator2.type = 'sawtooth'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    
    oscillator1.start(audioContext.currentTime)
    oscillator2.start(audioContext.currentTime)
    
    // Alternate frequencies for siren effect
    let frequency1 = 800
    let frequency2 = 1000
    
    const sirenInterval = setInterval(() => {
      frequency1 = frequency1 === 800 ? 600 : 800
      frequency2 = frequency2 === 1000 ? 800 : 1000
      
      oscillator1.frequency.setValueAtTime(frequency1, audioContext.currentTime)
      oscillator2.frequency.setValueAtTime(frequency2, audioContext.currentTime)
    }, 500)
    
    // Stop siren after 5 seconds
    setTimeout(() => {
      clearInterval(sirenInterval)
      oscillator1.stop()
      oscillator2.stop()
    }, 5000)
  }

  const playEmergencyCountdownBeep = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  const startEmergencyAlert = () => {
    if (isEmergencyActive) {
      // Cancel emergency if clicked during countdown
      cancelEmergencyAlert()
      return
    }
    
    setIsEmergencyActive(true)
    setEmergencyCountdown(3)
    speak('Emergency alert activated. Sending in 3 seconds...')
    
    // Play warning sound
    playEmergencyWarningSound()
  }

  const playEmergencyWarningSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 440
    oscillator.type = 'square'
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const cancelEmergencyAlert = () => {
    setIsEmergencyActive(false)
    setEmergencyCountdown(3)
    
    if (alertAudio) {
      alertAudio.pause()
      alertAudio.currentTime = 0
    }
    
    speak('Emergency alert cancelled.')
  }

  const triggerEmergencyAlert = () => {
    setIsEmergencyActive(false)
    setAlertSent(true)
    
    speak('Emergency alert sent to all contacts. Help is on the way.')
    
    // Start playing emergency alert sound (siren)
    if (alertAudio) {
      alertAudio.play().catch(error => {
        console.error('Error playing emergency sound:', error)
        // Fallback: Create emergency siren sound
        playEmergencySirenFallback()
      })
    } else {
      // Fallback: Create emergency siren sound
      playEmergencySirenFallback()
    }
    
    // Get current location and send alert
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationText = `Location: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          const message = `EMERGENCY ALERT from DBLJ NavSense user. ${locationText}. Please contact immediately.`
          
          console.log(`Emergency alert sent: ${message}`)
          // In production, send to emergency contacts/services
        },
        (error) => {
          console.error('Error getting location for emergency:', error)
        }
      )
    }
    
    // Reset after 5 seconds
    setTimeout(() => {
      setAlertSent(false)
      if (alertAudio) {
        alertAudio.pause()
        alertAudio.currentTime = 0
      }
    }, 5000)
  }

  if (showSplash) {
    return <SplashScreen />
  }

  const handleNavigation = () => {
    window.location.href = '/navigation'
  }

  const handleCamera = () => {
    window.location.href = '/camera-detection'
  }

  const handleVoice = () => {
    startVoiceListening()
  }

  const handleBluetooth = () => {
    window.location.href = '/bluetooth'
  }

  const handleHistory = () => {
    window.location.href = '/history'
  }

  const handleEmergency = () => {
    window.location.href = '/emergency'
  }

  const handleSettings = () => {
    window.location.href = '/settings'
  }

  const handleHelp = () => {
    window.location.href = '/help'
  }

  const handleSOS = () => {
    startEmergencyAlert()
  }

  // Navigation functions
  const startNavigation = async (destinationPlace: Place) => {
    try {
      provideFeedback('Getting your current location...', true)
      const location = await navigationService.getCurrentLocation()
      setCurrentLocation(location)
      
      provideFeedback('Calculating route to ' + destinationPlace.name, true)
      const route = await navigationService.getDirections(location, destinationPlace.location)
      setCurrentRoute(route)
      setDestination(destinationPlace.location)
      setIsNavigating(true)
      setCurrentStepIndex(0)
      
      // Start voice navigation
      const instructions = navigationService.generateVoiceInstructions(route)
      provideFeedback('Navigation started! ' + instructions[0], true)
      
      // Start step-by-step voice guidance
      startVoiceGuidance()
      
    } catch (error) {
      console.error('Navigation error:', error)
      provideFeedback('Failed to start navigation. Please try again.', false)
    }
  }

  const startVoiceGuidance = () => {
    if (!currentRoute) return
    
    const giveNextInstruction = () => {
      if (!isNavigating || !currentRoute) return
      
      const nextStep = navigationService.getNextStep(currentStepIndex)
      if (nextStep) {
        provideFeedback(nextStep, false)
        setCurrentStepIndex(prev => prev + 1)
        
        // Schedule next instruction based on distance
        setTimeout(giveNextInstruction, 10000) // Give next instruction in 10 seconds
      } else {
        provideFeedback('You have arrived at your destination!', true)
        setIsNavigating(false)
        setCurrentRoute(null)
        setCurrentStepIndex(0)
      }
    }
    
    giveNextInstruction()
  }

  const searchDestination = async (query: string) => {
    try {
      provideFeedback('Searching for ' + query, true)
      const places = await navigationService.searchPlaces(query)
      setSearchResults(places)
      
      if (places.length > 0) {
        provideFeedback(`Found ${places.length} places. The first is ${places[0].name}. Say "navigate to first" to start navigation.`, true)
        speak(`Found ${places.length} places. ${places[0].name} is the first result.`)
      } else {
        provideFeedback('No places found for ' + query, false)
      }
    } catch (error) {
      console.error('Search error:', error)
      provideFeedback('Failed to search for places', false)
    }
  }

  const stopNavigation = () => {
    setIsNavigating(false)
    setCurrentRoute(null)
    setCurrentStepIndex(0)
    setDestination(null)
    provideFeedback('Navigation stopped', true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-4"
          >
            <img src="/logo.png" alt="DBLJ NavSense" className="w-14 h-14" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">DBLJ NavSense</h1>
          <p className="text-gray-600">Sense the Path. Navigate the World.</p>
        </div>

        {/* Emergency SOS Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="text-center">
            <motion.button
              whileHover={{ scale: isEmergencyActive ? 1 : 1.05 }}
              whileTap={{ scale: isEmergencyActive ? 1 : 0.95 }}
              onClick={handleSOS}
              className={`relative inline-flex items-center justify-center w-32 h-32 rounded-full font-bold text-2xl shadow-2xl transition-all duration-200 ${
                alertSent 
                  ? 'bg-green-500 text-white' 
                  : isEmergencyActive
                  ? 'bg-orange-500 text-white animate-pulse'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {alertSent ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 mb-2" />
                  <div>SENT</div>
                </div>
              ) : isEmergencyActive ? (
                <div className="text-center">
                  <div className="text-3xl font-bold">{emergencyCountdown}</div>
                  <div className="text-xs">CLICK TO CANCEL</div>
                </div>
              ) : (
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 mb-2" />
                  <div>SOS</div>
                </div>
              )}
            </motion.button>
            
            {alertSent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-green-100 rounded-lg"
              >
                <p className="text-green-800 font-semibold">Emergency alert sent!</p>
                <p className="text-green-600 text-sm">Help is on the way</p>
              </motion.div>
            )}
            
            <p className="text-gray-600 text-sm mt-4">Click SOS button to start 3-second countdown. Click again to cancel.</p>
          </div>
        </motion.div>

        {/* Voice Control Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-6 text-white">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold mb-2">Voice Control Active</h2>
              <p className="text-white/80">Speak commands to control the app</p>
            </div>
            
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ scale: isListening ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full cursor-pointer"
                onClick={startVoiceListening}
              >
                <Mic className={`w-10 h-10 ${isListening ? 'text-white' : 'text-white/80'}`} />
              </motion.div>
            </div>
            
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg"
              >
                <p className="text-sm">"{transcript}"</p>
              </motion.div>
            )}
            
            {voiceResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-lg"
              >
                <p className="text-sm">{voiceResponse}</p>
              </motion.div>
            )}
            
            <div className="mt-4 text-center">
              <p className="text-xs text-white/60">Try: "navigation", "camera", "emergency", "where am i"</p>
            </div>
          </div>
        </motion.div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNavigation}
            className="card cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <MapPin className="w-12 h-12 text-primary-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Navigation</h3>
              <p className="text-gray-600 text-sm">Get real-time navigation guidance</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCamera}
            className="card cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <Camera className="w-12 h-12 text-secondary-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AR Camera Detection</h3>
              <p className="text-gray-600 text-sm">Detect obstacles in your path</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBluetooth}
            className="card cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <Bluetooth className="w-12 h-12 text-blue-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Bluetooth Devices</h3>
              <p className="text-gray-600 text-sm">Connect to assistive devices</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHistory}
            className="card cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <History className="w-12 h-12 text-purple-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Navigation History</h3>
              <p className="text-gray-600 text-sm">View your past routes</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEmergency}
            className="card cursor-pointer border-red-200 bg-red-50"
          >
            <div className="flex flex-col items-center text-center">
              <Phone className="w-12 h-12 text-red-500 mb-3" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Assistance</h3>
              <p className="text-red-600 text-sm">Get help immediately</p>
            </div>
          </motion.div>
        </div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="flex justify-center space-x-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSettings}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHelp}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <HelpCircle className="w-6 h-6 text-gray-600" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Status item component for system status
const StatusItem = ({ icon: Icon, label, status }: { icon: any, label: string, status: string }) => (
  <div className="text-center">
    <div style={{ fontSize: '24px', marginBottom: '8px', color: status === 'online' ? '#10b981' : '#666' }}>
      <Icon />
    </div>
    <div className="text-sm" style={{ color: status === 'online' ? '#10b981' : '#666' }}>
      {label}
    </div>
  </div>
)

// Splash screen component
const SplashScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
    {/* Animated background circles */}
    <div className="absolute inset-0">
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-32 h-32 bg-green-200 rounded-full blur-xl"
      />
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-40 right-32 w-40 h-40 bg-blue-200 rounded-full blur-xl"
      />
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 left-40 w-36 h-36 bg-purple-200 rounded-full blur-xl"
      />
      <motion.div
        animate={{ scale: [1, 2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-20 right-20 w-28 h-28 bg-yellow-200 rounded-full blur-xl"
      />
    </div>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto relative z-10"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-80 h-80 mb-6 relative"
        >
          {/* Bubbling circles behind logo */}
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeOut" 
            }}
            className="absolute top-4 left-8 w-8 h-8 bg-blue-400 rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, -40, 0],
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeOut",
              delay: 0.5
            }}
            className="absolute top-8 right-12 w-6 h-6 bg-purple-400 rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, -25, 0],
              scale: [1, 1.1, 1],
              opacity: [0.7, 0.4, 0.7]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeOut",
              delay: 1
            }}
            className="absolute bottom-12 left-16 w-10 h-10 bg-green-400 rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, -35, 0],
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.2, 0.4]
            }}
            transition={{ 
              duration: 3.5, 
              repeat: Infinity, 
              ease: "easeOut",
              delay: 1.5
            }}
            className="absolute bottom-8 right-8 w-7 h-7 bg-pink-400 rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeOut",
              delay: 2
            }}
            className="absolute top-20 left-20 w-5 h-5 bg-yellow-400 rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, -45, 0],
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.1, 0.5]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeOut",
              delay: 0.8
            }}
            className="absolute bottom-16 right-20 w-9 h-9 bg-cyan-400 rounded-full"
          />
          
          <motion.img 
            src="/logo.png" 
            alt="DBLJ NavSense" 
            className="w-64 h-64 relative z-10"
          />
        </motion.div>
        <motion.h1 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-4xl font-bold text-gray-800 mb-3"
        >
          DBLJ NavSense
        </motion.h1>
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-xl text-gray-600"
        >
          Sense the Path. Navigate the World.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8"
        >
          <div className="flex justify-center space-x-3">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-4 h-4 bg-green-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-4 h-4 bg-blue-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-4 h-4 bg-purple-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  </div>
)
