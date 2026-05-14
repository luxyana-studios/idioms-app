import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs tabBar={() => null} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="(explore)" />
      <Tabs.Screen name="(saved)" />
      <Tabs.Screen name="(library)" />
    </Tabs>
  );
}
