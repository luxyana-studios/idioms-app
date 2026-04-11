import Ionicons from "@expo/vector-icons/Ionicons";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, FeGaussianBlur, Filter } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useIdiomsStore } from "@/features/idioms/stores/idioms.store";
import { GlassView } from "@/shared/components/GlassView";
import { Typography } from "@/shared/components/Typography";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const navigation =
    useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollPaddingBottom =
    60 + Math.max(insets.bottom, 8) + theme.spacing.xl;
  const { idioms, currentIndex, savedIds, saveIdiom, unsaveIdiom, nextIdiom } =
    useIdiomsStore();

  const CARD_WIDTH = Math.min(screenWidth - theme.spacing.lg * 2, 340);
  const CARD_HEIGHT = Math.round(CARD_WIDTH * (4 / 3));

  const current = idioms[currentIndex];
  const isSaved = savedIds.includes(current.id);
  const progress = (currentIndex + 1) / idioms.length;

  const handleSave = () => {
    if (isSaved) unsaveIdiom(current.id);
    else saveIdiom(current.id);
    nextIdiom();
  };

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
              <FeGaussianBlur stdDeviation="45" />
            </Filter>
            <Filter
              id="blurHomeBottom"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <FeGaussianBlur stdDeviation="40" />
            </Filter>
          </Defs>
          <Circle
            cx={screenWidth}
            cy={0}
            r={130}
            fill={`${theme.colors.primary}55`}
            filter="url(#blurHomeTop)"
          />
          <Circle
            cx={0}
            cy={screenHeight}
            r={120}
            fill={`${theme.colors.secondary}48`}
            filter="url(#blurHomeBottom)"
          />
        </Svg>
      </View>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.openDrawer()}
          hitSlop={10}
        >
          <Ionicons name="menu" size={22} color={theme.colors.primary} />
        </TouchableOpacity>

        <Typography
          variant="heading"
          weight="extraBold"
          style={[styles.logo, { color: theme.colors.primary }]}
        >
          IdiomDeck
        </Typography>

        <TouchableOpacity style={styles.headerBtn} hitSlop={10}>
          <GlassView intensity={30} style={styles.searchBtn}>
            <Ionicons name="search" size={18} color={theme.colors.primary} />
          </GlassView>
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
            style={[styles.sectionLabel, { color: theme.colors.secondary }]}
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
            { width: CARD_WIDTH + 32, height: CARD_HEIGHT + 80 },
          ]}
        >
          {/* Back card 2 */}
          <View
            style={[
              styles.card,
              {
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                backgroundColor: theme.colors.surfaceContainerLow,
                borderColor: "rgba(255,255,255,0.04)",
                transform: [
                  { translateX: 16 },
                  { translateY: 16 },
                  { rotate: "2deg" },
                ],
                opacity: 0.45,
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
                backgroundColor: theme.colors.surfaceContainer,
                borderColor: "rgba(255,255,255,0.06)",
                transform: [
                  { translateX: 8 },
                  { translateY: 8 },
                  { rotate: "1deg" },
                ],
                opacity: 0.7,
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
                backgroundColor: theme.colors.surfaceContainerHigh,
              },
            ]}
            onPress={() => router.push(`/(main)/(tabs)/(home)/${current.id}`)}
          >
            {/* Top-edge light shimmer */}
            <LinearGradient
              colors={["rgba(255,255,255,0.06)", "transparent"]}
              style={styles.cardShimmer}
              pointerEvents="none"
            />
            {/* Warm glow blob */}
            <View style={styles.cardGlow} pointerEvents="none" />

            {/* Category chip + audio */}
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.chip,
                  { backgroundColor: "rgba(255,255,255,0.07)" },
                ]}
              >
                <Typography
                  variant="caption"
                  weight="extraBold"
                  style={[
                    styles.chipText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {current.category}
                </Typography>
              </View>
              <TouchableOpacity
                style={[
                  styles.audioBtn,
                  { backgroundColor: "rgba(255,255,255,0.07)" },
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
                {current.phrase}
              </Typography>
              <Typography
                variant="body"
                style={[
                  styles.definition,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {current.definition}
              </Typography>
            </View>

            {/* Progress + stats */}
            <View style={styles.cardFooter}>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: "rgba(255,255,255,0.06)" },
                ]}
              >
                <LinearGradient
                  colors={[theme.colors.secondary, theme.colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
              <View style={styles.stats}>
                <Typography
                  variant="caption"
                  weight="extraBold"
                  style={[styles.statText, { color: theme.colors.outline }]}
                >
                  {t("home.usersLearned", { count: current.usersLearned })}
                </Typography>
                <Typography
                  variant="caption"
                  weight="extraBold"
                  style={[styles.statText, { color: theme.colors.outline }]}
                >
                  {current.level}
                </Typography>
              </View>
            </View>
          </Pressable>

          {/* ── Skip / Save hints ── */}
          <View style={[styles.hints, { top: CARD_HEIGHT + 16 }]}>
            <TouchableOpacity
              style={styles.hintBtn}
              onPress={nextIdiom}
              hitSlop={12}
            >
              <Ionicons
                name="close-circle-outline"
                size={26}
                color={theme.colors.textSecondary}
              />
              <Typography
                variant="caption"
                weight="extraBold"
                style={[
                  styles.hintLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t("home.skip")}
              </Typography>
            </TouchableOpacity>

            <View style={styles.hintDivider} />

            <TouchableOpacity
              style={styles.hintBtn}
              onPress={handleSave}
              hitSlop={12}
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={26}
                color={theme.colors.primary}
              />
              <Typography
                variant="caption"
                weight="extraBold"
                style={[styles.hintLabel, { color: theme.colors.primary }]}
              >
                {t("home.saved")}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recommendations ── */}
        <View style={styles.recommendations}>
          {/* Origin Stories */}
          <TouchableOpacity activeOpacity={0.75}>
            <View
              style={[
                styles.recCard,
                { backgroundColor: theme.colors.surfaceContainerLow },
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
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t("home.originStoriesSubtitle")}
                </Typography>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.outline}
              />
            </View>
          </TouchableOpacity>

          {/* Quick Quiz — gradient accent */}
          <TouchableOpacity activeOpacity={0.75}>
            <View style={styles.recCardQuiz}>
              <LinearGradient
                colors={[
                  `${theme.colors.primary}22`,
                  `${theme.colors.primaryContainer}15`,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    borderRadius: theme.radius.xl,
                    borderWidth: 1,
                    borderColor: `${theme.colors.primary}25`,
                  },
                ]}
              />
              <View
                style={[
                  styles.recIconRound,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons
                  name="flash"
                  size={18}
                  color={theme.colors.primaryText}
                />
              </View>
              <View style={styles.recText}>
                <Typography
                  variant="label"
                  weight="bold"
                  style={{ color: theme.colors.primary }}
                >
                  {t("home.quickQuiz")}
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: theme.colors.onPrimaryContainer }}
                >
                  {t("home.quickQuizSubtitle")}
                </Typography>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.primary}
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
  // Ambient blobs
  blobsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  // Header
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
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    letterSpacing: -0.5,
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: theme.spacing.md,
  },
  // Section header
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
    textAlign: "center",
    letterSpacing: -0.5,
  },
  // Card stack
  stackWrapper: {
    position: "relative",
  },
  card: {
    position: "absolute",
    top: 0,
    left: 16,
    borderRadius: theme.radius["2xl"],
    borderWidth: 1,
  },
  cardFront: {
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 12,
    overflow: "hidden",
    borderColor: "rgba(255,255,255,0.09)",
  },
  cardShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: theme.radius["2xl"],
    borderTopRightRadius: theme.radius["2xl"],
  },
  cardGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${theme.colors.primary}15`,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    borderColor: "rgba(255,255,255,0.08)",
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
    height: 3,
    borderRadius: theme.radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radius.full,
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
  // Hints — floating icons below the card
  hints: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing["2xl"],
    opacity: 0.6,
  },
  hintBtn: {
    alignItems: "center",
    gap: 6,
  },
  hintDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  hintLabel: {
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 9,
  },
  // Recommendations
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
    borderRadius: theme.radius.xl,
    overflow: "hidden",
  },
  recCardQuiz: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    overflow: "hidden",
  },
  recIconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  recIconRound: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recText: {
    flex: 1,
    gap: 2,
  },
}));
