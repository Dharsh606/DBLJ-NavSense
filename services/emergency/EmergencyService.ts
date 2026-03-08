import * as SMS from "expo-sms";
import * as Location from "expo-location";
import { useSpeech } from "../../hooks/useSpeech";

export async function sendEmergencySms(phone: string) {
  const available = await SMS.isAvailableAsync();
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (!available || status !== "granted") return false;
  const pos = await Location.getCurrentPositionAsync({});
  const text = `Emergency. Location: ${pos.coords.latitude}, ${pos.coords.longitude}`;
  await SMS.sendSMSAsync(phone, text);
  return true;
}
