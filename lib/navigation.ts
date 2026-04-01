// Navigation Service for OSM + OSRM (free stack)

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Route {
  steps: Array<{
    instruction: string
    distance: { text: string; value: number }
    duration: { text: string; value: number }
    maneuver?: string
    location: Location
  }>
  duration: string
  distance: string
  overview_path: Location[]
}

export interface Place {
  place_id: string
  name: string
  address: string
  location: Location
}

class NavigationService {
  private currentRoute: Route | null = null

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    })
  }

  async searchPlaces(query: string): Promise<Place[]> {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      { headers: { Accept: 'application/json' } },
    )
    if (!response.ok) throw new Error('Place search failed')
    const results: any[] = await response.json()
    return results.map((place) => ({
      place_id: String(place.place_id ?? place.osm_id),
      name: String(place.display_name).split(',')[0],
      address: String(place.display_name),
      location: {
        lat: Number(place.lat),
        lng: Number(place.lon),
      },
    }))
  }

  async getDirections(origin: Location, destination: Location): Promise<Route> {
    const url = `https://router.project-osrm.org/route/v1/foot/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Directions request failed')
    const data = await response.json()
    const routeData = data.routes?.[0]
    if (!routeData) throw new Error('No route available')

    const steps = (routeData.legs?.[0]?.steps ?? []).map((step: any) => ({
      instruction: step.maneuver?.instruction ?? `Continue on ${step.name || 'current path'}`,
      distance: {
        text: `${Math.round(step.distance)} m`,
        value: step.distance,
      },
      duration: {
        text: `${Math.round(step.duration)} sec`,
        value: step.duration,
      },
      maneuver: step.maneuver?.type,
      location: {
        lat: step.maneuver?.location?.[1],
        lng: step.maneuver?.location?.[0],
      },
    }))

    const directionsRoute: Route = {
      steps,
      duration: `${Math.round(routeData.duration / 60)} min`,
      distance: `${(routeData.distance / 1000).toFixed(2)} km`,
      overview_path: (routeData.geometry?.coordinates ?? []).map((point: [number, number]) => ({
        lat: point[1],
        lng: point[0],
      })),
    }

    this.currentRoute = directionsRoute
    return directionsRoute
  }

  getCurrentRoute(): Route | null {
    return this.currentRoute
  }

  // Voice navigation instructions
  generateVoiceInstructions(route: Route): string[] {
    const instructions: string[] = []
    
    route.steps.forEach((step, index) => {
      const instruction = step.instruction
      const distance = step.distance?.text || ''
      
      // Add step number for clarity
      const stepInstruction = index === 0 
        ? `Start: ${instruction}. Distance: ${distance}`
        : `Step ${index + 1}: ${instruction}. Distance: ${distance}`;
        
      instructions.push(stepInstruction)
    })

    return instructions
  }

  // Get next step for voice guidance
  getNextStep(currentStepIndex: number = 0): string | null {
    if (!this.currentRoute || currentStepIndex >= this.currentRoute.steps.length) {
      return null;
    }

    const step = this.currentRoute.steps[currentStepIndex]
    const instruction = step.instruction
    const distance = step.distance?.text || ''
    
    return `${instruction}. Continue for ${distance}`
  }

  // Calculate distance to next turn
  getDistanceToNextTurn(currentStepIndex: number = 0): string | null {
    if (!this.currentRoute || currentStepIndex >= this.currentRoute.steps.length) {
      return null;
    }

    return this.currentRoute.steps[currentStepIndex].distance?.text || null
  }

  shouldReroute(current: Location, expected: Location, thresholdMeters = 40): boolean {
    const dx = (current.lat - expected.lat) * 111320
    const dy = (current.lng - expected.lng) * 111320
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance > thresholdMeters
  }
}

// Initialize global navigation service
declare global {
  interface Window {
    initMap: () => void;
    navigationService: NavigationService;
  }
}

export const navigationService = new NavigationService()
export default NavigationService
