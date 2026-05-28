import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Typography } from "@/shared/components/Typography";
import {
  useAddUserLanguage,
  useRemoveUserLanguage,
  useReorderUserLanguages,
  useUpdateUserLanguage,
} from "../hooks/useUserLanguageMutations";
import { useUserLanguages } from "../hooks/useUserLanguages";
import { LanguageConfigRow } from "./LanguageConfigRow";

export function LanguageConfigList() {
  const { t } = useTranslation();
  const {
    configuredLanguages,
    configuredByCode,
    availableLanguages,
    isLoading,
    isError,
  } = useUserLanguages();

  const addLanguage = useAddUserLanguage();
  const updateLanguage = useUpdateUserLanguage();
  const removeLanguage = useRemoveUserLanguage();
  const reorderLanguages = useReorderUserLanguages();
  const configuredCodes = configuredLanguages.map((lang) => lang.languageCode);

  const handleToggle = useCallback(
    (code: string) => {
      if (configuredByCode.has(code)) {
        removeLanguage.mutate(code);
      } else {
        const language = availableLanguages.find(
          (lang) => lang.languageCode === code,
        );
        if (!language) return;
        addLanguage.mutate({
          languageCode: language.languageCode,
          color: language.color,
          flag: language.flag,
          position: configuredLanguages.length,
        });
      }
    },
    [
      configuredByCode,
      configuredLanguages.length,
      availableLanguages,
      addLanguage,
      removeLanguage,
    ],
  );

  const handleSetColor = useCallback(
    (code: string, color: string) => {
      updateLanguage.mutate({ languageCode: code, patch: { color } });
    },
    [updateLanguage],
  );

  const handleSetFlag = useCallback(
    (code: string, flag: string) => {
      updateLanguage.mutate({ languageCode: code, patch: { flag } });
    },
    [updateLanguage],
  );

  const handleDragByRows = useCallback(
    (code: string, rowDelta: number) => {
      const from = configuredCodes.indexOf(code);
      const to = Math.max(
        0,
        Math.min(configuredCodes.length - 1, from + rowDelta),
      );
      if (from < 0 || to < 0 || to >= configuredCodes.length) return;
      if (from === to) return;
      const next = [...configuredCodes];
      const moved = next[from];
      if (!moved) return;
      next.splice(from, 1);
      next.splice(to, 0, moved);
      reorderLanguages.mutate(next);
    },
    [configuredCodes, reorderLanguages],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Typography variant="body" color="error">
          {t("languages.error")}
        </Typography>
      </View>
    );
  }

  if (configuredLanguages.length === 0 && availableLanguages.length === 0) {
    return (
      <View style={styles.center}>
        <Typography variant="body" color="textSecondary">
          {t("languages.empty")}
        </Typography>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    >
      <Typography variant="body" color="textSecondary" style={styles.intro}>
        {t("languages.intro")}
      </Typography>

      {configuredLanguages.length > 0 && (
        <View style={styles.section}>
          <Typography variant="label" color="textSecondary">
            {t("languages.configuredSection")}
          </Typography>
          {configuredLanguages.map((config) => {
            const code = config.languageCode;
            return (
              <LanguageConfigRow
                key={code}
                code={code}
                label={t(`lang.${code}`, { defaultValue: code.toUpperCase() })}
                isSelected
                color={config.color}
                flag={config.flag}
                onToggle={handleToggle}
                onSetColor={handleSetColor}
                onSetFlag={handleSetFlag}
                onDragByRows={handleDragByRows}
              />
            );
          })}
        </View>
      )}

      {availableLanguages.length > 0 && (
        <View style={styles.section}>
          <Typography variant="label" color="textSecondary">
            {t("languages.availableSection")}
          </Typography>
          {availableLanguages.map((displayConfig) => {
            const code = displayConfig.languageCode;
            return (
              <LanguageConfigRow
                key={code}
                code={code}
                label={t(`lang.${code}`, { defaultValue: code.toUpperCase() })}
                isSelected={false}
                color={displayConfig.color}
                flag={displayConfig.flag}
                onToggle={handleToggle}
                onSetColor={handleSetColor}
                onSetFlag={handleSetFlag}
                onDragByRows={handleDragByRows}
              />
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  center: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: theme.spacing.lg,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  intro: {
    marginBottom: theme.spacing.md,
  },
  section: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
}));
