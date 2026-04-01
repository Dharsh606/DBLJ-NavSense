export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function hasGeolocation(): boolean {
  return isBrowser() && 'geolocation' in navigator
}

export function hasSpeechSynthesis(): boolean {
  return isBrowser() && 'speechSynthesis' in window
}

export function hasWebShare(): boolean {
  return isBrowser() && 'share' in navigator
}

export function hasMediaDevices(): boolean {
  return isBrowser() && !!navigator.mediaDevices?.getUserMedia
}

