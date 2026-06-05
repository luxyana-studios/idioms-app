import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useRouter, useSegments } from "expo-router";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";

// Extra scroll padding screens should add so content clears the floating nav.
// = pill height (60) + bottom margin (8) + safe-area gap (8) = 76
export const BOTTOM_NAV_EXTRA_PADDING = 76;

const PILL_HEIGHT = 60;
const PILL_MAX_WIDTH = 360;

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface NavItemDef {
  // The route group segment, e.g. "(home)" — matched against useSegments()[2]
  segment: string;
  navigateTo: string;
  icon: IoniconName;
  iconOutline: IoniconName;
  labelKey: string;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    segment: "(home)",
    navigateTo: "/(main)/(tabs)/(home)",
    icon: "dice",
    iconOutline: "dice-outline",
    labelKey: "home.surprise",
  },
  {
    segment: "(explore)",
    navigateTo: "/(main)/(tabs)/(explore)",
    icon: "search",
    iconOutline: "search-outline",
    labelKey: "explore.title",
  },
  {
    segment: "(saved)",
    navigateTo: "/(main)/(tabs)/(saved)",
    icon: "bookmark",
    iconOutline: "bookmark-outline",
    labelKey: "saved.title",
  },
];

interface NavItemProps {
  item: NavItemDef;
  isActive: boolean;
  onPress: () => void;
}

function NavItemComponent({ item, isActive, onPress }: NavItemProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  const chipScale = useSharedValue(isActive ? 1 : 0.75);
  const chipOpacity = useSharedValue(isActive ? 1 : 0);
  const iconScale = useSharedValue(isActive ? 1.08 : 1);

  useEffect(() => {
    chipScale.value = withSpring(isActive ? 1 : 0.75, {
      damping: 18,
      stiffness: 280,
    });
    chipOpacity.value = withTiming(isActive ? 1 : 0, { duration: 160 });
    iconScale.value = withSpring(isActive ? 1.08 : 1, {
      damping: 20,
      stiffness: 320,
    });
  }, [isActive, chipScale, chipOpacity, iconScale]);

  const chipStyle = useAnimatedStyle(() => ({
    opacity: chipOpacity.value,
    transform: [{ scale: chipScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const color = isActive ? theme.colors.primary : theme.colors.tabBarInactive;

  return (
    <Pressable
      onPress={onPress}
      style={styles.item}
      accessibilityRole="button"
      accessibilityLabel={t(item.labelKey)}
      hitSlop={4}
    >
      <Animated.View
        style={[
          styles.activeChip,
          chipStyle,
          {
            backgroundColor: theme.colors.chipBg,
            borderColor: theme.colors.chipBorder,
          },
        ]}
      />
      <Animated.View style={iconStyle}>
        <Ionicons
          name={isActive ? item.icon : item.iconOutline}
          size={24}
          color={color}
        />
      </Animated.View>
    </Pressable>
  );
}

export function BottomNav() {
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Cast to string[] — typedRoutes narrows useSegments() to a union of
  // fixed-length tuples, causing out-of-bounds errors on deeper index access.
  const segments = useSegments() as readonly string[];

  // segments[2] is the active tab group: "(home)", "(explore)", "(saved)", etc.
  // segments[3] exists when we're on a sub-route (surprise, [id], …)
  const activeTab = segments[2];
  const isOnFeed = activeTab === "(home)" && segments[3] === undefined;

  const isOnSurprise = activeTab === "(home)" && segments[3] === "surprise";

  const handlePress = useCallback(
    (item: NavItemDef) => {
      if (item.segment === "(home)") {
        if (isOnSurprise) {
          // Already on surprise: replace with fresh screen so the hook remounts
          // and fetches a new random batch.
          router.replace("/(main)/(tabs)/(home)/surprise");
        } else if (isOnFeed) {
          router.push("/(main)/(tabs)/(home)/surprise");
        } else {
          router.navigate("/(main)/(tabs)/(home)");
        }
      } else {
        router.navigate(
          item.navigateTo as Parameters<typeof router.navigate>[0],
        );
      }
    },
    [isOnFeed, isOnSurprise, router],
  );

  const GlassLayer =
    Platform.OS === "android" ? (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: theme.colors.glassSurface },
        ]}
      />
    ) : (
      <BlurView
        intensity={55}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFillObject}
      />
    );

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 8) + 8 }]}>
      <View
        style={[
          styles.pill,
          {
            borderColor: theme.colors.glassBtnBorder,
            shadowColor: isDark ? theme.colors.shadow : theme.colors.primary,
          },
        ]}
      >
        {GlassLayer}

        {NAV_ITEMS.map((item) => (
          <NavItemComponent
            key={item.segment}
            item={item}
            isActive={item.segment === activeTab}
            onPress={() => handlePress(item)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    height: PILL_HEIGHT,
    width: "88%",
    maxWidth: PILL_MAX_WIDTH,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    overflow: "hidden",
    // Warm shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  item: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  activeChip: {
    position: "absolute",
    width: 54,
    height: 40,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
}));
