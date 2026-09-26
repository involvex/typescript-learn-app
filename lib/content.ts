import type { Lesson } from "./types";
import type { Lang } from "./types";
import { lessonsData } from "../content/lessonsData";

export const lessons: Lesson[] = lessonsData;

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function lessonsByTrack(track: Lesson["track"] | "all"): Lesson[] {
  if (track === "all") return lessons;
  return lessons.filter((l) => l.track === track);
}

export function searchLessons(query: string, lang: Lang): Lesson[] {
  const q = query.trim().toLowerCase();
  if (!q) return lessons;
  return lessons.filter((l) => {
    const hay = `${l.title} ${l.titleDe} ${l.tldr} ${l.tldrDe}`.toLowerCase();
    return hay.includes(q);
  });
}

/** Flat quiz pool for the Quiz tab: { lessonId, index } refs */
export function quizPool() {
  return lessons.flatMap((l) =>
    l.quiz.map((_, qi) => ({ lessonId: l.id, qi })),
  );
}
