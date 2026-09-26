// Phase 2: full handbook import.
// Reads markdown from ../../TypeScript-website/packages/documentation/copy/en
// and generates content/handbook-auto.json — one lesson per file (EN-only,
// auto: true). Curated lessons in content/lessons.json stay untouched.
// Run with: bun scripts/import-handbook.ts
// Then: node scripts/json-to-ts.js  (merges both into content/lessonsData.ts)

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import type { Lesson } from "../lib/types";

const SRC = join(
  import.meta.dir,
  "..",
  "..",
  "TypeScript-website",
  "packages",
  "documentation",
  "copy",
  "en",
);
const DEST = join(import.meta.dir, "..", "content", "handbook-auto.json");

interface DirCfg {
  track: Lesson["track"];
  level: number;
}

const DIRS: Record<string, DirCfg> = {
  "handbook-v2": { track: "ts-core", level: 2 },
  javascript: { track: "js-crash", level: 1 },
  reference: { track: "ts-core", level: 3 },
  "get-started": { track: "agent-reading", level: 2 },
  tutorials: { track: "ts-core", level: 2 },
};

function listMd(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return (readdirSync(dir, { recursive: true, encoding: "utf8" }) as string[])
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(dir, f));
}

function parseFrontmatter(raw: string): {
  title?: string;
  oneline?: string;
  body: string;
} {
  if (!raw.startsWith("---")) return { body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { body: raw };
  const fm = raw.slice(3, end);
  const body = raw.slice(end + 4).replace(/^\s+/, "");
  const title = fm.match(/^title:\s*(.+)$/m)?.[1]?.trim();
  const oneline = fm.match(/^oneline:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim();
  return { title, oneline, body };
}

function cleanInline(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~#>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.lastIndexOf(".", max - 20);
  const at = cut > max * 0.4 ? cut + 1 : max;
  return s.slice(0, at).trim() + "…";
}

function firstParagraph(body: string): string {
  const noCode = body.replace(/```[\s\S]*?```/g, "");
  for (const para of noCode.split(/\n\s*\n/)) {
    const c = cleanInline(para);
    if (c.length > 60 && !c.startsWith("If this is your first"))
      return truncate(c, 220);
  }
  return "";
}

function headings(body: string, max: number): string[] {
  const out: string[] = [];
  for (const line of body.split("\n")) {
    const m = line.match(/^##\s+(.+)/);
    if (m) {
      const c = cleanInline(m[1]);
      if (c.length > 2 && c.length < 90) out.push(c);
      if (out.length >= max) break;
    }
  }
  return out;
}

function codeBlocks(body: string, max: number): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) {
    if (out.length >= max) break;
    const code = m[1].trim();
    if (code.length > 10 && code.length < 1500) out.push(code);
  }
  return out;
}

function slug(s: string): string {
  return basename(s, ".md")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function prettyTitle(file: string, fmTitle?: string): string {
  if (fmTitle) return fmTitle;
  return basename(file, ".md").replace(/[-_]+/g, " ");
}

function fileToLesson(file: string, dir: string, cfg: DirCfg): Lesson | null {
  const raw = readFileSync(file, "utf8");
  const { title: fmTitle, oneline, body } = parseFrontmatter(raw);
  if (body.trim().length < 200) return null;

  const title = prettyTitle(file, fmTitle);
  const para = firstParagraph(body);
  // oneline frontmatter is sometimes too thin ("The language primitives.");
  // prefer the fuller first paragraph in that case.
  const tldr =
    oneline && cleanInline(oneline).length >= 60 ? cleanInline(oneline) : para;
  const points = headings(body, 8);
  const codes = codeBlocks(body, 2);
  const words = body.split(/\s+/).length;
  const rel = `${dir}/${basename(file)}`;

  const audioPoints = points.slice(0, 4).join(". ");
  return {
    id: `auto-${dir}-${slug(file)}`,
    track: cfg.track,
    level: cfg.level,
    minutes: Math.max(2, Math.min(12, Math.round(words / 180))),
    source: rel,
    auto: true,
    title,
    tldr: tldr || `Handbook page: ${title}.`,
    analogy:
      "C# lens pending curation — the key points below carry the essentials.",
    keyPoints: points.length > 0 ? points : [`Read: ${title}`],
    codeBefore: codes[0] ?? `// see ${rel}`,
    codeAfter: codes[1] ?? "",
    audio: `${title}. ${tldr} ${audioPoints}`,
    quiz: [],
  };
}

function main() {
  const lessons: Lesson[] = [];
  for (const [dir, cfg] of Object.entries(DIRS)) {
    const files = listMd(join(SRC, dir));
    let n = 0;
    for (const f of files) {
      const l = fileToLesson(f, dir, cfg);
      if (l) {
        lessons.push(l);
        n++;
      }
    }
    console.log(`${dir}: ${files.length} files → ${n} lessons`);
  }
  lessons.sort(
    (a, b) => a.track.localeCompare(b.track) || a.title.localeCompare(b.title),
  );
  writeFileSync(DEST, JSON.stringify(lessons, null, 2) + "\n");
  const withCode = lessons.filter(
    (l) => !l.codeBefore.startsWith("// see"),
  ).length;
  console.log(
    `Wrote ${DEST}: ${lessons.length} auto lessons (${withCode} with real code samples)`,
  );
}

main();
