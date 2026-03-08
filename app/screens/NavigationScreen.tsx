import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import ButtonLarge from "../../components/ButtonLarge";
import { useSpeech } from "../../hooks/useSpeech";
import { getCurrentLocation } from "../../services/location/LocationService";
import { planIndoorRoute, nextInstructionForIndoor } from "../../services/navigation/IndoorRouter";
import { planOutdoorRoute, nextInstructionForOutdoor } from "../../services/navigation/OutdoorRouter";

export default function NavigationScreen() {
  const { speak } = useSpeech();
  const [mode, setMode] = useState<"indoor" | "outdoor">("indoor");
  const [instruction, setInstruction] = useState<string>("");
  const [routeReady, setRouteReady] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    speak("Select indoor or outdoor navigation.");
  }, []);

  const startIndoor = async () => {
    const route = await planIndoorRoute("building1", "entrance", "cafeteria");
    if (route.length) {
      setRouteReady(true);
      setStepIndex(0);
      const msg = nextInstructionForIndoor(route, 0);
      setInstruction(msg);
      speak(msg);
    }
  };

  const startOutdoor = async () => {
    const loc = await getCurrentLocation();
    const route = await planOutdoorRoute(loc, "Cafeteria");
    if (route) {
      setRouteReady(true);
      setStepIndex(0);
      const msg = nextInstructionForOutdoor(route, 0);
      setInstruction(msg);
      speak(msg);
    }
  };

  const nextStep = async () => {
    const idx = stepIndex + 1;
    setStepIndex(idx);
    let msg = "";
    if (mode === "indoor") msg = nextInstructionForIndoor(undefined, idx);
    else msg = nextInstructionForOutdoor(undefined as any, idx);
    setInstruction(msg);
    speak(msg);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation</Text>
      <View style={styles.row}>
        <ButtonLarge label="Indoor" onPress={() => { setMode("indoor"); startIndoor(); }} />
        <ButtonLarge label="Outdoor" onPress={() => { setMode("outdoor"); startOutdoor(); }} />
      </View>
      <Text style={styles.instruction}>{instruction || "No route"}</Text>
      {routeReady && <ButtonLarge label="Next Step" onPress={nextStep} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 24, gap: 16 },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  row: { flexDirection: "row", gap: 12 },
  instruction: { color: "#fff", fontSize: 22, minHeight: 80 }
});
