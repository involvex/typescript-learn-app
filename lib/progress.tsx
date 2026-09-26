import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "ts-guide-progress-v1";

interface ProgressState {
  doneIds: string[];
  quizCorrect: number;
  quizAnswered: number;
  toggleDone: (id: string) => void;
  recordQuiz: (correct: boolean) => void;
  resetAll: () => void;
  isDone: (id: string) => boolean;
}

const Ctx = createContext<ProgressState>({
  doneIds: [],
  quizCorrect: 0,
  quizAnswered: 0,
  toggleDone: () => {},
  recordQuiz: () => {},
  resetAll: () => {},
  isDone: () => false,
});

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw) as {
            doneIds?: string[];
            quizCorrect?: number;
            quizAnswered?: number;
          };
          if (Array.isArray(p.doneIds)) setDoneIds(p.doneIds);
          if (typeof p.quizCorrect === "number") setQuizCorrect(p.quizCorrect);
          if (typeof p.quizAnswered === "number")
            setQuizAnswered(p.quizAnswered);
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
  }) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  };

  const toggleDone = (id: string) => {
    setDoneIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      persist({ doneIds: next, quizCorrect, quizAnswered });
      return next;
    });
  };

  const recordQuiz = (correct: boolean) => {
    const nc = quizCorrect + (correct ? 1 : 0);
    const na = quizAnswered + 1;
    setQuizCorrect(nc);
    setQuizAnswered(na);
    persist({ doneIds, quizCorrect: nc, quizAnswered: na });
  };

  const resetAll = () => {
    setDoneIds([]);
    setQuizCorrect(0);
    setQuizAnswered(0);
    persist({ doneIds: [], quizCorrect: 0, quizAnswered: 0 });
  };

  const isDone = (id: string) => doneIds.includes(id);

  return (
    <Ctx.Provider
      value={{
        doneIds,
        quizCorrect,
        quizAnswered,
        toggleDone,
        recordQuiz,
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
