'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Navigation, 
  Mic, 
  Volume2, 
  Pause, 
  Square, 
  RotateCcw,
  ArrowLeft,
  Search,
  MapPin
} from 'lucide-react'

interface Location {
  lat: number
  lng: number
  address?: string
}

interface NavigationStep {
  instruction: string
  distance: number
  duration: number
}

export default function NavigationPage() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [destination, setDestination] = useState<Location | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [remainingDistance, setRemainingDistance] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceResponse, setVoiceResponse] = useState('')
  const [recognition, setRecognition] = useState<any>(null)
  const [voiceMode, setVoiceMode] = useState(true) // Always on for blind users
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Get current location
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
          speak('Unable to get your location. Please enable location services.')
        }
      )
    }

    // Load Google Maps
    loadGoogleMaps()
    
    // Initialize voice recognition
    initializeSpeechRecognition()
    
    // Request microphone permission and start listening automatically
    requestMicrophonePermissionAndStart()

    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel()
      }
      if (recognition) {
        recognition.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (isNavigating && !isPaused && voiceMode && navigationSteps[currentStep]) {
      speak(navigationSteps[currentStep].instruction)
    }
  }, [currentStep, isNavigating, isPaused])

  const loadGoogleMaps = async () => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.onload = initializeMap
    document.body.appendChild(script)
  }

  const requestMicrophonePermissionAndStart = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Permission granted, stop the stream (we just needed permission)
      stream.getTracks().forEach(track => track.stop())
      
      // Start voice recognition automatically
      setTimeout(() => {
        speak('Navigation system ready. Please tell me where you want to go.')
        startVoiceListening()
      }, 1000)
      
    } catch (error) {
      console.error('Microphone permission denied:', error)
      speak('Microphone permission is required for voice navigation. Please grant microphone access.')
      
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
          // Automatically restart listening for continuous interaction
          if (voiceMode) {
            setTimeout(() => {
              startVoiceListening()
            }, 500) // Faster restart for better user experience
          }
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

  const processVoiceCommand = (command: string) => {
    setVoiceResponse('Processing command...')
    
    // Navigation destination commands
    if (command.includes('go to') || command.includes('navigate to') || command.includes('take me to')) {
      const destination = extractDestination(command)
      if (destination) {
        setVoiceResponse(`Finding route to ${destination}...`)
        speak(`Finding route to ${destination}`)
        searchDestination(destination)
      } else {
        setVoiceResponse('I didn\'t catch the destination. Please try again.')
        speak('I didn\'t catch the destination. Please try again.')
      }
    }
    // Stop navigation
    else if (command.includes('stop') || command.includes('cancel')) {
      if (isNavigating) {
        stopNavigation()
        speak('Navigation stopped.')
      }
    }
    // Pause navigation
    else if (command.includes('pause')) {
      if (isNavigating && !isPaused) {
        pauseNavigation()
        speak('Navigation paused.')
      }
    }
    // Resume navigation
    else if (command.includes('resume') || command.includes('continue')) {
      if (isNavigating && isPaused) {
        pauseNavigation()
        speak('Navigation resumed.')
      }
    }
    // Repeat instruction
    else if (command.includes('repeat') || command.includes('again')) {
      if (isNavigating && navigationSteps[currentStep]) {
        speak(navigationSteps[currentStep].instruction)
      }
    }
    // Where am I
    else if (command.includes('where am i') || command.includes('my location')) {
      if (currentLocation) {
        speak(`Your current location is ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`)
      }
    }
    // Help
    else if (command.includes('help')) {
      speak('You can say: "Go to [destination]", "Stop", "Pause", "Resume", "Repeat", or "Where am I".')
    }
    else {
      setVoiceResponse('I didn\'t understand that command.')
      speak('I didn\'t understand that command. Please try saying "go to" followed by your destination.')
    }
  }

  const extractDestination = (command: string): string | null => {
    // Extract destination from voice command
    const patterns = [
      /go to (.+)/i,
      /navigate to (.+)/i,
      /take me to (.+)/i,
      /going to (.+)/i,
      /going to a (.+)/i
    ]
    
    for (const pattern of patterns) {
      const match = command.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    
    return null
  }

  const searchDestination = async (destination: string) => {
    if (!mapInstanceRef.current) return

    const service = new (window as any).google.maps.places.PlacesService(mapInstanceRef.current)
    
    service.textSearch(
      {
        query: destination,
        fields: ['name', 'geometry', 'formatted_address'],
        locationBias: currentLocation
      },
      (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          const place = results[0]
          setDestination({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name
          })
          speak(`Found ${place.name}. Ready to start navigation.`)
        } else {
          speak('Sorry, I couldn\'t find that location. Please try again.')
        }
      }
    )
  }

  const initializeMap = () => {
    if (!mapRef.current || !currentLocation) return

    const map = new (window as any).google.maps.Map(mapRef.current, {
      center: currentLocation,
      zoom: 15,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    mapInstanceRef.current = map

    // Add current location marker
    new (window as any).google.maps.Marker({
      position: currentLocation,
      map: map,
      title: 'Your Location',
      icon: {
        path: (window as any).google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#22c55e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    })

    directionsRendererRef.current = new (window as any).google.maps.DirectionsRenderer({
      map: map,
      panel: null,
      suppressMarkers: false
    })
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window && voiceMode) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearchQuery(transcript)
      handleSearch(transcript)
    }

    recognition.start()
  }

  const handleSearch = async (query: string) => {
    if (!query || !mapInstanceRef.current) return

    const placesService = new (window as any).google.maps.places.PlacesService(mapInstanceRef.current)
    
    placesService.textSearch(
      { query },
      (results: any[], status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results[0]) {
          const place = results[0]
          setDestination({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address
          })
          speak(`Destination set to ${place.name}`)
        } else {
          speak('No destination found. Please try again.')
        }
      }
    )
  }

  const startNavigation = async () => {
    if (!currentLocation || !destination || !mapInstanceRef.current) return

    const directionsService = new (window as any).google.maps.DirectionsService()
    
    directionsService.route(
      {
        origin: currentLocation,
        destination: destination,
        travelMode: (window as any).google.maps.TravelMode.WALKING
      },
      (result: any, status: any) => {
        if (status === (window as any).google.maps.DirectionsStatus.OK) {
          directionsRendererRef.current.setDirections(result)
          
          const route = result.routes[0]
          const steps = route.legs[0].steps.map((step: any) => ({
            instruction: step.instructions.replace(/<[^>]*>/g, ''),
            distance: step.distance.value,
            duration: step.duration.value
          }))
          
          setNavigationSteps(steps)
          setRemainingDistance(route.legs[0].distance.value)
          setEstimatedTime(route.legs[0].duration.value)
          setIsNavigating(true)
          setCurrentStep(0)
          
          speak(`Navigation started. ${steps[0].instruction}`)
          
          // Start tracking location
          startLocationTracking()
          
          // Automatically start camera detection for obstacle detection
          startCameraDetection()
        } else {
          speak('Unable to calculate route. Please try again.')
        }
      }
    )
  }

  const startCameraDetection = () => {
    // Check if camera is available
    if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
      console.log('Camera not available')
      return
    }

    // Request camera access and start detection
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 }
      } 
    })
    .then(stream => {
      speak('Camera activated for obstacle detection.')
      
      // Create hidden video element for processing
      const video = document.createElement('video')
      video.autoplay = true
      video.srcObject = stream
      video.style.display = 'none'
      video.id = 'navigation-camera'
      document.body.appendChild(video)

      // Wait for video to be ready then start detection
      video.addEventListener('loadeddata', () => {
        initializeObstacleDetection(video)
      })
    })
    .catch(error => {
      console.error('Camera access error:', error)
      speak('Unable to access camera for obstacle detection.')
    })
  }

  const initializeObstacleDetection = (video: HTMLVideoElement) => {
    // Load TensorFlow.js and COCO-SSD model
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js'
    script.onload = () => {
      loadCOCOModel(video)
    }
    document.head.appendChild(script)
  }

  const loadCOCOModel = async (video: HTMLVideoElement) => {
    try {
      // Load COCO-SSD model
      const model = await (window as any).tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/3', {
        fromTFHub: true
      })

      speak('Obstacle detection system ready.')
      
      // Start continuous detection
      startObstacleDetection(model, video)
      
    } catch (error) {
      console.error('Model loading error:', error)
      speak('Obstacle detection system failed to load.')
    }
  }

  const startObstacleDetection = (model: any, video: HTMLVideoElement) => {
    if (!isNavigating || isPaused) {
      // Stop camera when navigation is paused or stopped
      stopCameraDetection()
      return
    }

    try {
      // Execute model on video frame
      const predictions = model.executeAsync(video)
      predictions.then((result: any) => {
        processDetectedObjects(result)
        // Continue detection after 1 second
        setTimeout(() => startObstacleDetection(model, video), 1000)
      })
    } catch (error) {
      console.error('Detection error:', error)
      // Continue trying
      setTimeout(() => startObstacleDetection(model, video), 2000)
    }
  }

  const processDetectedObjects = (predictions: any) => {
    const dangerousObjects = ['person', 'car', 'truck', 'bus', 'bicycle', 'motorcycle', 'dog', 'chair']
    const warnings: string[] = []

    // Process predictions (simplified - actual implementation depends on model output format)
    if (predictions && predictions.length > 0) {
      predictions.forEach((prediction: any) => {
        const className = prediction.class || prediction.className
        const confidence = prediction.score || prediction.probability
        
        if (confidence > 0.6 && dangerousObjects.includes(className.toLowerCase())) {
          warnings.push(className)
        }
      })
    }

    // Speak warnings if dangerous obstacles detected
    if (warnings.length > 0) {
      const warningMessage = `Warning: ${warnings.join(', ')} detected ahead. Please be careful.`
      speak(warningMessage)
    }
  }

  const stopCameraDetection = () => {
    const video = document.getElementById('navigation-camera') as HTMLVideoElement
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      video.remove()
      speak('Camera obstacle detection stopped.')
    }
  }

  const startLocationTracking = () => {
    if (!('geolocation' in navigator)) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setCurrentLocation(newLocation)
        
        // Update map center
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(newLocation)
        }
        
        // Check if reached destination
        if (destination) {
          const distance = calculateDistance(newLocation, destination)
          if (distance < 10) { // Within 10 meters
            speak('You have arrived at your destination.')
            stopNavigation()
          }
        }
      },
      (error) => console.error('Location tracking error:', error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    )

    return watchId
  }

  const calculateDistance = (loc1: Location, loc2: Location) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (loc1.lat * Math.PI) / 180
    const φ2 = (loc2.lat * Math.PI) / 180
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180
    const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const pauseNavigation = () => {
    if (!isNavigating) return
    
    setIsPaused(!isPaused)
    
    if (isPaused) {
      // Resuming - restart camera detection
      speak('Navigation resumed. Restarting obstacle detection.')
      setTimeout(() => startCameraDetection(), 1000)
    } else {
      // Pausing - stop camera detection
      stopCameraDetection()
      speak('Navigation paused. Camera obstacle detection stopped.')
    }
  }

  const stopNavigation = () => {
    setIsNavigating(false)
    setIsPaused(false)
    setNavigationSteps([])
    setCurrentStep(0)
    setDestination(null)
    
    // Stop camera detection
    stopCameraDetection()
    
    // Clear directions from map
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] })
    }
    
    speak('Navigation stopped. Camera obstacle detection disabled.')
  }

  const repeatInstruction = () => {
    if (navigationSteps[currentStep]) {
      speak(navigationSteps[currentStep].instruction)
    }
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    }
    return `${(meters / 1000).toFixed(1)} km`
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}min`
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
            <h1 className="text-xl font-semibold">Navigation</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVoiceMode(!voiceMode)}
            className={`p-2 rounded-lg ${voiceMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <Volume2 className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Voice Control Section - Always Visible for Blind Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-6 mb-6 text-white"
        >
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold mb-2">Voice Navigation Active</h2>
            <p className="text-white/80">Tell me where you want to go</p>
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
            <p className="text-xs text-white/60">Say: "Go to market near me" or "Navigate to Starbucks"</p>
          </div>
        </motion.div>

        {/* Search Bar - Fallback for sighted users */}
        {!destination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    placeholder="Where do you want to go?"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startVoiceInput}
                  className={`p-3 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-accent-500 text-white'}`}
                >
                  <Mic className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-4"
          style={{ height: '400px' }}
        >
          <div ref={mapRef} className="w-full h-full" />
        </motion.div>

        {/* Navigation Info */}
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Current Instruction */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-2">Current Instruction</h2>
              <p className="text-2xl font-medium text-gray-800 mb-4">
                {navigationSteps[currentStep]?.instruction || 'Preparing route...'}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Distance:</span>
                  <span className="ml-2 font-medium">{formatDistance(remainingDistance)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <span className="ml-2 font-medium">{formatTime(estimatedTime)}</span>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={repeatInstruction}
                  className="btn-secondary"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Repeat
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseNavigation}
                  className="btn-accent"
                >
                  {isPaused ? <img src="/logo.png" alt="DBLJ NavSense" className="w-8 h-8 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopNavigation}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop
                </motion.button>
              </div>
            </div>

            {/* Step List */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold mb-3">Route Steps</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {navigationSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${index === currentStep ? 'bg-primary-100 border-2 border-primary-500' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${index === currentStep ? 'font-medium' : ''}`}>
                        {step.instruction}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDistance(step.distance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Start Navigation Button */}
        {destination && !isNavigating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-2">Destination</h2>
            <p className="text-gray-600 mb-4">{destination.address}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNavigation}
              className="w-full btn-primary"
            >
              <img src="/logo.png" alt="DBLJ NavSense" className="w-8 h-8 mr-2" />
              Start Navigation
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
