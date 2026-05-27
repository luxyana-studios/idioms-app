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
import { BOTTOM_NAV_EXTRA_PADDING } from "@/shared/components/BottomNav";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { useDoubleTap } from "../hooks/useDoubleTap";
import { useFeedGesture } from "../hooks/useFeedGesture";
import { useVariantCarousel } from "../hooks/useVariantCarousel";
import { FeedCardHero } from "./FeedCardHero";
import { FeedCardTray } from "./FeedCardTray";
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
    Math.max(insets.bottom, theme.spacing.md) +
    theme.spacing.md +
    BOTTOM_NAV_EXTRA_PADDING;

  return (
    <Animated.View
      style={[
        {
          width: screenWidth,
          height: screenHeight,
          backgroundColor: theme.colors.background,
        },
        entryStyle,
      ]}
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

            <View
              style={[
                styles.topStrip,
                { paddingTop: insets.top + theme.spacing.sm },
              ]}
            >
              <FeedProgressBar current={currentIndex} total={totalCount} />
            </View>

            <FeedCardHero
              expression={currentVariant.expression}
              expressionSize={expressionSize}
              color={theme.colors.primary}
            />

            <LinearGradient
              colors={[
                theme.colors.feedCardScrimStart,
                theme.colors.feedCardScrimEnd,
              ]}
              style={styles.scrim}
              pointerEvents="none"
            />

            <FeedCardTray
              currentVariant={currentVariant}
              variants={variants}
              variantIndex={variantIndex}
              isSaved={isCurrentSaved}
              onLike={() => onLike(currentVariant.id, isCurrentSaved)}
              onExpand={() => onExpand(currentVariant.id)}
              paddingBottom={trayPaddingBottom}
            />

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
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: theme.feed.scrimHeight,
    zIndex: 1,
  },
}));
