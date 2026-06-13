import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { IdiomInfoCard } from "@/features/idioms/components/IdiomInfoCard";
import { Button } from "@/shared/components/Button";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { Typography } from "@/shared/components/Typography";

const EQUIVALENTS = [
  { flag: "🇪🇸", expression: "Romper el hielo" },
  { flag: "🇩🇪", expression: "Das Eis brechen" },
  { flag: "🇫🇷", expression: "Briser la glace" },
] as const;

interface Props {
  width: number;
  height: number;
  isActive: boolean;
  onNext: () => void;
}

export function CardDetailSlide({ width, height, isActive, onNext }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(16);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(20);
  const equivOpacity = useSharedValue(0);
  const equivY = useSharedValue(12);

  useEffect(() => {
    if (isActive) {
      headerOpacity.value = withDelay(60, withTiming(1, { duration: 320 }));
      headerY.value = withDelay(60, withSpring(0, { damping: 18 }));
      contentOpacity.value = withDelay(280, withTiming(1, { duration: 360 }));
      contentY.value = withDelay(280, withSpring(0, { damping: 16 }));
      equivOpacity.value = withDelay(540, withTiming(1, { duration: 320 }));
      equivY.value = withDelay(540, withSpring(0, { damping: 18 }));
    } else {
      headerOpacity.value = 0;
      headerY.value = 16;
      contentOpacity.value = 0;
      contentY.value = 20;
      equivOpacity.value = 0;
      equivY.value = 12;
    }
  }, [
    isActive,
    headerOpacity,
    headerY,
    contentOpacity,
    contentY,
    equivOpacity,
    equivY,
  ]);

  const headerAnim = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));
  const contentAnim = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const equivAnim = useAnimatedStyle(() => ({
    opacity: equivOpacity.value,
    transform: [{ translateY: equivY.value }],
  }));

  return (
    <View style={[styles.slide, { width, height }]}>
      <GlowBackground subtle />
      <View style={styles.inner}>
        <Animated.View style={[styles.titleBlock, headerAnim]}>
          <Typography variant="heading" weight="bold" style={styles.centered}>
            {t("onboarding.cardDetailTitle")}
          </Typography>
        </Animated.View>

        {/* Detail view mock — mirrors the actual [id].tsx detail screen */}
        <Animated.View
          style={[
            styles.detailCard,
            contentAnim,
            {
              backgroundColor: theme.colors.surfaceContainerLow,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Expression + meaning */}
          <Typography
            variant="title"
            weight="extraBold"
            style={[styles.expression, { color: theme.colors.primary }]}
          >
            {t("onboarding.idiomExample")}
          </Typography>
          <Typography
            variant="body"
            color="textSecondary"
            style={styles.meaning}
          >
            {t("onboarding.idiomMeaning")}
          </Typography>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <CategoryChip label="EN" />
            <CategoryChip label="INFORMAL" />
          </View>

          {/* Origin section — uses real IdiomInfoCard */}
          <IdiomInfoCard label={t("onboarding.originLabel")}>
            <Typography
              variant="body"
              color="textSecondary"
              style={styles.originText}
              numberOfLines={3}
            >
              {t("onboarding.idiomOriginText")}
            </Typography>
          </IdiomInfoCard>
        </Animated.View>

        {/* Equivalents section */}
        <Animated.View style={[styles.equivSection, equivAnim]}>
          <View style={styles.equivHeader}>
            <Ionicons
              name="earth-outline"
              size={13}
              color={theme.colors.accent}
            />
            <Typography
              variant="caption"
              weight="extraBold"
              style={[styles.equivLabel, { color: theme.colors.accent }]}
            >
              {t("detail.equivalents").toUpperCase()}
            </Typography>
          </View>
          {EQUIVALENTS.map(({ flag, expression }) => (
            <View
              key={expression}
              style={[
                styles.equivCard,
                {
                  backgroundColor: theme.colors.surfaceContainerLow,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Typography variant="body" weight="bold">
                {flag}
                {"  "}
                {expression}
              </Typography>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.textSecondary}
              />
            </View>
          ))}
        </Animated.View>

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
    marginBottom: theme.spacing.md,
  },
  centered: {
    textAlign: "center",
  },
  detailCard: {
    width: "100%",
    borderRadius: theme.radius["2xl"],
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  expression: {
    letterSpacing: -0.5,
  },
  meaning: {
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  originText: {
    lineHeight: 20,
  },
  equivSection: {
    width: "100%",
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  equivHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  equivLabel: {
    letterSpacing: 1.2,
  },
  equivCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: "100%",
  },
}));
