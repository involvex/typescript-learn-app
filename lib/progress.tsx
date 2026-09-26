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
  /** how many times this question was missed (for hardest-first ordering) */
  misses: number;
}

export interface Streak {
  count: number;
  best: number;
  /** local YYYY-MM-DD of the last day with a completion */
  lastDay: string | null;
}

/** local-day key, immune to UTC shifts */
function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad, 12);
  const db = new Date(by, bm - 1, bd, 12);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

function advanceStreak(s: Streak, today: string): Streak {
  if (s.lastDay === today) return s;
  const consecutive = s.lastDay !== null && daysBetween(s.lastDay, today) === 1;
  const count = consecutive ? s.count + 1 : 1;
  return { count, best: Math.max(s.best, count), lastDay: today };
}

interface ProgressState {
  doneIds: string[];
  quizCorrect: number;
  quizAnswered: number;
  mistakes: Mistake[];
  streak: Streak;
  toggleDone: (id: string) => void;
  recordAnswer: (lessonId: string, qi: number, correct: boolean) => void;
  resetAll: () => void;
  isDone: (id: string) => boolean;
}

const EMPTY_STREAK: Streak = { count: 0, best: 0, lastDay: null };

const Ctx = createContext<ProgressState>({
  doneIds: [],
  quizCorrect: 0,
  quizAnswered: 0,
  mistakes: [],
  streak: EMPTY_STREAK,
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
  streak?: Streak;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(0);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [streak, setStreak] = useState<Streak>(EMPTY_STREAK);

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
              p.mistakes
                .filter(
                  (m) =>
                    typeof m?.lessonId === "string" &&
                    typeof m?.qi === "number",
                )
                .map((m) => ({
                  lessonId: m.lessonId as string,
                  qi: m.qi as number,
                  at: typeof m.at === "number" ? m.at : Date.now(),
                  misses:
                    typeof m.misses === "number" && m.misses > 0 ? m.misses : 1,
                })),
            );
          if (
            p.streak &&
            typeof p.streak.count === "number" &&
            typeof p.streak.best === "number"
          )
            setStreak({
              count: Math.max(0, p.streak.count),
              best: Math.max(0, p.streak.best),
              lastDay:
                typeof p.streak.lastDay === "string" ? p.streak.lastDay : null,
            });
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
    streak: Streak;
  }) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  };

  const toggleDone = (id: string) => {
    const adding = !doneIds.includes(id);
    const next = adding ? [...doneIds, id] : doneIds.filter((x) => x !== id);
    setDoneIds(next);
    // streak advances only when completing a lesson, never on unmark
    const nextStreak = adding
      ? advanceStreak(streak, dayKey(new Date()))
      : streak;
    if (adding) setStreak(nextStreak);
    persist({
      doneIds: next,
      quizCorrect,
      quizAnswered,
      mistakes,
      streak: nextStreak,
    });
  };

  const recordAnswer = (lessonId: string, qi: number, correct: boolean) => {
    const nc = quizCorrect + (correct ? 1 : 0);
    const na = quizAnswered + 1;
    setQuizCorrect(nc);
    setQuizAnswered(na);
    setMistakes((prev) => {
      const existing = prev.find((m) => m.lessonId === lessonId && m.qi === qi);
      const without = prev.filter(
        (m) => !(m.lessonId === lessonId && m.qi === qi),
      );
      const next = correct
        ? without
        : [
            ...without,
            {
              lessonId,
              qi,
              at: Date.now(),
              misses: (existing?.misses ?? 0) + 1,
            },
          ];
      persist({
        doneIds,
        quizCorrect: nc,
        quizAnswered: na,
        mistakes: next,
        streak,
      });
      return next;
    });
  };

  const resetAll = () => {
    setDoneIds([]);
    setQuizCorrect(0);
    setQuizAnswered(0);
    setMistakes([]);
    setStreak(EMPTY_STREAK);
    persist({
      doneIds: [],
      quizCorrect: 0,
      quizAnswered: 0,
      mistakes: [],
      streak: EMPTY_STREAK,
    });
  };

  const isDone = (id: string) => doneIds.includes(id);

  return (
    <Ctx.Provider
      value={{
        doneIds,
        quizCorrect,
        quizAnswered,
        mistakes,
        streak,
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
