import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useIdiomsStore } from "@/features/idioms/stores/idioms.store";
import { Typography } from "@/shared/components/Typography";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { idioms, currentIndex, savedIds, saveIdiom, unsaveIdiom, nextIdiom } =
    useIdiomsStore();

  // Card dimensions: fill screen minus horizontal padding, cap at 340
  const CARD_WIDTH = Math.min(screenWidth - theme.spacing.lg * 2, 340);
  const CARD_HEIGHT = Math.round(CARD_WIDTH * (4 / 3));

  const current = idioms[currentIndex];
  const isSaved = savedIds.includes(current.id);
  const progress = (currentIndex + 1) / idioms.length;

  const handleSave = () => {
    if (isSaved) {
      unsaveIdiom(current.id);
    } else {
      saveIdiom(current.id);
    }
    nextIdiom();
  };

  const handleSkip = () => {
    nextIdiom();
  };

  const openDetail = () => {
    router.push(`/(main)/(tabs)/(home)/${current.id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="menu" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Typography
          variant="heading"
          weight="extraBold"
          style={styles.headerTitle}
        >
          IdiomDeck
        </Typography>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="search" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Typography
            variant="caption"
            weight="extraBold"
            style={styles.sectionLabel}
          >
            {t("home.dailySelection")}
          </Typography>
          <Typography
            variant="title"
            weight="extraBold"
            style={styles.sectionTitle}
          >
            {t("home.expandLexicon")}
          </Typography>
        </View>

        {/* Card Stack */}
        <View
          style={[
            styles.stackWrapper,
            { width: CARD_WIDTH + 32, height: CARD_HEIGHT + 72 },
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
                transform: [
                  { translateX: 16 },
                  { translateY: 16 },
                  { rotate: "2deg" },
                ],
                opacity: 0.4,
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
                transform: [
                  { translateX: 8 },
                  { translateY: 8 },
                  { rotate: "1deg" },
                ],
                opacity: 0.7,
              },
            ]}
          />

          {/* Front card */}
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
            onPress={openDetail}
          >
            {/* Ambient glow */}
            <View style={styles.cardGlow} pointerEvents="none" />

            {/* Top row: category chip + audio button */}
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.chip,
                  { backgroundColor: theme.colors.surfaceContainerHighest },
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
                  { backgroundColor: theme.colors.surfaceContainerHighest },
                ]}
                hitSlop={8}
              >
                <Ionicons
                  name="volume-medium"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Idiom phrase + definition */}
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
                  { backgroundColor: theme.colors.surfaceContainerLowest },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.colors.secondary,
                      width: `${progress * 100}%`,
                    },
                  ]}
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

          {/* Skip / Save hints */}
          <View style={[styles.hints, { top: CARD_HEIGHT + 12 }]}>
            <TouchableOpacity style={styles.hintBtn} onPress={handleSkip}>
              <Ionicons
                name="close"
                size={24}
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
            <TouchableOpacity style={styles.hintBtn} onPress={handleSave}>
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={24}
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

        {/* Secondary recommendations */}
        <View style={styles.recommendations}>
          {/* Origin Stories */}
          <TouchableOpacity
            style={[
              styles.recCard,
              { backgroundColor: theme.colors.surfaceContainerLow },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.recIconBox,
                { backgroundColor: theme.colors.surfaceContainerHigh },
              ]}
            >
              <Ionicons
                name="book"
                size={24}
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
          </TouchableOpacity>

          {/* Quick Quiz */}
          <TouchableOpacity
            style={[
              styles.recCard,
              styles.recCardAccent,
              {
                backgroundColor: `${theme.colors.primary}14`,
                borderColor: `${theme.colors.primary}20`,
              },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.recIconRound,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons
                name="flash"
                size={20}
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
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionLabel: {
    color: theme.colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  // Stack wrapper: sized dynamically in JSX via inline style
  stackWrapper: {
    position: "relative",
  },
  // Card base: positioned absolute, sized dynamically
  card: {
    position: "absolute",
    top: 0,
    left: 16,
    borderRadius: theme.radius["2xl"],
  },
  cardFront: {
    padding: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 10,
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: `${theme.colors.primary}18`,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  chipText: {
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 10,
  },
  audioBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    marginTop: theme.spacing.md,
  },
  phrase: {
    marginBottom: theme.spacing.md,
  },
  definition: {
    lineHeight: 24,
  },
  cardFooter: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  progressTrack: {
    height: 4,
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
  hints: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 48,
    opacity: 0.75,
  },
  hintBtn: {
    alignItems: "center",
    gap: 4,
  },
  hintLabel: {
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 10,
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
    borderRadius: theme.radius.xl,
  },
  recCardAccent: {
    borderWidth: 1,
  },
  recIconBox: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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
