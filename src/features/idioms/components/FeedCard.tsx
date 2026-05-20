import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, useWindowDimensions, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { Idiom } from "@/features/idioms/types";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { Typography } from "@/shared/components/Typography";
import { useFeedGesture } from "../hooks/useFeedGesture";
import { FeedProgressBar } from "./FeedProgressBar";
import { TranslationOverlay } from "./TranslationOverlay";

interface FeedCardProps {
  idiom: Idiom;
  currentIndex: number;
  totalCount: number;
  isSaved: boolean;
  onSave: () => void;
  onSkip: () => void;
  onExpand: () => void;
}

export function FeedCard({
  idiom,
  currentIndex,
  totalCount,
  isSaved,
  onSave,
  onSkip,
  onExpand,
}: FeedCardProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [showTranslation, setShowTranslation] = useState(false);

  const { panGesture, animatedCardStyle, glowOpacity, isLikeDirection } =
    useFeedGesture({ onSave, onSkip });

  const entryY = useSharedValue(screenHeight * 0.06);
  useEffect(() => {
    entryY.value = withTiming(0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [entryY]);

  const entryStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: entryY.value }],
  }));

  const likeGlowStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isLikeDirection.value
      ? theme.colors.feedSwipeLikeGlow
      : theme.colors.feedSwipeSkipGlow,
    opacity: glowOpacity.value,
  }));

  const expressionSize = Math.min(screenWidth * 0.2, 72);
  const trayPaddingBottom =
    Math.max(insets.bottom, theme.spacing.md) + theme.spacing.md;

  return (
    <Animated.View
      style={[{ width: screenWidth, height: screenHeight }, entryStyle]}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ flex: 1 }, animatedCardStyle]}>
          <Pressable
            style={styles.fill}
            onPress={onExpand}
            onLongPress={() => setShowTranslation(true)}
            delayLongPress={400}
            accessibilityRole="none"
            accessibilityLabel={idiom.expression}
            accessibilityHint={t("home.holdToTranslate")}
          >
            <GlowBackground />

            {/* Swipe direction glow tint */}
            <Animated.View pointerEvents="none" style={likeGlowStyle} />

            {/* Top strip: progress bar sits between the floating header buttons */}
            <View
              style={[
                styles.topStrip,
                { paddingTop: insets.top + theme.spacing.sm },
              ]}
            >
              <FeedProgressBar current={currentIndex} total={totalCount} />
            </View>

            {/* Hero: expression text anchored to lower-third */}
            <View style={styles.heroArea}>
              <Typography
                variant="display"
                weight="extraBold"
                style={[
                  styles.expression,
                  {
                    color: theme.colors.primary,
                    fontSize: expressionSize,
                    lineHeight: expressionSize * 1.1,
                  },
                ]}
                numberOfLines={4}
              >
                {idiom.expression}
              </Typography>
            </View>

            {/* Gradient scrim: transparent → tray bg, sits behind tray */}
            <LinearGradient
              colors={[
                theme.colors.feedCardScrimStart,
                theme.colors.feedCardScrimEnd,
              ]}
              style={styles.scrim}
              pointerEvents="none"
            />

            {/* Tray: edge-to-edge, no border, floats over scrim */}
            <View
              style={[
                styles.tray,
                {
                  backgroundColor: theme.colors.feedTrayBg,
                  paddingBottom: trayPaddingBottom,
                },
              ]}
            >
              {/* Meaning */}
              <Typography
                variant="body"
                weight="medium"
                style={[styles.meaning, { color: theme.colors.textSecondary }]}
                numberOfLines={3}
              >
                {idiom.idiomaticMeaning}
              </Typography>

              {/* Language + tags row */}
              <View style={styles.tagsRow}>
                <CategoryChip label={idiom.languageCode.toUpperCase()} />
                {idiom.tags.slice(0, 2).map((tag) => (
                  <CategoryChip key={tag.key} label={tag.label} />
                ))}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <IconButton
                  icon="close"
                  onPress={onSkip}
                  variant="bare"
                  iconColor={theme.colors.textMuted}
                  iconSize={28}
                  containerSize={52}
                  borderRadius={theme.radius.full}
                  accessibilityLabel={t("home.skipIdiom")}
                />
                <IconButton
                  icon="chevron-forward"
                  onPress={onExpand}
                  variant="bare"
                  iconSize={22}
                  containerSize={48}
                  borderRadius={theme.radius.full}
                  accessibilityLabel={t("home.expandIdiom")}
                />
                <IconButton
                  icon={isSaved ? "heart" : "heart-outline"}
                  onPress={onSave}
                  variant="primary"
                  iconSize={26}
                  containerSize={60}
                  borderRadius={theme.radius.full}
                  accessibilityLabel={t(
                    isSaved ? "home.saved" : "home.saveIdiom",
                  )}
                />
              </View>
            </View>

            {/* Translation overlay */}
            {showTranslation && (
              <TranslationOverlay
                idiom={idiom}
                onDismiss={() => setShowTranslation(false)}
              />
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  fill: {
    flex: 1,
  },
  topStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    // leaves room for floating header buttons (~40px button + 24px padding each side)
    paddingHorizontal: 72,
    zIndex: 10,
  },
  heroArea: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing["2xl"],
  },
  expression: {
    letterSpacing: -2,
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
    zIndex: 1,
  },
  tray: {
    borderTopLeftRadius: theme.radius["2xl"],
    borderTopRightRadius: theme.radius["2xl"],
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
    zIndex: 2,
  },
  meaning: {
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  tagsRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.xs,
  },
}));
