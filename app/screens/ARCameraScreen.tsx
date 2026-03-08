import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import ButtonLarge from "../../components/ButtonLarge";
import { useSpeech } from "../../hooks/useSpeech";
import { Detector, DetectedObject } from "../../services/vision/Detector";
import { estimateDistanceMeters } from "../../utils/distance";
import { requestCameraPermissions } from "../../utils/permissions";

export default function ARCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const { speak } = useSpeech();
  const [running, setRunning] = useState(false);
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const detector = useRef<Detector | null>(null);

  useEffect(() => {
    requestCameraPermissions().then(setHasPermission);
    if (!permission?.granted) requestPermission();
  }, []);

  useEffect(() => {
    let interval: any;
    if (running && cameraRef.current) {
      interval = setInterval(async () => {
        try {
          const pic = await cameraRef.current!.takePictureAsync({ skipProcessing: true, base64: true, quality: 0.5 });
          const res = (await detector.current?.detectFromBase64(pic.base64 || "")) as DetectedObject[] | undefined;
          if (res && res.length) {
            setObjects(res);
            const top = res[0];
            const d = estimateDistanceMeters(top.bbox, 1080);
            speak(`Obstacle detected ${Math.max(1, Math.round(d))} meters ahead.`);
          }
        } catch {}
      }, 1500);
    }
    return () => interval && clearInterval(interval);
  }, [running]);

  useEffect(() => {
    Detector.create().then(d => (detector.current = d));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        {hasPermission ? (
          <CameraView ref={(ref: any) => (cameraRef.current = ref)} style={StyleSheet.absoluteFill} facing={"back" as CameraType} />
        ) : (
          <Text style={styles.info}>Camera permission required</Text>
        )}
      </View>
      <View style={styles.panel}>
        <Text style={styles.title}>AR Obstacle Detection</Text>
        <Text style={styles.info}>{objects.length ? `Detected: ${objects.map(o => o.class).join(", ")}` : "No obstacles"}</Text>
        <View style={styles.row}>
          <ButtonLarge label={running ? "Stop" : "Start"} onPress={() => setRunning(!running)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  preview: { flex: 2 },
  panel: { flex: 1, padding: 16, gap: 12 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  info: { color: "#ddd", fontSize: 16 },
  row: { flexDirection: "row", gap: 12 }
});
