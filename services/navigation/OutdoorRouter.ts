import { getCurrentLocation } from "../location/LocationService";
import Constants from "expo-constants";

type LatLng = { latitude: number; longitude: number };
type OutdoorRoute = { steps: { instruction: string; distance: number }[] };

let cachedRoute: OutdoorRoute | null = null;

export async function planOutdoorRoute(origin?: LatLng, destinationName?: string) {
  const apiKey = (Constants.expoConfig?.extra as any)?.googleMapsApiKey || "";
  cachedRoute = { steps: [{ instruction: "Head north", distance: 20 }, { instruction: "Turn left", distance: 5 }, { instruction: "Destination ahead", distance: 1 }] };
  return cachedRoute;
}

export function nextInstructionForOutdoor(route?: OutdoorRoute, index: number = 0) {
  const r = route || cachedRoute;
  if (!r || !r.steps.length || index >= r.steps.length) return "Destination reached.";
  const step = r.steps[index];
  return `${step.instruction} in ${step.distance} meters.`;
}
