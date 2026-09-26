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
import { useTheme } from "@/lib/theme";
import type { Lesson } from "@/lib/types";

type Filter = "all" | Lesson["track"];

export default function LearnScreen() {
  const { lang, t } = useLang();
  const { colors } = useTheme();
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
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t("search")}
        placeholderTextColor={colors.sub}
        style={[
          styles.search,
          {
            backgroundColor: colors.input,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
        autoCapitalize="none"
      />
      <View style={styles.chips}>
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[
                styles.chip,
                { backgroundColor: colors.chip },
                active && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.chipTxt,
                  { color: colors.chipText },
                  active && { color: colors.onPrimary },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
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
  wrap: { flex: 1 },
  search: {
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
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 },
  chipTxt: { fontWeight: "600" },
});
