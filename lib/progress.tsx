import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "ts-guide-progress-v1";

export interface Mistake {
  lessonId: string;
  qi: number;
  at: number;
}

interface ProgressState {
  doneIds: string[];
  quizCorrect: number;
  quizAnswered: number;
  mistakes: Mistake[];
  toggleDone: (id: string) => void;
  recordAnswer: (lessonId: string, qi: number, correct: boolean) => void;
  resetAll: () => void;
  isDone: (id: string) => boolean;
}

const Ctx = createContext<ProgressState>({
  doneIds: [],
  quizCorrect: 0,
  quizAnswered: 0,
  mistakes: [],
  toggleDone: () => {},
  recordAnswer: () => {},
  resetAll: () => {},
  isDone: () => false,
});

interface Persisted {
  doneIds?: string[];
  quizCorrect?: number;
  quizAnswered?: number;
  mistakes?: Mistake[];
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(0);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw) as Persisted;
          if (Array.isArray(p.doneIds)) setDoneIds(p.doneIds);
          if (typeof p.quizCorrect === "number") setQuizCorrect(p.quizCorrect);
          if (typeof p.quizAnswered === "number")
            setQuizAnswered(p.quizAnswered);
          if (Array.isArray(p.mistakes))
            setMistakes(
              p.mistakes.filter(
                (m) =>
                  typeof m?.lessonId === "string" && typeof m?.qi === "number",
              ),
            );
        }
      } catch {
        /* offline-safe: ignore */
      }
    })();
  }, []);

  const persist = (next: {
    doneIds: string[];
    quizCorrect: number;
    quizAnswered: number;
    mistakes: Mistake[];
  }) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  };

  const toggleDone = (id: string) => {
    setDoneIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      persist({ doneIds: next, quizCorrect, quizAnswered, mistakes });
      return next;
    });
  };

  const recordAnswer = (lessonId: string, qi: number, correct: boolean) => {
    const nc = quizCorrect + (correct ? 1 : 0);
    const na = quizAnswered + 1;
    setQuizCorrect(nc);
    setQuizAnswered(na);
    setMistakes((prev) => {
      const without = prev.filter(
        (m) => !(m.lessonId === lessonId && m.qi === qi),
      );
      const next = correct
        ? without
        : [...without, { lessonId, qi, at: Date.now() }];
      persist({ doneIds, quizCorrect: nc, quizAnswered: na, mistakes: next });
      return next;
    });
  };

  const resetAll = () => {
    setDoneIds([]);
    setQuizCorrect(0);
    setQuizAnswered(0);
    setMistakes([]);
    persist({ doneIds: [], quizCorrect: 0, quizAnswered: 0, mistakes: [] });
  };

  const isDone = (id: string) => doneIds.includes(id);

  return (
    <Ctx.Provider
      value={{
        doneIds,
        quizCorrect,
        quizAnswered,
        mistakes,
        toggleDone,
        recordAnswer,
        resetAll,
        isDone,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useProgress() {
  return useContext(Ctx);
}
