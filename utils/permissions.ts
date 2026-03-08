import { Camera } from "expo-camera";

export async function requestCameraPermissions() {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === "granted";
}
