import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import ButtonLarge from "../../components/ButtonLarge";
import { useSpeech } from "../../hooks/useSpeech";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

export default function VoiceControlScreen() {
  const { speak } = useSpeech();
  const { start, stop, transcript, isAvailable } = useSpeechRecognition();
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (transcript) {
      handleCommand(transcript.toLowerCase());
    }
  }, [transcript]);

  const handleCommand = (cmd: string) => {
    if (cmd.includes("where am i")) speak("You are on the Home screen.");
    else if (cmd.includes("guide me to exit")) speak("Starting navigation to exit.");
    else if (cmd.includes("navigate to cafeteria")) speak("Starting navigation to cafeteria.");
    else if (cmd.includes("stop navigation")) speak("Navigation stopped.");
    else speak("Command not recognized.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Control</Text>
      <Text style={styles.subtitle}>{isAvailable ? "Speech recognition ready" : "Speech recognition unavailable"}</Text>
      <Text style={styles.transcript}>{transcript || "Say a command"}</Text>
      <View style={styles.row}>
        <ButtonLarge label="Start Listening" onPress={() => { start(); setStatus("listening"); }} />
        <ButtonLarge label="Stop" onPress={() => { stop(); setStatus("idle"); }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 24, gap: 16 },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "#aaa", fontSize: 16 },
  transcript: { color: "#fff", fontSize: 20, minHeight: 80 },
  row: { flexDirection: "column", gap: 16 }
});
