import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: "AR-Nav-VI",
  slug: "ar-nav-vi",
  scheme: "arnavvi",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false
  },
  android: {
    package: "com.arnavvi.app",
    versionCode: 1,
    permissions: [
      "CAMERA",
      "RECORD_AUDIO",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "VIBRATE",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "INTERNET",
      "SEND_SMS"
    ],
    softwareKeyboardLayoutMode: "pan"
  },
  plugins: [
    [
      "expo-camera",
      {
        cameraPermission: "Allow AR-Nav-VI to access your camera",
        microphonePermission: "Allow AR-Nav-VI to access your microphone",
        recordAudioAndroid: true,
        barcodeScannerEnabled: false
      }
    ]
  ],
  extra: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ""
  }
});
