import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LanguagePickerModal } from "@/features/settings/components/LanguagePickerModal";
import { useSettings } from "@/features/settings/hooks/useSettings";
import type { ThemeMode } from "@/features/settings/stores/settings.store";
import { Button } from "@/shared/components/Button";
import { DirectionalIcon } from "@/shared/components/DirectionalIcon";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

const themeModes: ThemeMode[] = ["system", "light", "dark"];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { themeMode, language, setThemeMode } = useSettings();
  const { signOut } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);

  const themeLabelKey = (mode: ThemeMode) => {
    const map: Record<ThemeMode, string> = {
      system: "settings.themeSystem",
      light: "settings.themeLight",
      dark: "settings.themeDark",
    };
    return map[mode];
  };

  return (
    <ScreenContainer>
      <View style={styles.section}>
        <Typography variant="label">{t("settings.theme")}</Typography>
        <View style={styles.optionRow}>
          {themeModes.map((mode) => (
            <Pressable
              key={mode}
              style={[styles.option, themeMode === mode && styles.optionActive]}
              onPress={() => setThemeMode(mode)}
            >
              <Typography
                variant="body"
                color={themeMode === mode ? "primary" : "text"}
              >
                {t(themeLabelKey(mode))}
              </Typography>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Typography variant="label">{t("settings.language")}</Typography>
        <Pressable
          style={styles.languageRow}
          onPress={() => setPickerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t("settings.language")}
        >
          <Typography variant="body">{t(`lang.${language}`)}</Typography>
          <DirectionalIcon
            name="chevron-forward"
            size={18}
            color={theme.colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.logout}>
        <Button
          title={t("common.logout")}
          variant="outline"
          onPress={signOut}
        />
      </View>

      <LanguagePickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  optionRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: theme.spacing.sm,
  },
  option: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`,
  },
  languageRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: theme.spacing.touchTarget,
  },
  logout: {
    marginTop: "auto" as const,
  },
}));
