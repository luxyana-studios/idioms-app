import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useUserLanguages } from "@/features/languages/hooks/useUserLanguages";
import { LanguageChip } from "@/features/onboarding/components/LanguageChip";
import { StepProgress } from "@/features/onboarding/components/StepProgress";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding.store";
import { Button } from "@/shared/components/Button";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

export default function LanguagesScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const { selectedLanguageCodes, toggleLanguage } = useOnboardingStore();
  const { availableLanguages, configuredLanguages, isLoading } =
    useUserLanguages();

  // Combine all catalog languages (configured + available) sorted by position
  // so the user can pick or re-pick regardless of prior configuration state.
  const catalogLanguages = [...configuredLanguages, ...availableLanguages].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <ScreenContainer>
      <View style={styles.inner}>
        <StepProgress total={2} current={2} />

        <View style={styles.header}>
          <Typography variant="title" weight="bold">
            {t("onboarding.languagesTitle")}
          </Typography>
          <Typography
            variant="body"
            style={{ color: theme.colors.textSecondary }}
          >
            {t("onboarding.languagesSubtitle")}
          </Typography>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            {catalogLanguages.map((lang) => (
              <LanguageChip
                key={lang.languageCode}
                flag={lang.flag}
                label={t(`lang.${lang.languageCode}`)}
                selected={selectedLanguageCodes.includes(lang.languageCode)}
                onPress={() => toggleLanguage(lang.languageCode)}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.actions}>
          <Button
            title={t("onboarding.continue")}
            disabled={selectedLanguageCodes.length === 0}
            onPress={() => router.push("/(onboarding)/complete")}
          />
          <Button
            title={t("onboarding.skip")}
            variant="ghost"
            onPress={() => router.push("/(onboarding)/complete")}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing["2xl"],
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  header: {
    gap: 6,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    alignContent: "flex-start",
    paddingBottom: theme.spacing.md,
  },
  actions: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
  },
}));
