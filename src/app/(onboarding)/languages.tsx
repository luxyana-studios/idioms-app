import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { DEFAULT_IDIOM_LANGUAGE_CODES } from "@/features/languages/constants";
import { LanguageChip } from "@/features/onboarding/components/LanguageChip";
import { StepProgress } from "@/features/onboarding/components/StepProgress";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding.store";
import { Button } from "@/shared/components/Button";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

const LANGUAGE_FLAGS: Record<string, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  de: "🇩🇪",
  fr: "🇫🇷",
  it: "🇮🇹",
  pt: "🇵🇹",
  zh: "🇨🇳",
  hi: "🇮🇳",
  ar: "🇸🇦",
  ja: "🇯🇵",
  ko: "🇰🇷",
};

export default function LanguagesScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const { selectedLanguageCodes, setSelectedLanguageCodes } =
    useOnboardingStore();

  const toggle = (code: string) => {
    setSelectedLanguageCodes(
      selectedLanguageCodes.includes(code)
        ? selectedLanguageCodes.filter((c) => c !== code)
        : [...selectedLanguageCodes, code],
    );
  };

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

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {DEFAULT_IDIOM_LANGUAGE_CODES.map((code) => (
            <LanguageChip
              key={code}
              flag={LANGUAGE_FLAGS[code] ?? "🏳️"}
              label={t(`lang.${code}`)}
              selected={selectedLanguageCodes.includes(code)}
              onPress={() => toggle(code)}
            />
          ))}
        </ScrollView>

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
