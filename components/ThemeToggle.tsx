import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme, type ThemeMode } from "../lib/theme";
import { useLang } from "../lib/i18n";

const ICON: Record<ThemeMode, string> = {
  system: "📱",
  light: "☀️",
  dark: "🌙",
};

export function ThemeToggle() {
  const { mode, cycle, colors } = useTheme();
  const { t } = useLang();
  return (
    <Pressable
      onPress={cycle}
      accessibilityLabel={t("theme")}
      style={[styles.btn, { backgroundColor: colors.chip }]}
    >
      <Text style={[styles.txt, { color: colors.chipText }]}>{ICON[mode]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  txt: { fontWeight: "700", fontSize: 15 },
});
