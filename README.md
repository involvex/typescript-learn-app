# TS Guide – Learn on the Go 🚗📱

Offline-first Expo app to learn TypeScript on the go. Built for a programmer
(C#, C++, Python, PHP background) who wants to **read what AI agents generate**
and write some TS themselves.

- **Learn**: 73 lessons (24 curated + 49 handbook, JS crash → TS core → agent diffs),
  each with TL;DR, C# lens, code, and quiz. German/English toggle (EN/DE, top right).
- **Quiz**: mixed 10-question rounds from all lessons, offline.
- **Review**: wrong answers land here with a tab badge — retry until cleared.
- **Playground**: edit snippets offline, reveal what TS says; online link to TS Playground.
- **Progress**: completions + quiz score + open reviews, stored on-device (airplane mode OK).
- **🔊 Listen**: every lesson has a TTS audio script (EN/DE).
- **🌙 Theme**: system / light / dark toggle in the header, persisted.

## Run it (2 min)

1. Install **Expo Go** on your phone (App Store / Play Store).
2. On this PC, same Wi-Fi as the phone:
   ```powershell
   cd I:\dev\Typescript-Guide
   bun install        # only needed once (already done)
   bunx expo start
   ```
3. Scan the QR code with Expo Go (Android) or the Camera app (iPhone).
4. Before the drive: open every tab once while online (bundles content),
   then **airplane mode works** – everything is bundled JSON + on-device storage.

## Scripts

| Command | What |
|---|---|
| `bun run typecheck` | `tsc --noEmit` – must be clean |
| `bunx expo start` | dev server + QR for Expo Go |
| `bun scripts/import-handbook.ts` | phase-2: scan `../TypeScript-website` handbook sources |
| `node scripts/json-to-ts.js` | regenerate `content/lessonsData.ts` after editing `content/lessons.json` |

## Content pipeline

- `content/lessons.json` – 24 curated lessons (full EN+DE, quiz included).
- `content/handbook-auto.json` – 49 auto-imported handbook pages, EN-only,
  `auto: true` (no quiz yet). Generated, do not edit:
  `bun scripts/import-handbook.ts`
- App imports the merged `content/lessonsData.ts` (Metro-safe).
  Regenerate after any JSON change: `node scripts/json-to-ts.js`
- Full handbook lives in `I:\dev\TypeScript-website\packages\documentation\copy\en`
  (handbook-v2 18, reference 15, tutorials 8, javascript + get-started 4 each).
  Auto lessons show an "· EN" badge and fall back to English when DE is active.

## Project layout

```
app/(tabs)/index.tsx      Learn list (search + track filter)
app/(tabs)/quiz.tsx       mixed quiz rounds
app/(tabs)/playground.tsx offline snippet trainer
app/(tabs)/progress.tsx   done count + quiz score
app/learn/[id].tsx        lesson detail (TTS, quiz, prev/next)
components/               LessonCard, QuizCard, CodeBlock, LangToggle
lib/                      types, content, i18n (EN/DE), progress, tts
content/lessons.json      editable bundle → regenerate lessonsData.ts
```
