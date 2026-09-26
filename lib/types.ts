export type Lang = "en" | "de";

export interface QuizItem {
  q: string;
  qDe?: string;
  options: string[];
  optionsDe?: string[];
  answer: number;
  explain: string;
  explainDe?: string;
}

export interface Lesson {
  id: string;
  track: "js-crash" | "ts-core" | "agent-reading";
  level: number;
  minutes: number;
  source: string;
  /** Auto-imported from the handbook website; EN-only, needs curation. */
  auto?: boolean;
  title: string;
  titleDe?: string;
  tldr: string;
  tldrDe?: string;
  analogy: string;
  analogyDe?: string;
  keyPoints: string[];
  keyPointsDe?: string[];
  codeBefore: string;
  codeAfter: string;
  audio: string;
  audioDe?: string;
  quiz: QuizItem[];
}

/** Localized text with EN fallback (auto-imported lessons are EN-only). */
export function tx(
  lesson: Lesson,
  lang: Lang,
  field: "title" | "tldr" | "analogy" | "audio",
): string {
  if (lang === "de") {
    const deKey = `${field}De` as const;
    const de = lesson[deKey];
    if (typeof de === "string" && de.length > 0) return de;
  }
  return lesson[field];
}

export function txList(
  lesson: Lesson,
  lang: Lang,
  field: "keyPoints",
): string[] {
  if (lang === "de" && lesson.keyPointsDe && lesson.keyPointsDe.length > 0)
    return lesson.keyPointsDe;
  return lesson.keyPoints;
}

export function qx(quiz: QuizItem, lang: Lang, field: "q" | "explain"): string {
  if (lang === "de") {
    const deKey = `${field}De` as const;
    const de = quiz[deKey];
    if (typeof de === "string" && de.length > 0) return de;
  }
  return quiz[field];
}

export function qxList(quiz: QuizItem, lang: Lang): string[] {
  if (
    lang === "de" &&
    quiz.optionsDe &&
    quiz.optionsDe.length === quiz.options.length
  )
    return quiz.optionsDe;
  return quiz.options;
}

export function lessonText<T>(lang: Lang, en: T, de: T): T {
  return lang === "de" ? de : en;
}
