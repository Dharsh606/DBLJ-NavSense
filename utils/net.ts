import * as Network from "expo-network";

export async function isOnline() {
  const st = await Network.getNetworkStateAsync();
  return !!st.isConnected && !!st.isInternetReachable;
}
