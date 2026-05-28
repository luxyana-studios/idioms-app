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
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* Backdrop sits BEHIND the sheet as a sibling, not as a parent.
            Keeping them un-nested avoids rendering <button><button>…</button></button>
            on RN Web — both Pressables emit <button> via accessibilityRole="button".
            Layering is via absolute positioning + sibling z-order in DOM. */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + theme.spacing.md },
          ]}
        >
          <View style={styles.handle} />
          <Typography variant="heading" style={styles.title}>
            {uiLanguageLabel}
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    justifyContent: "flex-end" as const,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.scrim,
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
    width: theme.spacing["2xl"],
    height: theme.spacing.xs,
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
    minHeight: theme.spacing.touchTarget,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
}));
