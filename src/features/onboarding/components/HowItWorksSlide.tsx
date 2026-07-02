import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
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
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
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

export function HowItWorksSlide({ width, height, isActive, onNext }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(24);
  const equivOpacity = useSharedValue(0);
  const equivY = useSharedValue(14);

  useEffect(() => {
    if (isActive) {
      cardOpacity.value = withDelay(80, withTiming(1, { duration: 400 }));
      cardY.value = withDelay(
        80,
        withSpring(0, { damping: 16, stiffness: 120 }),
      );
      equivOpacity.value = withDelay(480, withTiming(1, { duration: 360 }));
      equivY.value = withDelay(480, withSpring(0, { damping: 18 }));
    } else {
      cardOpacity.value = 0;
      cardY.value = 24;
      equivOpacity.value = 0;
      equivY.value = 14;
    }
  }, [isActive, cardOpacity, cardY, equivOpacity, equivY]);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));
  const equivAnim = useAnimatedStyle(() => ({
    opacity: equivOpacity.value,
    transform: [{ translateY: equivY.value }],
  }));

  return (
    <View style={[styles.slide, { width, height }]}>
      <View style={styles.inner}>
        <View style={styles.titleBlock}>
          <Typography variant="heading" weight="bold" style={styles.centered}>
            {t("onboarding.howItWorksTitle")}
          </Typography>
        </View>

        {/* Mock FeedCard — replicates FeedCardHero + FeedCardTray */}
        <Animated.View style={[styles.cardWrap, cardAnim]}>
          <View
            style={[
              styles.mockCard,
              { backgroundColor: theme.colors.background },
            ]}
          >
            {/* Ambient glow — same as real feed */}
            <GlowBackground subtle />

            {/* Hero area — expression large + primary, matches FeedCardHero */}
            <View style={styles.heroArea}>
              <Typography
                variant="display"
                weight="extraBold"
                style={[styles.expression, { color: theme.colors.primary }]}
              >
                {t("onboarding.idiomExample")}
              </Typography>
            </View>

            {/* Gradient scrim — identical to real FeedCard */}
            <LinearGradient
              colors={[
                theme.colors.feedCardScrimStart,
                theme.colors.feedCardScrimEnd,
              ]}
              style={styles.scrim}
              pointerEvents="none"
            />

            {/* Tray — matches FeedCardTray layout exactly */}
            <View
              style={[
                styles.tray,
                { backgroundColor: theme.colors.feedTrayBg },
              ]}
            >
              <Typography
                variant="body"
                weight="medium"
                style={[styles.meaning, { color: theme.colors.textSecondary }]}
                numberOfLines={2}
              >
                {t("onboarding.idiomMeaning")}
              </Typography>
              <View style={styles.tagsActions}>
                <View style={styles.tagsRow}>
                  <CategoryChip label="EN" />
                  <CategoryChip label="INFORMAL" />
                </View>
                <View style={styles.actions}>
                  <IconButton
                    icon="chevron-forward"
                    onPress={() => {}}
                    variant="bare"
                    iconSize={20}
                    containerSize={40}
                    borderRadius={theme.radius.full}
                    accessibilityLabel={t("home.expandIdiom")}
                  />
                  <IconButton
                    icon="heart-outline"
                    onPress={() => {}}
                    variant="primary"
                    iconSize={22}
                    containerSize={44}
                    borderRadius={theme.radius.full}
                    accessibilityLabel={t("home.saveIdiom")}
                  />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Equivalents — matches EquivalentsSection style */}
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
  cardWrap: {
    width: "100%",
  },
  mockCard: {
    width: "100%",
    borderRadius: theme.radius["2xl"],
    overflow: "hidden",
    height: 218,
  },
  heroArea: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  expression: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1.5,
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  tray: {
    borderTopLeftRadius: theme.radius["2xl"],
    borderTopRightRadius: theme.radius["2xl"],
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    zIndex: 2,
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
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
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
