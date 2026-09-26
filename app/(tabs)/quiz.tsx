import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { QuizCard } from "@/components/QuizCard";
import { getLesson, quizPool } from "@/lib/content";
import { tx } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export default function QuizScreen() {
  const { lang, t } = useLang();
  const { colors } = useTheme();
  const pool = useMemo(() => quizPool(), []);
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(0);

  // deterministic shuffle per round (offline, no deps)
  const order = useMemo(() => {
    const arr = pool.map((_, i) => i);
    let seed = 42 + round;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 10);
  }, [pool, round]);

  const entry = pool[order[idx % order.length]];
  const lesson = entry ? getLesson(entry.lessonId) : undefined;
  const quiz = lesson?.quiz[entry.qi];

  return (
    <ScrollView
      style={[styles.wrap, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <Text style={[styles.sub, { color: colors.sub }]}>{t("quizAll")}</Text>
      <Text style={[styles.count, { color: colors.text }]}>
        {t("questionOf")} {(idx % order.length) + 1} / {order.length}
        {lesson ? ` · ${tx(lesson, lang, "title")}` : ""}
      </Text>
      {quiz ? (
        <QuizCard
          key={`${entry.lessonId}-${entry.qi}-${round}`}
          quiz={quiz}
          lang={lang}
          lessonId={entry.lessonId}
          qi={entry.qi}
        />
      ) : null}
      <View style={styles.row}>
        <Pressable
          onPress={() => setIdx((i) => (i > 0 ? i - 1 : 0))}
          style={[styles.btn, { backgroundColor: colors.chip }]}
        >
          <Text style={[styles.btnTxt, { color: colors.text }]}>
            {t("prev")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if ((idx + 1) % order.length === 0) {
              setRound((r) => r + 1);
              setIdx(0);
            } else {
              setIdx((i) => i + 1);
            }
          }}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.btnTxt, { color: colors.onPrimary }]}>
            {t("next")}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  sub: { fontSize: 14, marginBottom: 4 },
  count: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  btn: { flex: 1, borderRadius: 12, padding: 16, alignItems: "center" },
  btnTxt: { fontSize: 16, fontWeight: "700" },
});
