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
import { Button } from "@/shared/components/Button";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { Typography } from "@/shared/components/Typography";

const LANGUAGE_PILLS = ["EN", "ES", "DE", "FR", "IT", "PT"];
const TAG_PILLS = ["informal", "nature", "travel", "business"];

const PREVIEW_RESULTS = [
  { lang: "EN", expression: "Break the ice", meaning: "To relieve tension" },
  { lang: "ES", expression: "Romper el hielo", meaning: "Romper la tensión" },
];

interface Props {
  width: number;
  height: number;
  isActive: boolean;
  onNext: () => void;
}

export function ExploreSlide({ width, height, isActive, onNext }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(14);
  const exploreOpacity = useSharedValue(0);
  const exploreY = useSharedValue(18);
  const surpriseOpacity = useSharedValue(0);
  const surpriseY = useSharedValue(12);

  useEffect(() => {
    if (isActive) {
      titleOpacity.value = withDelay(60, withTiming(1, { duration: 300 }));
      titleY.value = withDelay(60, withSpring(0, { damping: 18 }));
      exploreOpacity.value = withDelay(280, withTiming(1, { duration: 360 }));
      exploreY.value = withDelay(280, withSpring(0, { damping: 16 }));
      surpriseOpacity.value = withDelay(560, withTiming(1, { duration: 340 }));
      surpriseY.value = withDelay(560, withSpring(0, { damping: 18 }));
    } else {
      titleOpacity.value = 0;
      titleY.value = 14;
      exploreOpacity.value = 0;
      exploreY.value = 18;
      surpriseOpacity.value = 0;
      surpriseY.value = 12;
    }
  }, [
    isActive,
    titleOpacity,
    titleY,
    exploreOpacity,
    exploreY,
    surpriseOpacity,
    surpriseY,
  ]);

  const titleAnim = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const exploreAnim = useAnimatedStyle(() => ({
    opacity: exploreOpacity.value,
    transform: [{ translateY: exploreY.value }],
  }));
  const surpriseAnim = useAnimatedStyle(() => ({
    opacity: surpriseOpacity.value,
    transform: [{ translateY: surpriseY.value }],
  }));

  return (
    <View style={[styles.slide, { width, height }]}>
      <View style={styles.inner}>
        {/* Title */}
        <Animated.View style={[styles.titleBlock, titleAnim]}>
          <Typography variant="heading" weight="bold" style={styles.centered}>
            {t("onboarding.exploreTitle")}
          </Typography>
          <Typography
            variant="body"
            color="textSecondary"
            style={styles.centered}
          >
            {t("onboarding.exploreSubtitle")}
          </Typography>
        </Animated.View>

        {/* Explore section mock */}
        <Animated.View style={[styles.exploreSection, exploreAnim]}>
          {/* Search bar mock */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.colors.glassSurface,
                borderColor: theme.colors.glassBtnBorder,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={16}
              color={theme.colors.textMuted}
            />
            <Typography
              variant="body"
              color="textSecondary"
              style={styles.searchHint}
            >
              {t("onboarding.exploreSearchHint")}
            </Typography>
          </View>

          {/* Language filter pills */}
          <View style={styles.pillRow}>
            {LANGUAGE_PILLS.map((lang) => (
              <View
                key={lang}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      lang === "EN"
                        ? theme.colors.primary
                        : theme.colors.chipBg,
                    borderColor:
                      lang === "EN"
                        ? theme.colors.primary
                        : theme.colors.chipBorder,
                  },
                ]}
              >
                <Typography
                  variant="caption"
                  weight="extraBold"
                  style={[
                    styles.pillLabel,
                    {
                      color:
                        lang === "EN"
                          ? theme.colors.background
                          : theme.colors.text,
                    },
                  ]}
                >
                  {lang}
                </Typography>
              </View>
            ))}
          </View>

          {/* Tag filter chips */}
          <View style={styles.pillRow}>
            {TAG_PILLS.map((tag) => (
              <CategoryChip key={tag} label={tag} />
            ))}
          </View>

          {/* Preview results */}
          <View style={styles.resultsList}>
            {PREVIEW_RESULTS.map(({ lang, expression, meaning }) => (
              <View
                key={expression}
                style={[
                  styles.resultRow,
                  {
                    backgroundColor: theme.colors.surfaceContainerLow,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.langBadge,
                    {
                      backgroundColor: theme.colors.chipBg,
                      borderColor: theme.colors.chipBorder,
                    },
                  ]}
                >
                  <Typography
                    variant="caption"
                    weight="extraBold"
                    style={{ letterSpacing: 1 }}
                  >
                    {lang}
                  </Typography>
                </View>
                <View style={styles.resultText}>
                  <Typography
                    variant="body"
                    weight="semibold"
                    numberOfLines={1}
                  >
                    {expression}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    numberOfLines={1}
                  >
                    {meaning}
                  </Typography>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textMuted}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Surprise Me section */}
        <Animated.View style={[styles.surpriseSection, surpriseAnim]}>
          <View
            style={[
              styles.surpriseDivider,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <View style={styles.surpriseRow}>
            <View
              style={[
                styles.diceCircle,
                {
                  backgroundColor: `${theme.colors.primary}18`,
                  borderColor: `${theme.colors.primary}30`,
                },
              ]}
            >
              <Ionicons
                name="dice-outline"
                size={28}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.surpriseText}>
              <Typography variant="body" weight="bold">
                {t("onboarding.surpriseMeLabel")}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t("onboarding.surpriseMeDesc")}
              </Typography>
            </View>
          </View>
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
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  centered: {
    textAlign: "center",
  },
  exploreSection: {
    width: "100%",
    gap: theme.spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
  },
  searchHint: {
    flex: 1,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  filterPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
  },
  pillLabel: {
    letterSpacing: 0.8,
  },
  resultsList: {
    gap: theme.spacing.xs,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
  },
  langBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    flexShrink: 0,
  },
  resultText: {
    flex: 1,
    gap: 1,
  },
  surpriseSection: {
    width: "100%",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  surpriseDivider: {
    height: 1,
    width: "100%",
  },
  surpriseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  diceCircle: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  surpriseText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: "100%",
  },
}));
