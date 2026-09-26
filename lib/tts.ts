import * as Speech from "expo-speech";
import type { Lang } from "./types";

export async function speakText(text: string, lang: Lang) {
  try {
    Speech.stop();
    Speech.speak(text.slice(0, 3800), {
      language: lang === "de" ? "de-DE" : "en-US",
      rate: 0.95,
    });
    return true;
  } catch {
    return false;
  }
}

export function stopSpeech() {
  try {
    Speech.stop();
  } catch {
    /* ignore */
  }
}
