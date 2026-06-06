import { Tabs } from "expo-router";
import { View } from "react-native";
import { BottomNav } from "@/shared/components/BottomNav";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs tabBar={() => null} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="(home)" />
        <Tabs.Screen name="(explore)" />
        <Tabs.Screen name="(saved)" />
        <Tabs.Screen name="(library)" />
      </Tabs>
      <BottomNav />
    </View>
  );
}
