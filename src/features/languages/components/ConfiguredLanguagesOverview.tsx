import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Typography } from "@/shared/components/Typography";
import { useUserLanguages } from "../hooks/useUserLanguages";
import {
  LanguageDisplayRow,
  languageDisplayRowStyles,
} from "./LanguageDisplayRow";

interface ConfiguredLanguagesOverviewProps {
  onEdit: () => void;
}

export function ConfiguredLanguagesOverview({
  onEdit,
}: ConfiguredLanguagesOverviewProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { configuredLanguages, isLoading, isError } = useUserLanguages();
  const hasLanguages = configuredLanguages.length > 0;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Typography variant="label">
          {t("settings.exploreLanguages")}
        </Typography>
        <Pressable
          style={styles.editButton}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={t(
            hasLanguages ? "languages.editConfigured" : "languages.add",
          )}
          hitSlop={8}
        >
          <Ionicons
            name={hasLanguages ? "pencil" : "add"}
            size={18}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.stateRow}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )}

      {isError && (
        <Typography variant="body" color="error">
          {t("languages.error")}
        </Typography>
      )}

      {!isLoading && !isError && !hasLanguages && (
        <Pressable
          style={styles.emptyRow}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={t("languages.add")}
        >
          <Typography variant="body" color="textSecondary">
            {t("languages.noneConfigured")}
          </Typography>
          <Ionicons name="add" size={18} color={theme.colors.textMuted} />
        </Pressable>
      )}

      {!isLoading && !isError && hasLanguages && (
        <View>
          {configuredLanguages.map((config) => {
            const code = config.languageCode;
            return (
              <View
                key={code}
                style={[languageDisplayRowStyles.row, styles.languageRow]}
              >
                <LanguageDisplayRow
                  label={t(`lang.${code}`, {
                    defaultValue: code.toUpperCase(),
                  })}
                  flag={config.flag}
                  color={config.color}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  editButton: {
    width: 32,
    height: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stateRow: {
    minHeight: theme.spacing.touchTarget,
    justifyContent: "center" as const,
  },
  emptyRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    minHeight: theme.spacing.touchTarget,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  languageRow: {
    paddingVertical: theme.spacing.sm,
  },
}));
