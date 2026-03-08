import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  type?: "primary" | "danger";
};

export default function ButtonLarge({ label, onPress, type = "primary" }: Props) {
  return (
    <Pressable accessibilityRole="button" style={[styles.button, type === "danger" ? styles.danger : styles.primary]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { height: 72, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: "#1e90ff" },
  danger: { backgroundColor: "#ff3b30" },
  label: { color: "#fff", fontSize: 24, fontWeight: "bold" }
});
