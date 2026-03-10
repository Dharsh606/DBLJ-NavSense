// Navigation Service for Google Maps Integration

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Route {
  steps: any[];
  duration: string;
  distance: string;
  overview_path: any[];
}

export interface Place {
  place_id: string;
  name: string;
  address: string;
  location: Location;
}

class NavigationService {
  private map: any = null;
  private directionsService: any = null;
  private placesService: any = null;
  private currentRoute: Route | null = null;

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      this.directionsService = new window.google.maps.DirectionsService();
    }
  }

  initializeMap(mapElement: HTMLElement): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const mapOptions = {
        center: { lat: 0, lng: 0 },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
      };

      this.map = new window.google.maps.Map(mapElement, mapOptions);
      this.placesService = new window.google.maps.places.PlacesService(this.map);
      
      resolve(this.map);
    });
  }

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
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  async searchPlaces(query: string): Promise<Place[]> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Places service not initialized'));
        return;
      }

      const request = {
        query,
        fields: ['place_id', 'name', 'formatted_address', 'geometry'],
      };

      this.placesService.textSearch(request, (results: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const places: Place[] = results.map((place: any) => ({
            place_id: place.place_id!,
            name: place.name!,
            address: place.formatted_address!,
            location: {
              lat: place.geometry!.location!.lat(),
              lng: place.geometry!.location!.lng(),
            },
          }));
          resolve(places);
        } else {
          reject(new Error('Place search failed'));
        }
      });
    });
  }

  async getDirections(origin: Location, destination: Location): Promise<Route> {
    return new Promise((resolve, reject) => {
      if (!this.directionsService) {
        reject(new Error('Directions service not initialized'));
        return;
      }

      const request = {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.WALKING,
        provideRouteAlternatives: false,
      };

      this.directionsService.route(request, (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          const directionsRoute: Route = {
            steps: leg.steps,
            duration: leg.duration!.text,
            distance: leg.distance!.text,
            overview_path: route.overview_path,
          };
          
          this.currentRoute = directionsRoute;
          resolve(directionsRoute);
        } else {
          reject(new Error('Directions request failed'));
        }
      });
    });
  }

  getCurrentRoute(): Route | null {
    return this.currentRoute;
  }

  // Voice navigation instructions
  generateVoiceInstructions(route: Route): string[] {
    const instructions: string[] = [];
    
    route.steps.forEach((step, index) => {
      const instruction = step.instructions.replace(/<[^>]*>/g, ''); // Remove HTML tags
      const distance = step.distance?.text || '';
      
      // Add step number for clarity
      const stepInstruction = index === 0 
        ? `Start: ${instruction}. Distance: ${distance}`
        : `Step ${index + 1}: ${instruction}. Distance: ${distance}`;
        
      instructions.push(stepInstruction);
    });

    return instructions;
  }

  // Get next step for voice guidance
  getNextStep(currentStepIndex: number = 0): string | null {
    if (!this.currentRoute || currentStepIndex >= this.currentRoute.steps.length) {
      return null;
    }

    const step = this.currentRoute.steps[currentStepIndex];
    const instruction = step.instructions.replace(/<[^>]*>/g, '');
    const distance = step.distance?.text || '';
    
    return `${instruction}. Continue for ${distance}`;
  }

  // Calculate distance to next turn
  getDistanceToNextTurn(currentStepIndex: number = 0): string | null {
    if (!this.currentRoute || currentStepIndex >= this.currentRoute.steps.length) {
      return null;
    }

    return this.currentRoute.steps[currentStepIndex].distance?.text || null;
  }
}

// Initialize global navigation service
declare global {
  interface Window {
    initMap: () => void;
    navigationService: NavigationService;
  }
}

export const navigationService = new NavigationService();

// Initialize Google Maps callback
if (typeof window !== 'undefined') {
  window.initMap = () => {
    console.log('Google Maps initialized');
  };
}

export default NavigationService;
