import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import ButtonLarge from "../../components/ButtonLarge";
import { useSpeech } from "../../hooks/useSpeech";
import { sendEmergencySms } from "../../services/emergency/EmergencyService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen({ route }: any) {
  const { speak, language, setLanguage } = useSpeech();
  const [phone, setPhone] = useState("");

  useEffect(() => {
    speak("Settings");
    AsyncStorage.getItem("emergency_phone").then(v => v && setPhone(v));
  }, []);

  const savePhone = async () => {
    await AsyncStorage.setItem("emergency_phone", phone);
    speak("Emergency contact saved");
  };

  const triggerEmergency = async () => {
    await sendEmergencySms(phone);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.label}>Language</Text>
      <View style={styles.row}>
        <ButtonLarge label="English" onPress={() => setLanguage("en-US")} />
        <ButtonLarge label="Spanish" onPress={() => setLanguage("es-ES")} />
      </View>

      <Text style={styles.label}>Emergency Contact Phone</Text>
      <TextInput
        accessibilityLabel="Emergency phone number"
        style={styles.input}
        placeholder="Enter phone number"
        placeholderTextColor="#888"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <View style={styles.row}>
        <ButtonLarge label="Save" onPress={savePhone} />
        <ButtonLarge label="Emergency" type="danger" onPress={triggerEmergency} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 24, gap: 16 },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  label: { color: "#fff", fontSize: 18 },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  input: { color: "#fff", backgroundColor: "#111", borderColor: "#333", borderWidth: 1, borderRadius: 8, padding: 12 }
});
