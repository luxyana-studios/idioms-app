import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function LanguageIdiomsScreen() {
  const { lang } = useLocalSearchParams<{ lang: string }>();
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: idioms = [] } = useIdioms();

  const filtered = idioms.filter((idiom) => idiom.languageCode === lang);
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
        {filtered.length === 0 ? (
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
        ) : (
          filtered.map((idiom) => (
            <Pressable
              key={idiom.id}
              onPress={() => router.push(`/(main)/(tabs)/(home)/${idiom.id}`)}
              style={({ pressed }) => [
                styles.idiomCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.cardBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={idiom.expression}
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
                  styles.langBox,
                  { backgroundColor: theme.colors.chipBg },
                ]}
              >
                <Typography
                  variant="caption"
                  weight="extraBold"
                  style={[styles.langCode, { color: theme.colors.primary }]}
                >
                  {idiom.languageCode.slice(0, 2).toUpperCase()}
                </Typography>
              </View>
              <View style={styles.idiomText}>
                <Typography
                  variant="body"
                  weight="bold"
                  style={{ color: theme.colors.text, fontSize: 15 }}
                >
                  {idiom.expression}
                </Typography>
                <Typography
                  variant="caption"
                  style={{
                    color: theme.colors.textSecondary,
                    lineHeight: 18,
                  }}
                  numberOfLines={1}
                >
                  {idiom.idiomaticMeaning}
                </Typography>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.textMuted}
              />
            </Pressable>
          ))
        )}
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
  idiomCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  langBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  langCode: {
    fontSize: 11,
    textTransform: "uppercase",
  },
  idiomText: {
    flex: 1,
    gap: 3,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: theme.spacing.md,
  },
}));
