import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SUPPORTED_UI_LANGUAGES, type SupportedUiLanguage } from "@/core/i18n";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { PickerSheet } from "@/shared/components/PickerSheet";
import { Typography } from "@/shared/components/Typography";

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguagePickerModal({
  visible,
  onClose,
}: LanguagePickerModalProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { language, setLanguage } = useSettings();
  const uiLanguageLabel = t("settings.uiLanguage", {
    defaultValue: t("settings.language"),
  });

  const handlePick = (code: SupportedUiLanguage) => {
    const restartNeeded = setLanguage(code);
    onClose();
    if (restartNeeded) {
      Alert.alert(t("settings.restartTitle"), t("settings.restartMessage"), [
        { text: t("common.ok") },
      ]);
    }
  };

  return (
    <PickerSheet visible={visible} title={uiLanguageLabel} onClose={onClose}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {SUPPORTED_UI_LANGUAGES.map((code: SupportedUiLanguage) => {
          const isActive = code === language;
          return (
            <Pressable
              key={code}
              style={styles.row}
              onPress={() => handlePick(code)}
              accessibilityRole="button"
              accessibilityLabel={t(`lang.${code}`)}
              accessibilityState={{ selected: isActive }}
            >
              <Typography variant="body" color={isActive ? "primary" : "text"}>
                {t(`lang.${code}`)}
              </Typography>
              {isActive && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </PickerSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: theme.spacing.md,
    minHeight: theme.spacing.touchTarget,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
}));
