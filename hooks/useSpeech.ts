import { useCallback, useEffect, useMemo, useState } from "react";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";

export function useSpeech() {
  const [language, setLanguage] = useState<string>("en-US");

  useEffect(() => {
    Speech.getAvailableVoicesAsync();
  }, []);

  const speak = useCallback((text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Speech.speak(text, { language, rate: 1.0, pitch: 1.0 });
  }, [language]);

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return useMemo(() => ({ speak, stop, language, setLanguage }), [speak, stop, language]);
}
