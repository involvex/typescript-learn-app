import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLang } from "../lib/i18n";
import { useTheme } from "../lib/theme";
import type { Lang } from "../lib/types";

export function LangToggle() {
  const { lang, setLang, t } = useLang();
  const { colors } = useTheme();
  const set = (l: Lang) => setLang(l);
  const render = (l: Lang, label: string) => (
    <Pressable
      onPress={() => set(l)}
      style={[
        styles.btn,
        { backgroundColor: colors.chip },
        lang === l && { backgroundColor: colors.primary },
      ]}
    >
      <Text
        style={[
          styles.txt,
          { color: colors.chipText },
          lang === l && { color: colors.onPrimary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
  return (
    <View style={styles.row} accessibilityLabel={t("language")}>
      {render("en", "EN")}
      {render("de", "DE")}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  txt: { fontWeight: "700" },
});
