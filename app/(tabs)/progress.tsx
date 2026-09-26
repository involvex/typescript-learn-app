import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { lessons } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { useTheme } from "@/lib/theme";

export default function ProgressScreen() {
  const { lang, t } = useLang();
  const { colors } = useTheme();
  const { doneIds, quizCorrect, quizAnswered, mistakes, streak, resetAll } =
    useProgress();
  const pct = lessons.length
    ? Math.round((doneIds.length / lessons.length) * 100)
    : 0;
  const dayWord =
    lang === "de"
      ? streak.count === 1
        ? "Tag"
        : "Tage"
      : streak.count === 1
        ? "day"
        : "days";

  return (
    <ScrollView
      style={[styles.wrap, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("progressTitle")}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.big, { color: colors.text }]}>
          {doneIds.length} / {lessons.length}
        </Text>
        <Text style={[styles.sub, { color: colors.sub }]}>
          {t("completed")} · {pct}%
        </Text>
        <View style={[styles.bar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.fill,
              { width: `${pct}%`, backgroundColor: colors.success },
            ]}
          />
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.big, { color: colors.text }]}>
          🔥 {streak.count} {dayWord}
        </Text>
        <Text style={[styles.sub, { color: colors.sub }]}>
          {t("bestStreak")}: {streak.best}
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.big, { color: colors.text }]}>
          {quizCorrect} / {quizAnswered}
        </Text>
        <Text style={[styles.sub, { color: colors.sub }]}>
          {t("quizScore")}
        </Text>
        <Text style={[styles.sub, { color: colors.sub }]}>
          {mistakes.length} {t("toReview")}
        </Text>
      </View>
      <Text style={[styles.note, { color: colors.sub }]}>
        {t("streakNote")}
      </Text>
      <Pressable
        onPress={resetAll}
        style={[styles.reset, { backgroundColor: colors.dangerBg }]}
      >
        <Text style={[styles.resetTxt, { color: colors.danger }]}>
          {t("reset")}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  card: { borderRadius: 14, padding: 18, marginBottom: 12 },
  big: { fontSize: 28, fontWeight: "800" },
  sub: { marginTop: 2 },
  bar: {
    height: 10,
    borderRadius: 5,
    marginTop: 12,
    overflow: "hidden",
  },
  fill: { height: 10 },
  note: { fontSize: 13, marginTop: 4 },
  reset: { marginTop: 16, borderRadius: 12, padding: 14, alignItems: "center" },
  resetTxt: { fontWeight: "700" },
});
