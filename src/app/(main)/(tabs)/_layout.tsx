import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";

export default function TabsLayout() {
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const paddingBottom = Math.max(insets.bottom, 8);
  // Base 44px (icon row + top padding) plus bottom inset — minimum total ≈52px
  const tabBarHeight = 44 + paddingBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          position: "absolute",
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                overflow: "hidden",
              },
            ]}
          />
        ),
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: t("home.title"),
          tabBarAccessibilityLabel: t("home.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(explore)"
        options={{
          title: t("explore.title"),
          tabBarAccessibilityLabel: t("explore.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(saved)"
        options={{
          title: t("saved.title"),
          tabBarAccessibilityLabel: t("saved.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(library)"
        options={{
          title: t("library.title"),
          tabBarAccessibilityLabel: t("library.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
