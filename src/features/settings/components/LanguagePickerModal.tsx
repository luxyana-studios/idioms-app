import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SUPPORTED_UI_LANGUAGES, type SupportedUiLanguage } from "@/core/i18n";
import { useSettings } from "@/features/settings/hooks/useSettings";
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
  const insets = useSafeAreaInsets();

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
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t("common.goBack")}
      >
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          // Stop bubbling so taps inside the sheet don't dismiss it.
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Typography variant="heading" style={styles.title}>
            {t("settings.language")}
          </Typography>
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
                  <Typography
                    variant="body"
                    color={isActive ? "primary" : "text"}
                  >
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.scrim,
    justifyContent: "flex-end" as const,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius["2xl"],
    borderTopRightRadius: theme.radius["2xl"],
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    maxHeight: "80%" as const,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    alignSelf: "center" as const,
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  list: {
    paddingBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
}));
