# AGENTS.md

## Useful Commands

| Command | What |
|---|---|
| `bun install` | install dependencies |
| `bun run typecheck` | `tsc --noEmit` |
| `bunx expo start` | dev server + QR |
| `bun scripts/import-handbook.ts` | scan handbook sources |
| `node scripts/json-to-ts.js` | regenerate lessonsData.ts |

## Technologies

- Expo ~57.0.25, React 19, React Native 0.86
- TypeScript ~6.0.3, strict mode
- Bun >=1.3.0 for all Node.js tasks

## Best Practices

- Use `const` by default, `let` only when reassigning
- Never use `var`
- Use `@/` path aliases
- Keep `content/lessons.json` as the curated source

## Guidelines

- **TypeScript strict mode** is enabled. All code must typecheck cleanly (`bun run typecheck`).
- **Path aliases**: import from `@/lib/...`, `@/components/...`, `@/content/...` instead of relative paths.
- **Offline-first**: the app must work in airplane mode. All content is bundled JSON; user data lives in AsyncStorage.
- **Bun is the package manager** — use `bun install`, `bun add`, `bun run` everywhere. Never use npm/yarn/pnpm.
- **Content source of truth**: `content/lessons.json` (curated lessons). Never edit `content/lessonsData.ts` directly — it is generated.
- **i18n**: lessons support EN/DE. Curated lessons have full DE translations. Auto-imported handbook lessons are EN-only (fall back to English when DE is active).
- **Accessibility**: use semantic labels, sufficient color contrast (theme tokens from `lib/theme.tsx`), and TTS audio for every lesson.

## Content Pipeline

1. Edit `content/lessons.json` (curated lessons with full EN+DE, quiz included).
2. For handbook updates: run `bun scripts/import-handbook.ts` — scans `../TypeScript-website/packages/documentation/copy/en` and generates `content/handbook-auto.json` (EN-only, `auto: true`).
3. Run `node scripts/json-to-ts.js` to merge both JSON files into `content/lessonsData.ts` (Metro-safe TypeScript module).
4. Curation overrides for auto lessons live in `content/curation.json` (optional; survives regeneration).

## Project Layout

```
app/(tabs)/index.tsx      Learn list (search + track filter)
app/(tabs)/quiz.tsx       mixed quiz rounds
app/(tabs)/playground.tsx offline snippet trainer
app/(tabs)/progress.tsx   done count + quiz score
app/(tabs)/review.tsx     wrong-answer review
app/learn/[id].tsx        lesson detail (TTS, quiz, prev/next)
components/               LessonCard, QuizCard, CodeBlock, LangToggle, ThemeToggle
lib/                      types, content, i18n (EN/DE), progress, tts, theme
content/lessons.json      editable bundle → regenerate lessonsData.ts
content/lessonsData.ts    generated (do not edit)
scripts/                  import-handbook.ts, json-to-ts.js, make-icon.js
```

## Additional Notes

- **Expo Router** file-based routing with `app/` directory. Use `expo-router` navigation APIs (`router.replace`, `useRouter`).
- **Reanimated 4.5.1** is included for animations — use `react-native-reanimated` worklets where needed.
- **Theme** is persisted via AsyncStorage and follows system preference by default. Tokens live in `lib/theme.tsx`.
- **Progress** (done lessons, quiz score, mistakes, streak) is stored on-device via AsyncStorage. It works offline.
- **TTS**: every lesson has an audio script. Use `lib/tts.ts` (`speakText`, `stopSpeech`) for the Listen feature.