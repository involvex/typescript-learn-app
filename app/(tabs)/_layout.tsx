import { Tabs } from "expo-router";
import { LangToggle } from "@/components/LangToggle";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerRight: () => <LangToggle />,
        tabBarActiveTintColor: "#3178c6",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Learn" }} />
      <Tabs.Screen name="quiz" options={{ title: "Quiz" }} />
      <Tabs.Screen name="playground" options={{ title: "Playground" }} />
      <Tabs.Screen name="progress" options={{ title: "Progress" }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
