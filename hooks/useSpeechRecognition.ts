import { useCallback, useEffect, useMemo, useState } from "react";
let Voice: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Voice = require("react-native-voice").default;
} catch {}

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    setIsAvailable(!!Voice);
    if (Voice) {
      Voice.onSpeechResults = (e: any) => setTranscript(e.value?.[0] || "");
      Voice.onSpeechError = () => {};
    }
    return () => {
      if (Voice) Voice.destroy().then(() => {});
    };
  }, []);

  const start = useCallback(async () => {
    try {
      if (!Voice) throw new Error("Voice not available");
      await Voice.start("en-US");
      setListening(true);
    } catch {}
  }, []);

  const stop = useCallback(async () => {
    try {
      if (!Voice) return;
      await Voice.stop();
      setListening(false);
    } catch {}
  }, []);

  return useMemo(() => ({ start, stop, transcript, isAvailable, listening }), [start, stop, transcript, isAvailable, listening]);
}
