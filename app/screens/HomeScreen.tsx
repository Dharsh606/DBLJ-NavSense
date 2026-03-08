import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ButtonLarge from "../../components/ButtonLarge";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AR-Nav-VI</Text>
      <View style={styles.grid}>
        <ButtonLarge label="Voice Control" onPress={() => navigation.navigate("VoiceControl")} />
        <ButtonLarge label="Navigation" onPress={() => navigation.navigate("Navigation")} />
        <ButtonLarge label="Camera AR" onPress={() => navigation.navigate("ARCamera")} />
        <ButtonLarge label="Settings" onPress={() => navigation.navigate("Settings")} />
        <ButtonLarge label="Emergency" type="danger" onPress={() => navigation.navigate("Settings", { openEmergency: true })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 24, alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontSize: 32, fontWeight: "bold", marginBottom: 24 },
  grid: { width: "100%", gap: 16 }
});
