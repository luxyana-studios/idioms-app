import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { LANG_KEY } from "@/features/idioms/constants";
import { useIdiomTranslations } from "@/features/idioms/hooks/useIdiomTranslations";
import type { IdiomTranslation } from "@/features/idioms/types";
import { Typography } from "@/shared/components/Typography";
import { IdiomInfoCard } from "./IdiomInfoCard";

interface TranslationContentProps {
  translation: IdiomTranslation;
}

function TranslationContent({ translation }: TranslationContentProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
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
          {translation.literalTranslation}
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
          {translation.idiomaticMeaning}
        </Typography>
      </View>
      {translation.explanation && (
        <Typography
          variant="caption"
          style={{ color: theme.colors.textMuted, lineHeight: 20 }}
        >
          {translation.explanation}
        </Typography>
      )}
    </View>
  );
}

export function TranslationSection({ idiomId }: { idiomId: string }) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const {
    data: translations = [],
    isLoading,
    isError,
  } = useIdiomTranslations(idiomId);

  // Silently absent — failed fetch or no translations should not degrade the detail view.
  if (isError || (!isLoading && translations.length === 0)) return null;

  const selected =
    translations.find((tr) => tr.languageCode === selectedLang) ?? null;

  return (
    <IdiomInfoCard label={t("detail.translationLabel")}>
      {isLoading ? (
        <Typography variant="caption" style={{ color: theme.colors.textMuted }}>
          {t("common.loading")}
        </Typography>
      ) : (
        <>
          <View style={styles.pills}>
            {translations.map((tr) => {
              const active = selectedLang === tr.languageCode;
              return (
                <Pressable
                  key={tr.languageCode}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() =>
                    setSelectedLang(active ? null : tr.languageCode)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={t(
                    LANG_KEY[tr.languageCode] ?? tr.languageCode,
                  )}
                >
                  <Typography
                    variant="caption"
                    weight="bold"
                    style={{
                      color: active
                        ? theme.colors.primary
                        : theme.colors.textMuted,
                    }}
                  >
                    {tr.languageCode.toUpperCase()}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
          {selected && <TranslationContent translation={selected} />}
        </>
      )}
    </IdiomInfoCard>
  );
}

const styles = StyleSheet.create((theme) => ({
  pills: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: theme.spacing.xs,
  },
  pill: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`,
  },
  content: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
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
