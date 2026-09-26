import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { CodeBlock } from "@/components/CodeBlock";
import { QuizCard } from "@/components/QuizCard";
import { getLesson, lessons } from "@/lib/content";
import { tx, txList } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useProgress } from "@/lib/progress";
import { speakText, stopSpeech } from "@/lib/tts";

export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, t } = useLang();
  const { colors } = useTheme();
  const { toggleDone, isDone, recordQuiz } = useProgress();
  const router = useRouter();
  const [speaking, setSpeaking] = useState(false);

  const lesson = useMemo(() => getLesson(String(id)), [id]);
  const idx = useMemo(
    () => lessons.findIndex((l) => l.id === String(id)),
    [id],
  );
  const prev = idx > 0 ? lessons[idx - 1] : undefined;
  const next =
    idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : undefined;

  if (!lesson) {
    return (
      <View style={[styles.wrap, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>
          Lesson not found: {String(id)}
        </Text>
      </View>
    );
  }

  const done = isDone(lesson.id);
  const title = tx(lesson, lang, "title");

  const toggleSpeak = async () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    const script = `${tx(lesson, lang, "title")}. ${tx(lesson, lang, "tldr")}. ${tx(lesson, lang, "audio")}`;
    await speakText(script, lang);
    setSpeaking(false);
  };

  return (
    <ScrollView
      style={[styles.wrap, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
    >
      <Stack.Screen
        options={{
          title,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }}
      />
      <Text style={[styles.meta, { color: colors.sub }]}>
        {lesson.track} · {lesson.minutes} {t("min")} · {lesson.source}
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={toggleSpeak}
          style={[styles.btnGhost, { backgroundColor: colors.chip }]}
        >
          <Text style={[styles.btnGhostTxt, { color: colors.text }]}>
            {speaking ? t("stop") : t("listen")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => toggleDone(lesson.id)}
          style={[
            styles.btn,
            {
              backgroundColor: done ? colors.success : colors.primary,
            },
          ]}
        >
          <Text style={[styles.btnTxt, { color: colors.onPrimary }]}>
            {done ? t("done") : t("markDone")}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.h, { color: colors.text }]}>{t("tldr")}</Text>
      <Text style={[styles.p, { color: colors.text }]}>
        {tx(lesson, lang, "tldr")}
      </Text>

      <Text style={[styles.h, { color: colors.text }]}>{t("csharpLens")}</Text>
      <Text style={[styles.p, { color: colors.text }]}>
        {tx(lesson, lang, "analogy")}
      </Text>

      <Text style={[styles.h, { color: colors.text }]}>{t("keyPoints")}</Text>
      {txList(lesson, lang, "keyPoints").map((k) => (
        <Text key={k} style={[styles.li, { color: colors.text }]}>
          • {k}
        </Text>
      ))}

      <Text style={[styles.h, { color: colors.text }]}>{t("tryIt")}</Text>
      <CodeBlock code={lesson.codeBefore} />
      {lesson.codeAfter ? <CodeBlock code={lesson.codeAfter} /> : null}

      {lesson.quiz.length > 0 ? (
        <>
          <Text style={styles.h}>{t("quizInLesson")}</Text>
          {lesson.quiz.map((q) => (
            <QuizCard
              key={q.q}
              quiz={q}
              lang={lang}
              onAnswer={(ok) => recordQuiz(ok)}
            />
          ))}
        </>
      ) : null}

      <View style={styles.nav}>
        {prev ? (
          <Pressable
            onPress={() =>
              router.replace({
                pathname: "/learn/[id]",
                params: { id: prev.id },
              })
            }
            style={[styles.navBtn, { backgroundColor: colors.chip }]}
          >
            <Text style={{ color: colors.text }}>{t("prev")}</Text>
          </Pressable>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {next ? (
          <Pressable
            onPress={() =>
              router.replace({
                pathname: "/learn/[id]",
                params: { id: next.id },
              })
            }
            style={[styles.navBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.navNextTxt, { color: colors.onPrimary }]}>
              {t("next")}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  meta: { fontSize: 12, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 10 },
  actions: { flexDirection: "row", gap: 10, marginBottom: 12 },
  btn: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  btnTxt: { fontWeight: "700", fontSize: 15 },
  btnGhost: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  btnGhostTxt: { fontWeight: "700" },
  h: { fontSize: 17, fontWeight: "800", marginTop: 14, marginBottom: 6 },
  p: { fontSize: 15, lineHeight: 22 },
  li: { fontSize: 15, marginVertical: 2, lineHeight: 22 },
  nav: { flexDirection: "row", gap: 10, marginTop: 20 },
  navBtn: { flex: 1, borderRadius: 12, padding: 16, alignItems: "center" },
  navNextTxt: { fontWeight: "700" },
});
