import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { LanguageCard } from "@/features/idioms/components/LanguageCard";
import { useLanguageCounts } from "@/features/idioms/hooks/useLanguageCounts";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Typography } from "@/shared/components/Typography";

export default function ByLanguageScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { languages, isLoading, isError } = useLanguageCounts();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <GlowBackground subtle />
      <ScreenHeader
        left={
          <IconButton
            icon="chevron-back"
            onPress={() => router.back()}
            accessibilityLabel={t("common.goBack")}
          />
        }
        center={
          <Typography
            variant="title"
            weight="extraBold"
            style={{ color: theme.colors.text }}
          >
            {t("byLanguage.title")}
          </Typography>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 8) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isError && (
          <Typography
            variant="body"
            style={{ color: theme.colors.textMuted, textAlign: "center" }}
          >
            {t("common.error")}
          </Typography>
        )}
        {!isLoading && !isError && languages.length === 0 && (
          <Typography
            variant="body"
            style={{ color: theme.colors.textMuted, textAlign: "center" }}
          >
            {t("byLanguage.noIdioms")}
          </Typography>
        )}
        {!isLoading &&
          !isError &&
          languages.map(({ code, count }) => (
            <LanguageCard key={code} code={code} count={count} />
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
}));
