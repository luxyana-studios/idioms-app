import Ionicons from "@expo/vector-icons/Ionicons";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";

export function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();

  const email = user?.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";
  const version = Constants.expoConfig?.version ?? "1.0.0";

  function navigate(href: Parameters<typeof router.navigate>[0]) {
    navigation.closeDrawer();
    router.navigate(href);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
        },
      ]}
    >
      <View style={styles.profile}>
        <View
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        >
          <Typography
            variant="heading"
            style={{ color: theme.colors.primaryText }}
          >
            {initial}
          </Typography>
        </View>
        {email ? (
          <Typography variant="body" color="textSecondary">
            {email}
          </Typography>
        ) : null}
      </View>

      <View style={styles.divider} />

      <View style={styles.nav}>
        <Pressable
          style={styles.navItem}
          onPress={() => navigate("/(main)/(tabs)/(home)")}
        >
          <Ionicons name="home-outline" size={20} color={theme.colors.text} />
          <Typography variant="body">{t("home.title")}</Typography>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => navigate("/(main)/(tabs)/(explore)")}
        >
          <Ionicons name="search-outline" size={20} color={theme.colors.text} />
          <Typography variant="body">{t("explore.title")}</Typography>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => navigate("/(main)/(settings)")}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={theme.colors.text}
          />
          <Typography variant="body">{t("settings.title")}</Typography>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Typography variant="caption">
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
    borderRadius: 28,
    alignItems: "center" as const,
    justifyContent: "center" as const,
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
    borderRadius: theme.radius.md,
  },
  footer: {
    gap: theme.spacing.md,
  },
}));
