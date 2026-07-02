import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

const STATS: {
  valueKey: string;
  labelKey: string;
  icon: IoniconsName;
}[] = [
  {
    valueKey: "onboarding.stat1Value",
    labelKey: "onboarding.stat1Label",
    icon: "earth",
  },
  {
    valueKey: "onboarding.stat2Value",
    labelKey: "onboarding.stat2Label",
    icon: "library",
  },
  {
    valueKey: "onboarding.stat3Value",
    labelKey: "onboarding.stat3Label",
    icon: "sunny",
  },
];

const BENEFITS: { icon: IoniconsName; key: string }[] = [
  { icon: "hand-left-outline", key: "onboarding.benefit1" },
  { icon: "search-outline", key: "onboarding.benefit2" },
  { icon: "bookmark-outline", key: "onboarding.benefit3" },
  { icon: "earth-outline", key: "onboarding.benefit4" },
];

interface Props {
  width: number;
  height: number;
  isActive: boolean;
  onNext: () => void;
}

export function StatsSlide({ width, height, isActive, onNext }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  const stat0 = useSharedValue(0);
  const stat1 = useSharedValue(0);
  const stat2 = useSharedValue(0);
  const benefitsOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      stat0.value = withDelay(80, withTiming(1, { duration: 340 }));
      stat1.value = withDelay(200, withTiming(1, { duration: 340 }));
      stat2.value = withDelay(320, withTiming(1, { duration: 340 }));
      benefitsOpacity.value = withDelay(500, withTiming(1, { duration: 380 }));
    } else {
      stat0.value = 0;
      stat1.value = 0;
      stat2.value = 0;
      benefitsOpacity.value = 0;
    }
  }, [isActive, stat0, stat1, stat2, benefitsOpacity]);

  const stat0Anim = useAnimatedStyle(() => ({
    opacity: stat0.value,
    transform: [{ translateY: (1 - stat0.value) * 16 }],
  }));
  const stat1Anim = useAnimatedStyle(() => ({
    opacity: stat1.value,
    transform: [{ translateY: (1 - stat1.value) * 16 }],
  }));
  const stat2Anim = useAnimatedStyle(() => ({
    opacity: stat2.value,
    transform: [{ translateY: (1 - stat2.value) * 16 }],
  }));
  const statAnims = [stat0Anim, stat1Anim, stat2Anim];

  const benefitsAnim = useAnimatedStyle(() => ({
    opacity: benefitsOpacity.value,
    transform: [{ translateY: (1 - benefitsOpacity.value) * 12 }],
  }));

  return (
    <View style={[styles.slide, { width, height }]}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Typography variant="title" weight="bold" style={styles.centered}>
            {t("onboarding.statsTitle")}
          </Typography>
          <Typography
            variant="body"
            color="textSecondary"
            style={styles.centered}
          >
            {t("onboarding.statsSubtitle")}
          </Typography>
        </View>

        <View style={styles.statsRow}>
          {STATS.map(({ valueKey, labelKey, icon }, i) => (
            <Animated.View
              key={valueKey}
              style={[
                styles.statBlock,
                {
                  backgroundColor: theme.colors.chipBg,
                  borderColor: theme.colors.chipBorder,
                },
                statAnims[i],
              ]}
            >
              <Ionicons name={icon} size={24} color={theme.colors.primary} />
              <Typography
                variant="title"
                weight="bold"
                style={styles.statValue}
              >
                {t(valueKey)}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                style={styles.statLabel}
              >
                {t(labelKey)}
              </Typography>
            </Animated.View>
          ))}
        </View>

        <Animated.View style={[styles.benefits, benefitsAnim]}>
          {BENEFITS.map(({ icon, key }) => (
            <View key={key} style={styles.benefitRow}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: theme.colors.chipBg },
                ]}
              >
                <Ionicons name={icon} size={16} color={theme.colors.primary} />
              </View>
              <Typography variant="body" style={styles.benefitText}>
                {t(key)}
              </Typography>
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
    paddingTop: theme.spacing["2xl"],
    paddingBottom: theme.spacing.lg,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  centered: {
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    width: "100%",
    marginBottom: theme.spacing.xl,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
  },
  statValue: {
    letterSpacing: -0.5,
    textAlign: "center",
  },
  statLabel: {
    textAlign: "center",
  },
  benefits: {
    width: "100%",
    gap: theme.spacing.md,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  benefitText: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: "100%",
  },
}));
