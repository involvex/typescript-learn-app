import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { QuizCard } from "@/components/QuizCard";
import { getLesson } from "@/lib/content";
import { tx } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { useTheme } from "@/lib/theme";

export default function ReviewScreen() {
  const { lang, t } = useLang();
  const { colors } = useTheme();
  const { mistakes } = useProgress();
  const [clearedMsg, setClearedMsg] = useState<string | null>(null);

  // drop stale refs (content regenerations may move questions around)
  const items = mistakes.flatMap((m) => {
    const lesson = getLesson(m.lessonId);
    const quiz = lesson?.quiz[m.qi];
    return lesson && quiz ? [{ ...m, lesson, quiz }] : [];
  });

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
        items.map(({ lessonId, qi, lesson, quiz }) => (
          <QuizCard
            key={`${lessonId}-${qi}`}
            quiz={quiz}
            lang={lang}
            lessonId={lessonId}
            qi={qi}
            retry
            onAnswer={(ok) => {
              if (ok) setClearedMsg(tx(lesson, lang, "title"));
            }}
          />
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
});
