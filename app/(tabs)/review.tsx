import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { QuizCard } from "@/components/QuizCard";
import { getLesson } from "@/lib/content";
import { tx } from "@/lib/types";
import type { Lesson, QuizItem } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { useTheme } from "@/lib/theme";

interface RoundItem {
  lessonId: string;
  qi: number;
  lesson: Lesson;
  quiz: QuizItem;
}

interface Round {
  snap: RoundItem[];
  idx: number;
  correct: number;
}

export default function ReviewScreen() {
  const { lang, t } = useLang();
  const { colors } = useTheme();
  const { mistakes } = useProgress();
  const [clearedMsg, setClearedMsg] = useState<string | null>(null);
  const [round, setRound] = useState<Round | null>(null);

  // drop stale refs (content regenerations may move questions around),
  // hardest-first: most misses, ties broken by oldest miss
  const items = mistakes
    .flatMap((m) => {
      const lesson = getLesson(m.lessonId);
      const quiz = lesson?.quiz[m.qi];
      return lesson && quiz ? [{ ...m, lesson, quiz }] : [];
    })
    .sort((a, b) => b.misses - a.misses || a.at - b.at);

  const startRound = () => {
    setClearedMsg(null);
    setRound({ snap: items.slice(0, 10), idx: 0, correct: 0 });
  };

  if (round) {
    const finished = round.idx >= round.snap.length;
    const current = round.snap[round.idx];
    return (
      <ScrollView
        style={[styles.wrap, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {finished ? (
          <>
            <Text style={[styles.count, { color: colors.text }]}>
              {round.correct} / {round.snap.length}
            </Text>
            <Text style={[styles.hint, { color: colors.sub }]}>
              {t("cleared")}
            </Text>
            <Pressable
              onPress={() => setRound(null)}
              style={[styles.btn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.btnTxt, { color: colors.onPrimary }]}>
                {t("backToReview")}
              </Text>
            </Pressable>
          </>
        ) : (
          current && (
            <>
              <Text style={[styles.count, { color: colors.text }]}>
                {round.idx + 1} / {round.snap.length}
              </Text>
              <Text style={[styles.hint, { color: colors.sub }]}>
                {tx(current.lesson, lang, "title")}
              </Text>
              <QuizCard
                key={`${current.lessonId}-${current.qi}`}
                quiz={current.quiz}
                lang={lang}
                lessonId={current.lessonId}
                qi={current.qi}
                onAnswer={(ok) => {
                  if (ok)
                    setRound((r) => (r ? { ...r, correct: r.correct + 1 } : r));
                }}
              />
              <View style={styles.row}>
                <Pressable
                  onPress={() =>
                    setRound((r) =>
                      r ? { ...r, idx: Math.max(0, r.idx - 1) } : r,
                    )
                  }
                  style={[styles.btn, { backgroundColor: colors.chip }]}
                >
                  <Text style={[styles.btnTxt, { color: colors.text }]}>
                    {t("prev")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    setRound((r) => (r ? { ...r, idx: r.idx + 1 } : r))
                  }
                  style={[styles.btn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.btnTxt, { color: colors.onPrimary }]}>
                    {t("next")}
                  </Text>
                </Pressable>
              </View>
              <Pressable onPress={() => setRound(null)} style={styles.exit}>
                <Text style={[styles.exitTxt, { color: colors.sub }]}>
                  {t("backToReview")}
                </Text>
              </Pressable>
            </>
          )
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.wrap, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <Text style={[styles.count, { color: colors.text }]}>
        {items.length} {t("toReview")}
      </Text>
      <Text style={[styles.hint, { color: colors.sub }]}>
        {t("reviewHint")}
      </Text>
      {items.length > 0 ? (
        <Pressable
          onPress={startRound}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.btnTxt, { color: colors.onPrimary }]}>
            {t("hardestRound")}
          </Text>
        </Pressable>
      ) : null}
      {clearedMsg ? (
        <Text style={[styles.cleared, { color: colors.success }]}>
          {t("cleared")} · {clearedMsg}
        </Text>
      ) : null}
      {items.length === 0 ? (
        <Text style={[styles.empty, { color: colors.sub }]}>
          {t("reviewEmpty")}
        </Text>
      ) : (
        items.map(({ lessonId, qi, misses, lesson, quiz }) => (
          <View key={`${lessonId}-${qi}`}>
            <Text style={[styles.misses, { color: colors.sub }]}>
              {lang === "de"
                ? `${misses}× verpasst · ${tx(lesson, lang, "title")}`
                : `missed ${misses}× · ${tx(lesson, lang, "title")}`}
            </Text>
            <QuizCard
              quiz={quiz}
              lang={lang}
              lessonId={lessonId}
              qi={qi}
              retry
              onAnswer={(ok) => {
                if (ok) setClearedMsg(tx(lesson, lang, "title"));
              }}
            />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  count: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  hint: { fontSize: 14, marginBottom: 8 },
  cleared: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  empty: { fontSize: 15, marginTop: 24, textAlign: "center" },
  misses: { fontSize: 12, fontWeight: "700", marginTop: 8 },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  btn: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
    flex: 1,
  },
  btnTxt: { fontSize: 16, fontWeight: "700" },
  exit: { marginTop: 6, alignItems: "center", padding: 10 },
  exitTxt: { fontWeight: "600" },
});
