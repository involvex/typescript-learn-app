import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { lessons } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";

export default function ProgressScreen() {
  const { t } = useLang();
  const { doneIds, quizCorrect, quizAnswered, resetAll } = useProgress();
  const pct = lessons.length
    ? Math.round((doneIds.length / lessons.length) * 100)
    : 0;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{t("progressTitle")}</Text>
      <View style={styles.card}>
        <Text style={styles.big}>
          {doneIds.length} / {lessons.length}
        </Text>
        <Text style={styles.sub}>
          {t("completed")} · {pct}%
        </Text>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.big}>
          {quizCorrect} / {quizAnswered}
        </Text>
        <Text style={styles.sub}>{t("quizScore")}</Text>
      </View>
      <Text style={styles.note}>{t("streakNote")}</Text>
      <Pressable onPress={resetAll} style={styles.reset}>
        <Text style={styles.resetTxt}>{t("reset")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#f1f5f9" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
  },
  big: { fontSize: 28, fontWeight: "800" },
  sub: { color: "#64748b", marginTop: 2 },
  bar: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    marginTop: 12,
    overflow: "hidden",
  },
  fill: { height: 10, backgroundColor: "#22c55e" },
  note: { color: "#64748b", fontSize: 13, marginTop: 4 },
  reset: {
    marginTop: 16,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  resetTxt: { color: "#b91c1c", fontWeight: "700" },
});
