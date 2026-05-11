import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { LANG_KEY } from "@/features/idioms/constants";
import { useIdiomTranslation } from "@/features/idioms/hooks/useIdiomTranslation";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { Typography } from "@/shared/components/Typography";
import { IdiomInfoCard } from "./IdiomInfoCard";

interface TranslationSectionProps {
  idiomId: string;
}

export function TranslationSection({ idiomId }: TranslationSectionProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { targetLanguage } = useSettings();
  const [revealed, setRevealed] = useState(false);

  const {
    data: translation,
    isLoading,
    isError,
  } = useIdiomTranslation(idiomId, targetLanguage);

  // No target language configured — user hasn't enabled learning mode.
  if (!targetLanguage) return null;
  // Translation fetch failed or not found — degrade silently.
  if (isError || (!isLoading && !translation)) return null;

  const langLabel = t(LANG_KEY[targetLanguage] ?? targetLanguage);

  return (
    <IdiomInfoCard label={t("detail.translationLabel", { lang: langLabel })}>
      {isLoading ? (
        <Typography variant="caption" style={{ color: theme.colors.textMuted }}>
          {t("common.loading")}
        </Typography>
      ) : !revealed ? (
        <Pressable
          onPress={() => setRevealed(true)}
          style={styles.revealButton}
          accessibilityRole="button"
          accessibilityLabel={t("detail.translationReveal")}
        >
          <Typography
            variant="caption"
            weight="bold"
            style={{ color: theme.colors.primary }}
          >
            {t("detail.translationReveal")}
          </Typography>
        </Pressable>
      ) : (
        <View style={styles.content}>
          <View style={styles.row}>
            <Typography
              variant="caption"
              weight="extraBold"
              style={styles.rowLabel}
            >
              {t("detail.translationLiteral").toUpperCase()}
            </Typography>
            <Typography variant="body" style={{ color: theme.colors.text }}>
              {translation?.literalTranslation}
            </Typography>
          </View>
          <View style={styles.row}>
            <Typography
              variant="caption"
              weight="extraBold"
              style={styles.rowLabel}
            >
              {t("detail.translationMeaning").toUpperCase()}
            </Typography>
            <Typography
              variant="body"
              style={{ color: theme.colors.textSecondary }}
            >
              {translation?.idiomaticMeaning}
            </Typography>
          </View>
          {translation?.explanation && (
            <Typography
              variant="caption"
              style={{
                color: theme.colors.textMuted,
                lineHeight: 20,
                marginTop: theme.spacing.xs,
              }}
            >
              {translation.explanation}
            </Typography>
          )}
        </View>
      )}
    </IdiomInfoCard>
  );
}

const styles = StyleSheet.create((theme) => ({
  revealButton: {
    alignSelf: "flex-start",
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  content: {
    gap: theme.spacing.sm,
  },
  row: {
    gap: theme.spacing.xs,
  },
  rowLabel: {
    color: theme.colors.accent,
    letterSpacing: 1.2,
    fontSize: theme.typography.sizes["2xs"],
  },
}));
