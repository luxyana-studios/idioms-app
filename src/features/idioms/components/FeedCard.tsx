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
import { useDoubleTap } from "../hooks/useDoubleTap";
import { useFeedGesture } from "../hooks/useFeedGesture";
import { useVariantCarousel } from "../hooks/useVariantCarousel";
import { FeedProgressBar } from "./FeedProgressBar";
import { TranslationOverlay } from "./TranslationOverlay";

interface FeedCardProps {
  idiom: Idiom;
  currentIndex: number;
  totalCount: number;
  likedIds: Set<string>;
  onLike: (idiomId: string, isLiked: boolean) => void;
  onExpand: (idiomId: string) => void;
}

export function FeedCard({
  idiom,
  currentIndex,
  totalCount,
  likedIds,
  onLike,
  onExpand,
}: FeedCardProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [showTranslation, setShowTranslation] = useState(false);

  const { variants, variantIndex, currentVariant, handleNext, handlePrev } =
    useVariantCarousel(idiom);
  const isCurrentSaved = likedIds.has(currentVariant.id);

  const { panGesture, animatedCardStyle, glowOpacity, isLikeDirection } =
    useFeedGesture({ onNext: handleNext, onPrev: handlePrev });

  const handleTap = useDoubleTap(
    () => onExpand(currentVariant.id),
    () => onLike(currentVariant.id, isCurrentSaved),
  );

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

  const expressionSize = Math.min(
    screenWidth * 0.2,
    theme.feed.headerSlotWidth,
  );
  const trayPaddingBottom =
    Math.max(insets.bottom, theme.spacing.md) + theme.spacing.md;

  return (
    <Animated.View
      style={[{ width: screenWidth, height: screenHeight }, entryStyle]}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ flex: 1 }, animatedCardStyle]}>
          <View style={styles.fill}>
            <GlowBackground />

            <Animated.View pointerEvents="none" style={likeGlowStyle} />

            {/* Tap overlay — below tray (zIndex 0) to avoid nested <button> on web */}
            <Pressable
              style={styles.tapOverlay}
              onPress={handleTap}
              onLongPress={() => setShowTranslation(true)}
              delayLongPress={400}
              accessibilityRole="button"
              accessibilityLabel={currentVariant.expression}
              accessibilityHint={t("home.holdToTranslate")}
            />

            {/* Progress bar — sits between the two floating header buttons */}
            <View
              style={[
                styles.topStrip,
                { paddingTop: insets.top + theme.spacing.sm },
              ]}
            >
              <FeedProgressBar current={currentIndex} total={totalCount} />
            </View>

            {/* Expression */}
            <View style={styles.heroArea} pointerEvents="none">
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
                {currentVariant.expression}
              </Typography>
            </View>

            <LinearGradient
              colors={[
                theme.colors.feedCardScrimStart,
                theme.colors.feedCardScrimEnd,
              ]}
              style={styles.scrim}
              pointerEvents="none"
            />

            <View
              style={[
                styles.tray,
                {
                  backgroundColor: theme.colors.feedTrayBg,
                  paddingBottom: trayPaddingBottom,
                },
              ]}
            >
              {/* Language variant dots — visible only when equivalents are loaded */}
              {variants.length > 1 && (
                <View style={styles.variantDots}>
                  {variants.map((variant, i) => (
                    <View
                      key={variant.id}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            i === variantIndex
                              ? theme.colors.feedProgressLineActive
                              : theme.colors.feedProgressLine,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}

              <Typography
                variant="body"
                weight="medium"
                style={[styles.meaning, { color: theme.colors.textSecondary }]}
                numberOfLines={3}
              >
                {currentVariant.idiomaticMeaning}
              </Typography>

              {/* Chips left, action buttons right */}
              <View style={styles.tagsActions}>
                <View style={styles.tagsRow}>
                  <CategoryChip
                    label={currentVariant.languageCode.toUpperCase()}
                  />
                  {currentVariant.tags.slice(0, 2).map((tag) => (
                    <CategoryChip key={tag.key} label={tag.label} />
                  ))}
                </View>
                <View style={styles.actions}>
                  <IconButton
                    icon="chevron-forward"
                    onPress={() => onExpand(currentVariant.id)}
                    variant="bare"
                    iconSize={22}
                    containerSize={44}
                    borderRadius={theme.radius.full}
                    accessibilityLabel={t("home.expandIdiom")}
                  />
                  <IconButton
                    icon={isCurrentSaved ? "heart" : "heart-outline"}
                    onPress={() => onLike(currentVariant.id, isCurrentSaved)}
                    variant="primary"
                    iconSize={26}
                    containerSize={52}
                    borderRadius={theme.radius.full}
                    accessibilityLabel={t(
                      isCurrentSaved ? "home.unsaveIdiom" : "home.saveIdiom",
                    )}
                  />
                </View>
              </View>
            </View>

            {showTranslation && (
              <TranslationOverlay
                idiom={idiom}
                onDismiss={() => setShowTranslation(false)}
              />
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  fill: {
    flex: 1,
  },
  tapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  topStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.feed.headerSlotWidth,
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
    height: theme.feed.scrimHeight,
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
  variantDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  dot: {
    width: theme.feed.dotSize,
    height: theme.feed.dotSize,
    borderRadius: theme.radius.full,
  },
  meaning: {
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  tagsActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  tagsRow: {
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
}));
