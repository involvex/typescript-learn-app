import { Tabs } from "expo-router";
import { View } from "react-native";
import { LangToggle } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";

function HeaderRight() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginRight: 12,
      }}
    >
      <ThemeToggle />
      <LangToggle />
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLang();
  const { mistakes } = useProgress();
  return (
    <Tabs
      screenOptions={{
        headerRight: () => <HeaderRight />,
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.sub,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("learn") }} />
      <Tabs.Screen name="quiz" options={{ title: t("quiz") }} />
      <Tabs.Screen
        name="review"
        options={{
          title: t("review"),
          tabBarBadge: mistakes.length > 0 ? mistakes.length : undefined,
        }}
      />
      <Tabs.Screen name="playground" options={{ title: t("playground") }} />
      <Tabs.Screen name="progress" options={{ title: t("progress") }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
