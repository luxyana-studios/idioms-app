import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { Typography } from "@/shared/components/Typography";

type TabIcon =
  | "albums-outline"
  | "search-outline"
  | "bookmark-outline"
  | "library-outline";

const TAB_ICONS: TabIcon[] = [
  "albums-outline",
  "search-outline",
  "bookmark-outline",
  "library-outline",
];

function PillTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const tabLabels = [
    t("home.title"),
    t("explore.title"),
    t("saved.title"),
    t("library.title"),
  ];

  const barStyle = {
    bottom: Math.max(insets.bottom, 8) + 8,
  };

  const bgColor = isDark ? "rgba(13,20,9,0.94)" : "rgba(248,244,238,0.96)";

  const borderColor = isDark
    ? "rgba(160,200,100,0.14)"
    : "rgba(145,71,49,0.10)";

  return (
    <View style={[styles.wrapper, barStyle]} pointerEvents="box-none">
      <View style={[styles.container, { borderColor }]}>
        {Platform.OS !== "android" ? (
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: bgColor },
            ]}
          />
        )}
        <View style={styles.inner}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const icon = TAB_ICONS[index];
            const label = tabLabels[index];

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.75}
                style={styles.tabItem}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
              >
                {isFocused ? (
                  <View
                    style={[
                      styles.activePill,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Ionicons
                      name={icon}
                      size={18}
                      color={theme.colors.primaryText}
                    />
                    <Typography
                      variant="caption"
                      weight="bold"
                      style={[
                        styles.activeLabel,
                        { color: theme.colors.primaryText },
                      ]}
                    >
                      {label}
                    </Typography>
                  </View>
                ) : (
                  <View style={styles.inactivePill}>
                    <Ionicons
                      name={icon}
                      size={22}
                      color={theme.colors.tabBarInactive}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="(explore)" />
      <Tabs.Screen name="(saved)" />
      <Tabs.Screen name="(library)" />
    </Tabs>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
  },
  container: {
    borderRadius: theme.radius.full,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
    width: "100%",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: theme.radius.full,
  },
  activeLabel: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  inactivePill: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
}));
