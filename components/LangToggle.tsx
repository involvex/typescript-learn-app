import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLang } from "../lib/i18n";
import type { Lang } from "../lib/types";

export function LangToggle() {
  const { lang, setLang, t } = useLang();
  const set = (l: Lang) => setLang(l);
  return (
    <View style={styles.row} accessibilityLabel={t("language")}>
      <Pressable
        onPress={() => set("en")}
        style={[styles.btn, lang === "en" && styles.active]}
      >
        <Text style={[styles.txt, lang === "en" && styles.txtActive]}>EN</Text>
      </Pressable>
      <Pressable
        onPress={() => set("de")}
        style={[styles.btn, lang === "de" && styles.active]}
      >
        <Text style={[styles.txt, lang === "de" && styles.txtActive]}>DE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, marginRight: 12 },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
  },
  active: { backgroundColor: "#3178c6" },
  txt: { fontWeight: "700", color: "#334155" },
  txtActive: { color: "#fff" },
});
