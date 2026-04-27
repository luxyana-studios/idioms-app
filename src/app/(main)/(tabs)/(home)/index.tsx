import Ionicons from "@expo/vector-icons/Ionicons";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, FeGaussianBlur, Filter } from "react-native-svg";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { useIdioms } from "@/features/idioms/hooks/useIdioms";
import { useIdiomsStore } from "@/features/idioms/stores/idioms.store";
import { Typography } from "@/shared/components/Typography";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const router = useRouter();
  const navigation =
    useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollPaddingBottom =
    80 + Math.max(insets.bottom, 8) + theme.spacing.xl;
  const { data: idioms = [], isLoading } = useIdioms();
  const { currentIndex, savedIds, saveIdiom, unsaveIdiom, nextIdiom } =
    useIdiomsStore();

  const CARD_WIDTH = Math.min(screenWidth - theme.spacing.lg * 2, 340);
  const CARD_HEIGHT = Math.round(CARD_WIDTH * (4 / 3));

  const current = idioms[currentIndex];

  if (isLoading || !current) {
    return (
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isSaved = savedIds.includes(current.id);
  const progress = (currentIndex + 1) / idioms.length;

  const handleSave = () => {
    if (isSaved) unsaveIdiom(current.id);
    else saveIdiom(current.id);
    nextIdiom(idioms.length);
  };

  const headerBtnBg = isDark ? "rgba(38,52,30,0.80)" : "rgba(255,255,255,0.75)";
  const headerBtnBorder = isDark
    ? "rgba(160,200,100,0.14)"
    : "rgba(0,0,0,0.07)";

  const cardBg = isDark ? "rgba(26,36,18,0.62)" : "rgba(255,255,255,0.78)";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Ambient glow blobs ── */}
      <View style={styles.blobsContainer} pointerEvents="none">
        <Svg width={screenWidth} height={screenHeight}>
          <Defs>
            <Filter
              id="blurHomeTop"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <FeGaussianBlur stdDeviation="70" />
            </Filter>
            <Filter
              id="blurHomeBottom"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <FeGaussianBlur stdDeviation="65" />
            </Filter>
          </Defs>
          <Circle
            cx={screenWidth}
            cy={0}
            r={220}
            fill={`${theme.colors.blob1}${isDark ? "30" : "88"}`}
            filter="url(#blurHomeTop)"
          />
          <Circle
            cx={0}
            cy={screenHeight}
            r={200}
            fill={`${theme.colors.blob2}${isDark ? "28" : "72"}`}
            filter="url(#blurHomeBottom)"
          />
        </Svg>
      </View>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.headerBtn,
            { backgroundColor: headerBtnBg, borderColor: headerBtnBorder },
          ]}
          onPress={() => navigation.openDrawer()}
          hitSlop={10}
        >
          <Ionicons name="menu" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <Typography
          variant="heading"
          weight="extraBold"
          style={[styles.logo, { color: theme.colors.primary }]}
        >
          IdiomDeck
        </Typography>

        <TouchableOpacity
          style={[
            styles.headerBtn,
            { backgroundColor: headerBtnBg, borderColor: headerBtnBorder },
          ]}
          hitSlop={10}
          onPress={() => router.push("/(main)/(tabs)/(explore)")}
          accessibilityRole="button"
          accessibilityLabel={t("explore.title")}
        >
          <Ionicons name="search" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Scroll content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Typography
            variant="caption"
            weight="extraBold"
            style={[styles.sectionLabel, { color: theme.colors.accent }]}
          >
            {t("home.dailySelection")}
          </Typography>
          <Typography
            variant="title"
            weight="extraBold"
            style={[styles.sectionTitle, { color: theme.colors.text }]}
          >
            {t("home.expandLexicon")}
          </Typography>
        </View>

        {/* ── Card Stack ── */}
        <View
          style={[
            styles.stackWrapper,
            { width: CARD_WIDTH + 32, height: CARD_HEIGHT + 96 },
          ]}
        >
          {/* Back card 2 */}
          <View
            style={[
              styles.card,
              {
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                backgroundColor: isDark
                  ? "rgba(20,32,14,0.55)"
                  : "rgba(255,255,255,0.35)",
                borderColor: theme.colors.cardBorder,
                transform: [
                  { translateX: 10 },
                  { translateY: 10 },
                  { rotate: "2.5deg" },
                ],
                opacity: 0.35,
              },
            ]}
          />
          {/* Back card 1 */}
          <View
            style={[
              styles.card,
              {
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                backgroundColor: isDark
                  ? "rgba(25,38,18,0.65)"
                  : "rgba(255,255,255,0.55)",
                borderColor: theme.colors.cardBorder,
                transform: [
                  { translateX: 5 },
                  { translateY: 5 },
                  { rotate: "1deg" },
                ],
                opacity: 0.6,
              },
            ]}
          />

          {/* ── Front card ── */}
          <Pressable
            style={[
              styles.card,
              styles.cardFront,
              {
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={() => router.push(`/(main)/(tabs)/(home)/${current.id}`)}
          >
            {/* Glass background */}
            {Platform.OS !== "android" ? (
              <BlurView
                intensity={isDark ? 80 : 60}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFillObject}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  { backgroundColor: cardBg },
                ]}
              />
            )}

            {/* Top shimmer */}
            <LinearGradient
              colors={[
                isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.90)",
                "transparent",
              ]}
              style={styles.cardShimmer}
              pointerEvents="none"
            />
            {/* Warm accent glow — top-right corner in dark mode */}
            {isDark && (
              <LinearGradient
                colors={[`${theme.colors.primary}18`, "transparent"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />
            )}
            {/* Bottom shadow gradient */}
            <LinearGradient
              colors={[
                "transparent",
                isDark ? "rgba(0,0,0,0.20)" : "rgba(0,0,0,0.04)",
              ]}
              style={styles.cardShadowGradient}
              pointerEvents="none"
            />

            {/* Category chip + audio */}
            <View style={styles.cardTop}>
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
                  style={[styles.chipText, { color: theme.colors.primary }]}
                >
                  {current.tags[0]?.label ?? current.languageCode}
                </Typography>
              </View>
              <TouchableOpacity
                style={[
                  styles.audioBtn,
                  {
                    backgroundColor: isDark
                      ? "rgba(38,52,30,0.70)"
                      : "rgba(255,255,255,0.70)",
                    borderColor: isDark
                      ? "rgba(160,200,100,0.14)"
                      : "rgba(0,0,0,0.07)",
                  },
                ]}
                hitSlop={8}
              >
                <Ionicons
                  name="volume-medium"
                  size={18}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Phrase + definition */}
            <View style={styles.cardContent}>
              <Typography
                variant="display"
                weight="extraBold"
                style={[styles.phrase, { color: theme.colors.primary }]}
              >
                {current.expression}
              </Typography>
              <Typography
                variant="body"
                style={[
                  styles.definition,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {current.idiomaticMeaning}
              </Typography>
            </View>

            {/* Progress bar */}
            <View style={styles.cardFooter}>
              <View
                style={[
                  styles.progressTrack,
                  {
                    backgroundColor: isDark
                      ? "rgba(168,196,128,0.14)"
                      : "rgba(145,71,49,0.12)",
                  },
                ]}
              >
                <LinearGradient
                  colors={[theme.colors.accent, theme.colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%` as `${number}%` },
                  ]}
                />
              </View>
              <View style={styles.stats}>
                <Typography
                  variant="caption"
                  weight="extraBold"
                  style={[styles.statText, { color: theme.colors.textMuted }]}
                >
                  {current.languageCode.toUpperCase()}
                </Typography>
                <Typography
                  variant="caption"
                  style={[styles.statText, { color: theme.colors.textMuted }]}
                >
                  {currentIndex + 1} / {idioms.length}
                </Typography>
              </View>
            </View>
          </Pressable>

          {/* ── Action Buttons ── */}
          <View style={[styles.actions, { top: CARD_HEIGHT + 20 }]}>
            {/* Skip */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionBtnLg,
                {
                  backgroundColor: isDark
                    ? "rgba(38,52,30,0.75)"
                    : "rgba(255,255,255,0.75)",
                  borderColor: isDark
                    ? "rgba(160,200,100,0.14)"
                    : "rgba(0,0,0,0.08)",
                },
              ]}
              onPress={() => nextIdiom(idioms.length)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("home.skip")}
            >
              <Ionicons
                name="close-circle-outline"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Details chevron */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionBtnSm,
                {
                  borderColor: isDark
                    ? "rgba(160,200,100,0.20)"
                    : "rgba(145,71,49,0.20)",
                  opacity: 0.5,
                },
              ]}
              onPress={() => router.push(`/(main)/(tabs)/(home)/${current.id}`)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("home.idiomDetails")}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Save */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionBtnLg,
                isSaved
                  ? {
                      backgroundColor: theme.colors.primary,
                      shadowColor: theme.colors.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 12,
                      elevation: 8,
                    }
                  : {
                      backgroundColor: isDark
                        ? "rgba(38,52,30,0.75)"
                        : "rgba(255,255,255,0.75)",
                      borderColor: theme.colors.primary,
                    },
              ]}
              onPress={handleSave}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t(isSaved ? "home.saved" : "common.save")}
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={24}
                color={
                  isSaved ? theme.colors.primaryText : theme.colors.primary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recommendations ── */}
        <View style={styles.recommendations}>
          {/* Origin Stories */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push("/(main)/(tabs)/(library)")}
            accessibilityRole="button"
            accessibilityLabel={t("home.originStories")}
          >
            <View
              style={[
                styles.recCard,
                {
                  backgroundColor: isDark
                    ? "rgba(26,36,21,0.70)"
                    : "rgba(255,255,255,0.60)",
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.recIconBox,
                  { backgroundColor: theme.colors.surfaceContainerHighest },
                ]}
              >
                <Ionicons
                  name="book"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </View>
              <View style={styles.recText}>
                <Typography
                  variant="label"
                  weight="bold"
                  style={{ color: theme.colors.text }}
                >
                  {t("home.originStories")}
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: theme.colors.textMuted }}
                >
                  {t("home.originStoriesSubtitle")}
                </Typography>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.textMuted}
              />
            </View>
          </TouchableOpacity>

          {/* Quick Quiz — accent card */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push("/(main)/(tabs)/(library)")}
            accessibilityRole="button"
            accessibilityLabel={t("home.quickQuiz")}
          >
            <View
              style={[
                styles.recCard,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: "transparent",
                },
              ]}
            >
              <View
                style={[
                  styles.recIconBox,
                  { backgroundColor: "rgba(255,255,255,0.20)" },
                ]}
              >
                <Ionicons
                  name="flash"
                  size={22}
                  color={theme.colors.primaryText}
                />
              </View>
              <View style={styles.recText}>
                <Typography
                  variant="label"
                  weight="bold"
                  style={{ color: theme.colors.primaryText }}
                >
                  {t("home.quickQuiz")}
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: theme.colors.primaryText, opacity: 0.75 }}
                >
                  {t("home.quickQuizSubtitle")}
                </Typography>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.primaryText}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  blobsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  logo: {
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: theme.spacing.md,
  },
  sectionHeader: {
    alignSelf: "stretch",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginBottom: 6,
    fontSize: 10,
  },
  sectionTitle: {
    alignSelf: "stretch",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  stackWrapper: {
    position: "relative",
  },
  card: {
    position: "absolute",
    top: 0,
    left: 16,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardFront: {
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 12,
  },
  cardShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardShadowGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  chipText: {
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 10,
  },
  audioBtn: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    marginTop: theme.spacing.md,
  },
  phrase: {
    marginBottom: theme.spacing.md,
    lineHeight: 44,
  },
  definition: {
    lineHeight: 24,
  },
  cardFooter: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  progressTrack: {
    height: 2.5,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statText: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 10,
  },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "transparent",
  },
  actionBtnLg: {
    width: 50,
    height: 50,
  },
  actionBtnSm: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  recommendations: {
    width: "100%",
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  recCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  recIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recText: {
    flex: 1,
    gap: 2,
  },
}));
