import Ionicons from "@expo/vector-icons/Ionicons";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, FeGaussianBlur, Filter } from "react-native-svg";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";

export function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();

  const { width: drawerWidth, height: drawerHeight } = useWindowDimensions();
  const email = user?.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";
  const version = Constants.expoConfig?.version ?? "1.0.0";

  function navigate(href: Parameters<typeof router.navigate>[0]) {
    navigation.closeDrawer();
    router.navigate(href);
  }

  const GlassBackground =
    Platform.OS === "android" ? (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: theme.colors.background },
        ]}
      />
    ) : (
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFillObject}
      />
    );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + theme.spacing.md,
          paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
        },
      ]}
    >
      {/* Glass background */}
      {GlassBackground}

      {/* Subtle top-edge shimmer */}
      <LinearGradient
        colors={[`${theme.colors.primary}18`, "transparent"]}
        style={styles.shimmer}
        pointerEvents="none"
      />

      {/* Ambient glow blob */}
      <View style={styles.glow} pointerEvents="none">
        <Svg width={drawerWidth} height={drawerHeight}>
          <Defs>
            <Filter
              id="blurDrawer1"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <FeGaussianBlur stdDeviation="35" />
            </Filter>
            <Filter
              id="blurDrawer2"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <FeGaussianBlur stdDeviation="28" />
            </Filter>
          </Defs>
          <Circle
            cx={drawerWidth}
            cy={0}
            r={90}
            fill={`${theme.colors.primary}40`}
            filter="url(#blurDrawer1)"
          />
          <Circle
            cx={0}
            cy={drawerHeight}
            r={80}
            fill={`${theme.colors.secondary}30`}
            filter="url(#blurDrawer2)"
          />
        </Svg>
      </View>

      {/* Profile */}
      <View style={styles.profile}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Typography
            variant="heading"
            weight="extraBold"
            style={{ color: theme.colors.primaryText }}
          >
            {initial}
          </Typography>
        </LinearGradient>
        {email ? (
          <Typography variant="body" color="textSecondary">
            {email}
          </Typography>
        ) : null}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Nav items */}
      <View style={styles.nav}>
        <Pressable
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
          ]}
          onPress={() => navigate("/(main)/(tabs)/(home)")}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="albums-outline"
              size={20}
              color={theme.colors.primary}
            />
          </View>
          <Typography variant="body" weight="semibold">
            {t("home.title")}
          </Typography>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
          ]}
          onPress={() => navigate("/(main)/(tabs)/(explore)")}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
          <Typography variant="body" weight="semibold">
            {t("explore.title")}
          </Typography>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
          ]}
          onPress={() => navigate("/(main)/(tabs)/(saved)")}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="bookmark-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
          <Typography variant="body" weight="semibold">
            {t("saved.title")}
          </Typography>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.navItem,
            pressed && styles.navItemPressed,
          ]}
          onPress={() => navigate("/(main)/(settings)")}
        >
          <View style={styles.navIcon}>
            <Ionicons
              name="settings-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
          <Typography variant="body" weight="semibold">
            {t("settings.title")}
          </Typography>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Typography variant="caption" style={{ opacity: 0.4 }}>
          {t("drawer.appVersion", { version })}
        </Typography>
        <Button
          title={t("common.logout")}
          variant="outline"
          onPress={signOut}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    overflow: "hidden" as const,
  },
  shimmer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
  },
  nav: {
    flex: 1,
  },
  profile: {
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.sm,
    alignItems: "flex-start" as const,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  navItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.lg,
  },
  navItemPressed: {
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.lg,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceContainer,
    borderColor: theme.colors.border,
  },
  footer: {
    gap: theme.spacing.md,
  },
}));
