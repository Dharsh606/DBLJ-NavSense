// Google Maps TypeScript Definitions

declare global {
  interface Window {
    google: any;
    initMap: () => void;
    navigationService: any;
  }
}

export {};
