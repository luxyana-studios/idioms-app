import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import type { Idiom } from "@/features/idioms/types";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { Typography } from "@/shared/components/Typography";
import { CardActionRow } from "./CardActionRow";

interface IdiomCardStackProps {
  idiom: Idiom;
  progress: number;
  currentIndex: number;
  totalCount: number;
  isSaved: boolean;
  onPress: () => void;
  onSkip: () => void;
  onDetails: () => void;
  onSave: () => void;
}

export function IdiomCardStack({
  idiom,
  progress,
  currentIndex,
  totalCount,
  isSaved,
  onPress,
  onSkip,
  onDetails,
  onSave,
}: IdiomCardStackProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const { width: screenWidth } = useWindowDimensions();

  const CARD_WIDTH = Math.min(screenWidth - theme.spacing.lg * 2, 340);
  const CARD_HEIGHT = Math.round(CARD_WIDTH * (4 / 3));

  return (
    <View
      style={{
        width: CARD_WIDTH + 32,
        height: CARD_HEIGHT + 96,
        position: "relative",
      }}
    >
      {/* Back card 2 */}
      <View
        style={[
          styles.card,
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            backgroundColor: theme.colors.stackCardFarBg,
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
            backgroundColor: theme.colors.stackCardMidBg,
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

      {/* Front card */}
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
        onPress={onPress}
      >
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
              { backgroundColor: theme.colors.glassSurface },
            ]}
          />
        )}

        <LinearGradient
          colors={[theme.colors.cardShimmer, "transparent"]}
          style={styles.cardShimmer}
          pointerEvents="none"
        />
        {isDark && (
          <LinearGradient
            colors={[`${theme.colors.primary}18`, "transparent"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        )}
        <LinearGradient
          colors={["transparent", theme.colors.cardShadowOverlay]}
          style={styles.cardShadowGradient}
          pointerEvents="none"
        />

        {/* Category chip + audio */}
        <View style={styles.cardTop}>
          <CategoryChip label={idiom.tags[0]?.label ?? idiom.languageCode} />
          <TouchableOpacity
            style={styles.audioBtn}
            hitSlop={8}
            disabled
            accessibilityLabel={t("home.playPronunciation")}
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
            {idiom.expression}
          </Typography>
          <Typography
            variant="body"
            style={[styles.definition, { color: theme.colors.textSecondary }]}
          >
            {idiom.idiomaticMeaning}
          </Typography>
        </View>

        {/* Progress */}
        <View style={styles.cardFooter}>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: theme.colors.progressTrack },
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
              {idiom.languageCode.toUpperCase()}
            </Typography>
            <Typography
              variant="caption"
              style={[styles.statText, { color: theme.colors.textMuted }]}
            >
              {currentIndex + 1} / {totalCount}
            </Typography>
          </View>
        </View>
      </Pressable>

      {/* Action buttons */}
      <View style={[styles.actions, { top: CARD_HEIGHT + 20 }]}>
        <CardActionRow
          isSaved={isSaved}
          onSkip={onSkip}
          onDetails={onDetails}
          onSave={onSave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
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
  audioBtn: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: theme.colors.glassBtn,
    borderColor: theme.colors.glassBtnBorder,
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
  },
}));
