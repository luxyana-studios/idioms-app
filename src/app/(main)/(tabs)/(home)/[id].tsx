import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, FeGaussianBlur, Filter } from "react-native-svg";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { useIdiomsStore } from "@/features/idioms/stores/idioms.store";
import { Typography } from "@/shared/components/Typography";

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { idioms, savedIds, saveIdiom, unsaveIdiom } = useIdiomsStore();

  const idiom = idioms.find((i) => i.id === id);
  const isSaved = idiom ? savedIds.includes(idiom.id) : false;

  const cardBg = isDark ? "rgba(26,36,21,0.72)" : "rgba(255,255,255,0.68)";

  const headerBtnBg = isDark ? "rgba(38,52,30,0.80)" : "rgba(255,255,255,0.75)";
  const headerBtnBorder = isDark
    ? "rgba(160,200,100,0.14)"
    : "rgba(0,0,0,0.07)";

  if (!idiom) {
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
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
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Ambient blobs */}
      <View style={styles.blobs} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Filter
              id="blurDetail1"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <FeGaussianBlur stdDeviation="50" />
            </Filter>
          </Defs>
          <Circle
            cx="100%"
            cy="0"
            r={180}
            fill={`${theme.colors.blob1}${isDark ? "28" : "55"}`}
            filter="url(#blurDetail1)"
          />
        </Svg>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 8) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[
              styles.headerBtn,
              { backgroundColor: headerBtnBg, borderColor: headerBtnBorder },
            ]}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>

          {/* Category chip */}
          <View
            style={[
              styles.chip,
              {
                backgroundColor: isDark
                  ? "rgba(236,190,142,0.10)"
                  : "rgba(145,71,49,0.09)",
                borderColor: isDark
                  ? "rgba(236,190,142,0.18)"
                  : "rgba(145,71,49,0.18)",
              },
            ]}
          >
            <Typography
              variant="caption"
              weight="extraBold"
              style={{
                color: theme.colors.primary,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              {idiom.tags[0] ?? idiom.languageCode}
            </Typography>
          </View>

          <TouchableOpacity
            style={[
              styles.headerBtn,
              isSaved
                ? {
                    backgroundColor: theme.colors.primary,
                    borderColor: "transparent",
                  }
                : {
                    backgroundColor: headerBtnBg,
                    borderColor: headerBtnBorder,
                  },
            ]}
            onPress={() =>
              isSaved ? unsaveIdiom(idiom.id) : saveIdiom(idiom.id)
            }
            hitSlop={8}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={20}
              color={isSaved ? theme.colors.primaryText : theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Expression */}
        <Typography
          variant="display"
          weight="extraBold"
          style={[styles.expression, { color: theme.colors.primary }]}
        >
          {idiom.expression}
        </Typography>

        {/* Meaning */}
        <Typography
          variant="heading"
          weight="semibold"
          style={[styles.meaning, { color: theme.colors.textSecondary }]}
        >
          "{idiom.idiomaticMeaning}"
        </Typography>

        {/* Origin & Meaning card */}
        {idiom.explanation && (
          <View
            style={[
              styles.infoCard,
              { backgroundColor: cardBg, borderColor: theme.colors.cardBorder },
            ]}
          >
            {Platform.OS !== "android" ? (
              <BlurView
                intensity={50}
                tint={isDark ? "dark" : "light"}
                style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
              />
            ) : null}
            <LinearGradient
              colors={[
                isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.80)",
                "transparent",
              ]}
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
          </View>
        )}

        {/* Example card */}
        {idiom.examples && idiom.examples.length > 0 && (
          <View
            style={[
              styles.infoCard,
              { backgroundColor: cardBg, borderColor: theme.colors.cardBorder },
            ]}
          >
            {Platform.OS !== "android" ? (
              <BlurView
                intensity={50}
                tint={isDark ? "dark" : "light"}
                style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
              />
            ) : null}
            <LinearGradient
              colors={[
                isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.80)",
                "transparent",
              ]}
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
          </View>
        )}

        {/* Pronunciation button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {}}
          style={[
            styles.pronunciationBtn,
            { backgroundColor: theme.colors.primary },
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
  },
  blobs: {
    ...StyleSheet.absoluteFillObject,
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
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
    borderWidth: 1,
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
