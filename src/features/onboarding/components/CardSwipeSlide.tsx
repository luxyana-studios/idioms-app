import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";
import { MockFeedCard } from "./MockFeedCard";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

// Same idiom expressed in 4 languages — demonstrates the core swipe feature
const VARIANTS = [
  {
    lang: "EN",
    expression: "Break the ice",
    meaning: "To relieve tension or awkwardness",
  },
  {
    lang: "ES",
    expression: "Romper el hielo",
    meaning: "Aliviar la tensión social",
  },
  {
    lang: "DE",
    expression: "Das Eis brechen",
    meaning: "Eisige Stimmung auflösen",
  },
  {
    lang: "FR",
    expression: "Briser la glace",
    meaning: "Détendre l'atmosphère",
  },
] as const;

const GESTURES: {
  icon: IoniconsName;
  labelKey: string;
  descKey: string;
  usePrimary: boolean;
}[] = [
  {
    icon: "reader-outline",
    labelKey: "onboarding.tapExpandLabel",
    descKey: "onboarding.tapExpandDesc",
    usePrimary: false,
  },
  {
    icon: "heart-outline",
    labelKey: "onboarding.doubleTapLabel",
    descKey: "onboarding.doubleTapDesc",
    usePrimary: true,
  },
  {
    icon: "hand-left-outline",
    labelKey: "onboarding.holdLabel",
    descKey: "onboarding.holdDesc",
    usePrimary: false,
  },
];

interface Props {
  width: number;
  height: number;
  isActive: boolean;
  onNext: () => void;
}

export function CardSwipeSlide({ width, height, isActive, onNext }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [variantIdx, setVariantIdx] = useState(0);

  // Content cycling animation (fade + subtle slide)
  const contentFade = useSharedValue(1);
  const contentX = useSharedValue(0);

  useEffect(() => {
    if (!isActive) {
      contentFade.value = 1;
      contentX.value = 0;
      setVariantIdx(0);
    }
  }, [isActive, contentFade, contentX]);

  const nextVariant = useCallback(() => {
    setVariantIdx((i) => (i + 1) % VARIANTS.length);
  }, []);

  // Auto-cycle through language variants every 2.8s to demonstrate the swipe feature
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      contentX.value = withTiming(-36, { duration: 230 });
      contentFade.value = withTiming(0, { duration: 210 }, () => {
        runOnJS(nextVariant)();
        contentX.value = 36;
        contentX.value = withSpring(0, { damping: 16, stiffness: 110 });
        contentFade.value = withTiming(1, { duration: 270 });
      });
    }, 2800);
    return () => clearInterval(id);
  }, [isActive, contentX, contentFade, nextVariant]);

  const contentAnim = useAnimatedStyle(() => ({
    opacity: contentFade.value,
    transform: [{ translateX: contentX.value }],
  }));

  const current = VARIANTS[variantIdx];

  return (
    <View style={[styles.slide, { width, height }]}>
      <View style={styles.inner}>
        <View style={styles.titleBlock}>
          <Typography variant="heading" weight="bold" style={styles.centered}>
            {t("onboarding.cardFeedTitle")}
          </Typography>
          <Typography
            variant="body"
            color="textSecondary"
            style={styles.centered}
          >
            {t("onboarding.cardFeedSubtitle")}
          </Typography>
        </View>

        <MockFeedCard
          current={current}
          variantIdx={variantIdx}
          totalVariants={VARIANTS.length}
          contentAnim={contentAnim}
        />

        {/* Gesture guide — 3 real interactions */}
        <View style={styles.gestureList}>
          {GESTURES.map(({ icon, labelKey, descKey, usePrimary }) => (
            <View key={labelKey} style={styles.gestureRow}>
              <View
                style={[
                  styles.iconPill,
                  {
                    backgroundColor: usePrimary
                      ? `${theme.colors.primary}18`
                      : `${theme.colors.accent}18`,
                    borderColor: usePrimary
                      ? `${theme.colors.primary}30`
                      : `${theme.colors.accent}30`,
                  },
                ]}
              >
                <Ionicons
                  name={icon}
                  size={18}
                  color={
                    usePrimary ? theme.colors.primary : theme.colors.accent
                  }
                />
              </View>
              <View style={styles.gestureText}>
                <Typography variant="body" weight="semibold">
                  {t(labelKey)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t(descKey)}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        <Button
          title={t("onboarding.next")}
          onPress={onNext}
          style={styles.cta}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  slide: {
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    alignItems: "center",
  },
  titleBlock: {
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  centered: {
    textAlign: "center",
  },
  gestureList: {
    width: "100%",
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  gestureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  gestureText: {
    flex: 1,
    gap: 1,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: "100%",
  },
}));
