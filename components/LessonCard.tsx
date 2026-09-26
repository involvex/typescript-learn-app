import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Lesson, Lang } from "../lib/types";
import { tx } from "../lib/types";
import { useProgress } from "../lib/progress";
import { useTheme } from "../lib/theme";

const TRACK_COLOR: Record<string, string> = {
  "js-crash": "#0ea5e9",
  "ts-core": "#3178c6",
  "agent-reading": "#8b5cf6",
};

export function LessonCard({ lesson, lang }: { lesson: Lesson; lang: Lang }) {
  const { isDone } = useProgress();
  const { colors } = useTheme();
  const router = useRouter();
  const done = isDone(lesson.id);
  const title = tx(lesson, lang, "title");
  const tldr = tx(lesson, lang, "tldr");

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: colors.card },
        done && { opacity: 0.75, borderWidth: 1, borderColor: colors.success },
      ]}
      onPress={() =>
        router.push({ pathname: "/learn/[id]", params: { id: lesson.id } })
      }
    >
      <View style={styles.row}>
        <View
          style={[
            styles.dot,
            { backgroundColor: TRACK_COLOR[lesson.track] ?? "#666" },
          ]}
        />
        <Text style={[styles.track, { color: colors.sub }]}>
          {lesson.track} · {lesson.minutes} min{lesson.auto ? " · EN" : ""}
        </Text>
        {done ? (
          <Text style={[styles.doneBadge, { color: colors.success }]}>✓</Text>
        ) : null}
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.tldr, { color: colors.sub }]}>{tldr}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  track: { fontSize: 12, flex: 1 },
  doneBadge: { fontWeight: "700" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  tldr: { fontSize: 14 },
});
