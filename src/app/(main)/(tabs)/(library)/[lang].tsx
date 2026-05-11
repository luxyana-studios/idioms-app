import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { LanguageIdiomCard } from "@/features/idioms/components/LanguageIdiomCard";
import { LANG_KEY } from "@/features/idioms/constants";
import { useLanguageIdioms } from "@/features/idioms/hooks/useLanguageIdioms";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Typography } from "@/shared/components/Typography";

export default function LanguageIdiomsScreen() {
  const { lang } = useLocalSearchParams<{ lang: string }>();
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { idioms, isLoading, isError } = useLanguageIdioms(lang);

  const languageName = t(LANG_KEY[lang ?? ""] ?? lang ?? "");

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
            {languageName}
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
        {!isLoading && !isError && idioms.length === 0 && (
          <View style={styles.empty}>
            <Ionicons
              name="albums-outline"
              size={40}
              color={theme.colors.textMuted}
            />
            <Typography
              variant="body"
              style={{ color: theme.colors.textMuted, textAlign: "center" }}
            >
              {t("byLanguage.noIdioms")}
            </Typography>
          </View>
        )}
        {!isLoading &&
          !isError &&
          idioms.map((idiom) => (
            <LanguageIdiomCard key={idiom.id} idiom={idiom} />
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
    gap: theme.spacing.sm,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: theme.spacing.md,
  },
}));
