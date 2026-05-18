import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SUPPORTED_UI_LANGUAGES, type SupportedUiLanguage } from "@/core/i18n";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSettings } from "@/features/settings/hooks/useSettings";
import type { ThemeMode } from "@/features/settings/stores/settings.store";
import { Button } from "@/shared/components/Button";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

const themeModes: ThemeMode[] = ["system", "light", "dark"];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { themeMode, language, setThemeMode, setLanguage } = useSettings();
  const { signOut } = useAuth();

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
        <View style={styles.optionRow}>
          {SUPPORTED_UI_LANGUAGES.map((languageCode: SupportedUiLanguage) => (
            <Pressable
              key={languageCode}
              style={[
                styles.option,
                language === languageCode && styles.optionActive,
              ]}
              onPress={() => {
                const restartNeeded = setLanguage(languageCode);
                if (restartNeeded) {
                  Alert.alert(
                    t("settings.restartTitle"),
                    t("settings.restartMessage"),
                    [{ text: t("common.ok") }],
                  );
                }
              }}
            >
              <Typography
                variant="body"
                color={language === languageCode ? "primary" : "text"}
              >
                {t(`lang.${languageCode}`)}
              </Typography>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.logout}>
        <Button
          title={t("common.logout")}
          variant="outline"
          onPress={signOut}
        />
      </View>
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
  logout: {
    marginTop: "auto" as const,
  },
}));
