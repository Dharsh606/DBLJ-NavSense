 'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Mic, Search, Volume2 } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { navigationService, type Location, type Route } from '@/lib/navigation'
import { hasGeolocation, hasSpeechSynthesis } from '@/lib/browser-utils'
import { isFeatureEnabled } from '@/lib/feature-flags'

export default function NavigationPage() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [destinationQuery, setDestinationQuery] = useState('')
  const [route, setRoute] = useState<Route | null>(null)
  const [voiceMode, setVoiceMode] = useState(true)
  const [status, setStatus] = useState('Ready')
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const routeLayer = useRef<L.Polyline | null>(null)
  const markerLayer = useRef<L.LayerGroup | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    const setup = async () => {
      if (!hasGeolocation()) {
        setStatus('Geolocation is not available')
        return
      }
      try {
        const location = await navigationService.getCurrentLocation()
        setCurrentLocation(location)
        initializeMap(location)
        setStatus('Location acquired')
      } catch {
        setStatus('Unable to fetch location')
      }
    }
    setup()
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
      if (mapInstance.current) mapInstance.current.remove()
    }
  }, [])

  const initializeMap = (location: Location) => {
    if (!mapRef.current || mapInstance.current) return
    mapInstance.current = L.map(mapRef.current).setView([location.lat, location.lng], 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current)
    markerLayer.current = L.layerGroup().addTo(mapInstance.current)
    L.marker([location.lat, location.lng]).addTo(markerLayer.current).bindPopup('You are here')
  }

  const speak = (text: string) => {
    if (!voiceMode || !hasSpeechSynthesis() || !isFeatureEnabled('enableVoiceFeedback')) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }

  const startNavigation = async () => {
    if (!currentLocation || !destinationQuery.trim()) return
    try {
      setStatus('Searching destination...')
      const places = await navigationService.searchPlaces(destinationQuery)
      if (!places.length) {
        setStatus('No place found')
        return
      }
      const destination = places[0].location
      setStatus('Calculating route...')
      const nextRoute = await navigationService.getDirections(currentLocation, destination)
      setRoute(nextRoute)
      drawRoute(currentLocation, destination, nextRoute)
      speak(`Route started. ${nextRoute.steps[0]?.instruction || 'Follow the highlighted path.'}`)
      startRerouteWatcher(destination, nextRoute)
      setStatus(`Navigating to ${places[0].name}`)
    } catch {
      setStatus('Navigation failed')
    }
  }

  const drawRoute = (origin: Location, destination: Location, nextRoute: Route) => {
    if (!mapInstance.current || !markerLayer.current) return
    markerLayer.current.clearLayers()
    L.marker([origin.lat, origin.lng]).addTo(markerLayer.current).bindPopup('Start')
    L.marker([destination.lat, destination.lng]).addTo(markerLayer.current).bindPopup('Destination')
    routeLayer.current?.remove()
    routeLayer.current = L.polyline(nextRoute.overview_path.map((p) => [p.lat, p.lng]), { color: '#2563eb', weight: 6 }).addTo(mapInstance.current)
    mapInstance.current.fitBounds(routeLayer.current.getBounds(), { padding: [20, 20] })
  }

  const startRerouteWatcher = (destination: Location, activeRoute: Route) => {
    if (!hasGeolocation() || !isFeatureEnabled('enableRerouting')) return
    watchIdRef.current = navigator.geolocation.watchPosition(async (position) => {
      const current = { lat: position.coords.latitude, lng: position.coords.longitude }
      setCurrentLocation(current)
      const expected = activeRoute.steps[0]?.location
      if (!expected) return
      if (navigationService.shouldReroute(current, expected)) {
        const reroute = await navigationService.getDirections(current, destination)
        setRoute(reroute)
        drawRoute(current, destination, reroute)
        speak('Route updated to match your current position.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white shadow-sm p-4 rounded-xl mb-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.history.back()} className="p-2 rounded-lg hover:bg-gray-100 mr-3">
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <h1 className="text-xl font-semibold">Real Navigation</h1>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setVoiceMode(!voiceMode)} className={`p-2 rounded-lg ${voiceMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
            <Volume2 className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border rounded-lg"
              value={destinationQuery}
              onChange={(e) => setDestinationQuery(e.target.value)}
              placeholder="Search destination (OSM)"
            />
          </div>
          <button className="btn-primary px-4" onClick={startNavigation}><Mic className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-gray-600 mt-2">{status}</p>
      </div>

      <div ref={mapRef} className="w-full h-[420px] rounded-xl shadow-lg overflow-hidden" />

      {route && (
        <div className="bg-white rounded-xl shadow-lg p-4 mt-4">
          <h2 className="font-semibold mb-2">Route summary</h2>
          <p className="text-sm">Distance: {route.distance}</p>
          <p className="text-sm mb-3">Duration: {route.duration}</p>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {route.steps.map((step, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                {idx + 1}. {step.instruction} ({step.distance.text})
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
  )
}
