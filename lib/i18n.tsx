import { createContext, useContext, useState, type ReactNode } from "react";
import type { Lang } from "./types";

const ui = {
  en: {
    learn: "Learn",
    quiz: "Quiz",
    playground: "Playground",
    progress: "Progress",
    tracks: "Tracks",
    all: "All",
    jsCrash: "JS crash",
    tsCore: "TS core",
    agentReading: "Agent reading",
    startLesson: "Open lesson",
    markDone: "Mark done",
    done: "Done ✓",
    listen: "🔊 Listen",
    stop: "⏹ Stop",
    min: "min",
    tldr: "TL;DR",
    csharpLens: "C# lens",
    keyPoints: "Key points",
    tryIt: "Code",
    quizInLesson: "Check yourself",
    showAnswer: "Show explanation",
    next: "Next →",
    prev: "← Prev",
    quizAll: "Mixed quiz from all lessons",
    questionOf: "Question",
    correct: "Correct!",
    wrong: "Not quite.",
    reveal: "Reveal",
    playgroundTitle: "Playground (offline-friendly)",
    playgroundHint:
      "Edit the snippet, then tap “What does TS say?”. Offline it shows the expected answer — no compiler needed in the car. When online, open it in the TS Playground.",
    run: "What does TS say?",
    openOnline: "Open in TS Playground ↗",
    reset: "Reset",
    progressTitle: "Your progress",
    completed: "lessons done",
    quizScore: "quiz correct",
    streakNote:
      "Stored offline on this phone. Everything works in airplane mode.",
    switchToGerman: "DE",
    switchToEnglish: "EN",
    language: "Language",
    search: "Search lessons…",
  },
  de: {
    learn: "Lernen",
    quiz: "Quiz",
    playground: "Spielwiese",
    progress: "Fortschritt",
    tracks: "Spuren",
    all: "Alle",
    jsCrash: "JS-Crash",
    tsCore: "TS-Kern",
    agentReading: "Agent-Code lesen",
    startLesson: "Lektion öffnen",
    markDone: "Fertig markieren",
    done: "Fertig ✓",
    listen: "🔊 Anhören",
    stop: "⏹ Stopp",
    min: "Min.",
    tldr: "Kurzfassung",
    csharpLens: "C#-Brille",
    keyPoints: "Kernpunkte",
    tryIt: "Code",
    quizInLesson: "Teste dich",
    showAnswer: "Erklärung zeigen",
    next: "Weiter →",
    prev: "← Zurück",
    quizAll: "Gemischtes Quiz aus allen Lektionen",
    questionOf: "Frage",
    correct: "Richtig!",
    wrong: "Nicht ganz.",
    reveal: "Aufdecken",
    playgroundTitle: "Spielwiese (offline-fähig)",
    playgroundHint:
      "Bearbeite das Snippet und tippe auf „Was sagt TS?“. Offline siehst du die erwartete Antwort — kein Compiler im Auto nötig. Online im TS Playground öffnen.",
    run: "Was sagt TS?",
    openOnline: "Im TS Playground öffnen ↗",
    reset: "Zurücksetzen",
    progressTitle: "Dein Fortschritt",
    completed: "Lektionen fertig",
    quizScore: "Quiz richtig",
    streakNote:
      "Offline auf diesem Handy gespeichert. Funktioniert im Flugmodus.",
    switchToGerman: "DE",
    switchToEnglish: "EN",
    language: "Sprache",
    search: "Lektionen suchen…",
  },
} as const;

export type UiKey = keyof (typeof ui)["en"];

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: UiKey) => string;
}

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => ui.en[k] as string,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (k: UiKey): string => (ui[lang][k] ?? ui.en[k]) as string;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}
