import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LessonCard } from "@/components/LessonCard";
import { lessonsByTrack, searchLessons } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import type { Lesson } from "@/lib/types";

type Filter = "all" | Lesson["track"];

export default function LearnScreen() {
  const { lang, t } = useLang();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    const base = lessonsByTrack(filter);
    if (!q.trim()) return base;
    const ids = new Set(searchLessons(q, lang).map((l) => l.id));
    return base.filter((l) => ids.has(l.id));
  }, [filter, q, lang]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t("all") },
    { id: "js-crash", label: t("jsCrash") },
    { id: "ts-core", label: t("tsCore") },
    { id: "agent-reading", label: t("agentReading") },
  ];

  return (
    <View style={styles.wrap}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t("search")}
        style={styles.search}
        autoCapitalize="none"
      />
      <View style={styles.chips}>
        {filters.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.chip, filter === f.id && styles.chipActive]}
          >
            <Text
              style={[styles.chipTxt, filter === f.id && styles.chipTxtActive]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => <LessonCard lesson={item} lang={lang} />}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#f1f5f9" },
  search: {
    backgroundColor: "#fff",
    margin: 12,
    marginBottom: 4,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chip: {
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: { backgroundColor: "#3178c6" },
  chipTxt: { color: "#334155", fontWeight: "600" },
  chipTxtActive: { color: "#fff" },
});
