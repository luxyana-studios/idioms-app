import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useIdioms } from "@/features/idioms/hooks/useIdioms";
import { useIdiomsStore } from "@/features/idioms/stores/idioms.store";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { GlassView } from "@/shared/components/GlassView";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Typography } from "@/shared/components/Typography";

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: idioms = [] } = useIdioms();
  const { savedIds, saveIdiom, unsaveIdiom } = useIdiomsStore();

  const idiom = idioms.find((i) => i.id === id);
  const isSaved = idiom ? savedIds.includes(idiom.id) : false;

  if (!idiom) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.notFound}>
          <Typography
            variant="heading"
            weight="bold"
            style={{ color: theme.colors.text }}
          >
            {t("detail.notFound")}
          </Typography>
          <Typography variant="body" style={{ color: theme.colors.textMuted }}>
            {t("detail.notFoundSubtitle")}
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
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
          <CategoryChip label={idiom.tags[0]?.label ?? idiom.languageCode} />
        }
        right={
          <IconButton
            icon={isSaved ? "heart" : "heart-outline"}
            onPress={() =>
              isSaved ? unsaveIdiom(idiom.id) : saveIdiom(idiom.id)
            }
            variant={isSaved ? "primary" : "glass"}
            accessibilityLabel={t(isSaved ? "home.saved" : "common.save")}
          />
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
        <Typography
          variant="display"
          weight="extraBold"
          style={[styles.expression, { color: theme.colors.primary }]}
        >
          {idiom.expression}
        </Typography>

        <Typography
          variant="heading"
          weight="semibold"
          style={[styles.meaning, { color: theme.colors.textSecondary }]}
        >
          "{idiom.idiomaticMeaning}"
        </Typography>

        {idiom.explanation && (
          <GlassView style={styles.infoCard}>
            <LinearGradient
              colors={[theme.colors.cardShimmer, "transparent"]}
              style={styles.cardShimmer}
              pointerEvents="none"
            />
            <Typography
              variant="caption"
              weight="extraBold"
              style={[styles.cardLabel, { color: theme.colors.textMuted }]}
            >
              {t("detail.originLabel")}
            </Typography>
            <Typography
              variant="body"
              style={{ color: theme.colors.text, lineHeight: 26 }}
            >
              {idiom.explanation}
            </Typography>
          </GlassView>
        )}

        {idiom.examples && idiom.examples.length > 0 && (
          <GlassView style={styles.infoCard}>
            <LinearGradient
              colors={[theme.colors.cardShimmer, "transparent"]}
              style={styles.cardShimmer}
              pointerEvents="none"
            />
            <Typography
              variant="caption"
              weight="extraBold"
              style={[styles.cardLabel, { color: theme.colors.textMuted }]}
            >
              {t("detail.exampleLabel")}
            </Typography>
            {idiom.examples.map((example) => (
              <Typography
                key={example}
                variant="body"
                style={{
                  color: theme.colors.textSecondary,
                  lineHeight: 26,
                  fontStyle: "italic",
                }}
              >
                {example}
              </Typography>
            ))}
          </GlassView>
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled
          style={[
            styles.pronunciationBtn,
            { backgroundColor: theme.colors.primary, opacity: 0.6 },
          ]}
        >
          <Ionicons
            name="volume-medium"
            size={20}
            color={theme.colors.primaryText}
          />
          <Typography
            variant="label"
            weight="bold"
            style={{ color: theme.colors.primaryText, letterSpacing: 0.5 }}
          >
            {t("home.playPronunciation")}
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  expression: {
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -1.2,
  },
  meaning: {
    fontSize: 18,
    lineHeight: 28,
    fontStyle: "italic",
    marginBottom: theme.spacing.sm,
  },
  infoCard: {
    borderRadius: 20,
    padding: 18,
    gap: theme.spacing.sm,
    overflow: "hidden",
  },
  cardShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardLabel: {
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 10,
  },
  pronunciationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
}));
