import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CodeBlock } from "@/components/CodeBlock";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

const SNIPPETS = [
  {
    id: "narrowing",
    code: 'type ID = string | number;\nfunction print(id: ID) {\n  if (typeof id === "string") {\n    return id.toUpperCase();\n  }\n  return id.toFixed(2);\n}',
    answerEn:
      "If id is a string → UPPER text. Else TS knows it is number → 2 decimals. This is narrowing.",
    answerDe:
      "Wenn id ein String ist → GROSS. Sonst weiß TS: number → 2 Dezimalen. Das ist Narrowing.",
  },
  {
    id: "unknown",
    code: 'function len(x: unknown) {\n  if (typeof x === "string") return x.length;\n  throw new Error("need string");\n}',
    answerEn:
      "unknown forces the typeof check. Without it, x.length is a compile error. Safe by design.",
    answerDe:
      "unknown erzwingt die typeof-Prüfung. Ohne sie ist x.length ein Compile-Fehler. Sicher per Design.",
  },
  {
    id: "generic",
    code: "function first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\nconst n = first([1, 2, 3]); // number | undefined",
    answerEn:
      "T flows in and out: number[] in → number|undefined out. Empty array → undefined, handle it.",
    answerDe:
      "T fließt rein und raus: number[] rein → number|undefined raus. Leeres Array → undefined behandeln.",
  },
];

export default function PlaygroundScreen() {
  const { lang, t } = useLang();
  const { colors } = useTheme();
  const [sel, setSel] = useState(0);
  const [edited, setEdited] = useState(SNIPPETS[0].code);
  const [revealed, setRevealed] = useState(false);

  const pick = (i: number) => {
    setSel(i);
    setEdited(SNIPPETS[i].code);
    setRevealed(false);
  };

  return (
    <ScrollView
      style={[styles.wrap, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("playgroundTitle")}
      </Text>
      <Text style={[styles.hint, { color: colors.sub }]}>
        {t("playgroundHint")}
      </Text>
      <View style={styles.chips}>
        {SNIPPETS.map((s, i) => {
          const active = sel === i;
          return (
            <Pressable
              key={s.id}
              onPress={() => pick(i)}
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
                {s.id}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        value={edited}
        onChangeText={(v) => {
          setEdited(v);
          setRevealed(false);
        }}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.editor}
      />
      <Pressable
        onPress={() => setRevealed(true)}
        style={[styles.btn, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.btnTxt, { color: colors.onPrimary }]}>
          {t("run")}
        </Text>
      </Pressable>
      {revealed ? (
        <View
          style={[
            styles.answer,
            {
              backgroundColor: colors.successBg,
              borderColor: colors.success,
            },
          ]}
        >
          <Text style={[styles.answerTxt, { color: colors.text }]}>
            {lang === "de" ? SNIPPETS[sel].answerDe : SNIPPETS[sel].answerEn}
          </Text>
        </View>
      ) : null}
      <Text style={[styles.origLabel, { color: colors.text }]}>Original:</Text>
      <CodeBlock code={SNIPPETS[sel].code} />
      <Pressable
        onPress={() =>
          Linking.openURL("https://www.typescriptlang.org/play").catch(() => {})
        }
        style={[styles.btn, { backgroundColor: colors.chip }]}
      >
        <Text style={[styles.btnTxt, { color: colors.text }]}>
          {t("openOnline")}
        </Text>
      </Pressable>
      <Pressable onPress={() => pick(sel)} style={styles.reset}>
        <Text style={[styles.resetTxt, { color: colors.sub }]}>
          {t("reset")}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  hint: { fontSize: 14, marginBottom: 10 },
  chips: { flexDirection: "row", gap: 8, marginBottom: 10 },
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 },
  chipTxt: { fontWeight: "700" },
  editor: {
    backgroundColor: "#0d1117",
    color: "#e6edf3",
    fontFamily: "monospace",
    fontSize: 14,
    borderRadius: 10,
    padding: 12,
    minHeight: 160,
    textAlignVertical: "top",
  },
  btn: { borderRadius: 12, padding: 16, alignItems: "center", marginTop: 12 },
  btnTxt: { fontWeight: "700", fontSize: 16 },
  answer: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 12 },
  answerTxt: { fontSize: 14 },
  origLabel: { marginTop: 16, fontWeight: "700" },
  reset: { marginTop: 10, alignItems: "center", padding: 10 },
  resetTxt: { fontWeight: "600" },
});
