import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { useIdioms } from "@/features/idioms/hooks/useIdioms";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Typography } from "@/shared/components/Typography";

const LANG_KEY: Record<string, string> = {
  en: "lang.en",
  es: "lang.es",
  de: "lang.de",
  fr: "lang.fr",
};

export default function ByLanguageScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: idioms = [] } = useIdioms();

  const languageCounts = idioms.reduce<Record<string, number>>((acc, idiom) => {
    acc[idiom.languageCode] = (acc[idiom.languageCode] ?? 0) + 1;
    return acc;
  }, {});

  const languages = Object.entries(languageCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([code, count]) => ({ code, count }));

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
        {languages.map(({ code, count }) => (
          <Pressable
            key={code}
            onPress={() => router.push(`/(main)/(tabs)/(library)/${code}`)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t(LANG_KEY[code] ?? code)}
          >
            {Platform.OS !== "android" && (
              <BlurView
                intensity={40}
                tint={isDark ? "dark" : "light"}
                style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
              />
            )}
            <View
              style={[
                styles.langCircle,
                { backgroundColor: theme.colors.chipBg },
              ]}
            >
              <Typography
                variant="body"
                weight="extraBold"
                style={[styles.langCode, { color: theme.colors.primary }]}
              >
                {code.toUpperCase()}
              </Typography>
            </View>
            <View style={styles.cardText}>
              <Typography
                variant="body"
                weight="bold"
                style={{ color: theme.colors.text, fontSize: 16 }}
              >
                {t(LANG_KEY[code] ?? code)}
              </Typography>
              <Typography
                variant="caption"
                style={{ color: theme.colors.textMuted }}
              >
                {t("byLanguage.idiomCount", { count })}
              </Typography>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.textMuted}
            />
          </Pressable>
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  langCircle: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  langCode: {
    fontSize: 14,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
}));
