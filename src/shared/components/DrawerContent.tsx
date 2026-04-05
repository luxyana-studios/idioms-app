import Ionicons from "@expo/vector-icons/Ionicons";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";

export function DrawerContent({
  navigation,
  ...props
}: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();

  const email = user?.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";
  const version = Constants.expoConfig?.version ?? "1.0.0";

  function handleSettings() {
    navigation.closeDrawer();
    router.navigate("/(main)/(settings)");
  }

  return (
    <DrawerContentScrollView
      {...props}
      style={{ flex: 1, backgroundColor: theme.colors.surface }}
      contentContainerStyle={styles.container}
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

      <Pressable style={styles.navItem} onPress={handleSettings}>
        <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
        <Typography variant="body">{t("settings.title")}</Typography>
      </Pressable>

      <View style={styles.spacer} />

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
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
  spacer: {
    flex: 1,
  },
  footer: {
    gap: theme.spacing.md,
  },
}));
