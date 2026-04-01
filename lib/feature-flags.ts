export const featureFlags = {
  enableVoiceFeedback: true,
  enableObstacleDetection: true,
  enableOfflineFallback: true,
  enableEmergencyShare: true,
  enableRerouting: true,
}

export type FeatureFlagKey = keyof typeof featureFlags

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return featureFlags[flag]
}

