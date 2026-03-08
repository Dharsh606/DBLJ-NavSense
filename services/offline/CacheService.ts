import AsyncStorage from "@react-native-async-storage/async-storage";

export async function cacheRoute(key: string, data: unknown) {
  await AsyncStorage.setItem(`route:${key}`, JSON.stringify(data));
}

export async function getCachedRoute<T = any>(key: string) {
  const v = await AsyncStorage.getItem(`route:${key}`);
  return v ? (JSON.parse(v) as T) : null;
}
