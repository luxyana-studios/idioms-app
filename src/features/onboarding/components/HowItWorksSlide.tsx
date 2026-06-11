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
import { GlassView } from "@/shared/components/GlassView";
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
  const cardY = useSharedValue(28);
  const equivOpacity = useSharedValue(0);
  const equivY = useSharedValue(12);
  const originOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      cardOpacity.value = withDelay(80, withTiming(1, { duration: 380 }));
      cardY.value = withDelay(
        80,
        withSpring(0, { damping: 16, stiffness: 120 }),
      );
      equivOpacity.value = withDelay(420, withTiming(1, { duration: 320 }));
      equivY.value = withDelay(420, withSpring(0, { damping: 18 }));
      originOpacity.value = withDelay(660, withTiming(1, { duration: 320 }));
    } else {
      cardOpacity.value = 0;
      cardY.value = 28;
      equivOpacity.value = 0;
      equivY.value = 12;
      originOpacity.value = 0;
    }
  }, [isActive, cardOpacity, cardY, equivOpacity, equivY, originOpacity]);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));
  const equivAnim = useAnimatedStyle(() => ({
    opacity: equivOpacity.value,
    transform: [{ translateY: equivY.value }],
  }));
  const originAnim = useAnimatedStyle(() => ({ opacity: originOpacity.value }));

  return (
    <View style={[styles.slide, { width, height }]}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Typography variant="title" weight="bold" style={styles.centered}>
            {t("onboarding.howItWorksTitle")}
          </Typography>
          <Typography
            variant="body"
            color="textSecondary"
            style={styles.centered}
          >
            {t("onboarding.howItWorksSubtitle")}
          </Typography>
        </View>

        <Animated.View style={[styles.cardWrap, cardAnim]}>
          <GlassView
            style={[styles.card, { borderRadius: theme.radius["2xl"] }]}
          >
            {/* Lang badge + expression */}
            <View style={styles.langRow}>
              <View
                style={[
                  styles.langBadge,
                  {
                    backgroundColor: theme.colors.chipBg,
                    borderColor: theme.colors.chipBorder,
                  },
                ]}
              >
                <Typography variant="caption" weight="semibold">
                  🇬🇧 English
                </Typography>
              </View>
            </View>

            <Typography variant="title" weight="bold" style={styles.phrase}>
              {t("onboarding.idiomExample")}
            </Typography>

            <View style={styles.meaningRow}>
              <Ionicons
                name="book-outline"
                size={13}
                color={theme.colors.primary}
              />
              <Typography
                variant="body"
                color="textSecondary"
                style={styles.meaningText}
              >
                {t("onboarding.idiomMeaning")}
              </Typography>
            </View>

            {/* Equivalents in other languages */}
            <Animated.View
              style={[
                styles.section,
                { borderTopColor: theme.colors.outlineVariant },
                equivAnim,
              ]}
            >
              <View style={styles.sectionRow}>
                <Ionicons
                  name="earth-outline"
                  size={13}
                  color={theme.colors.accent}
                />
                <Typography
                  variant="caption"
                  weight="semibold"
                  style={{ color: theme.colors.accent }}
                >
                  {t("detail.equivalents")}
                </Typography>
              </View>
              <View style={styles.equivChips}>
                {EQUIVALENTS.map(({ flag, expression }) => (
                  <View
                    key={expression}
                    style={[
                      styles.equivChip,
                      {
                        backgroundColor: theme.colors.chipBg,
                        borderColor: theme.colors.chipBorder,
                      },
                    ]}
                  >
                    <Typography variant="caption" weight="semibold">
                      {flag} {expression}
                    </Typography>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Origin snippet */}
            <Animated.View
              style={[
                styles.section,
                { borderTopColor: theme.colors.outlineVariant },
                originAnim,
              ]}
            >
              <View style={styles.sectionRow}>
                <Ionicons
                  name="layers-outline"
                  size={13}
                  color={theme.colors.primary}
                />
                <Typography
                  variant="caption"
                  weight="semibold"
                  color="primary"
                  style={styles.sectionTitle}
                >
                  {t("detail.originLabel")}
                </Typography>
              </View>
              <Typography
                variant="body"
                color="textSecondary"
                style={styles.originText}
                numberOfLines={2}
              >
                {t("onboarding.idiomOriginText")}
              </Typography>
            </Animated.View>
          </GlassView>
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
  cardWrap: {
    width: "100%",
  },
  card: {
    width: "100%",
    padding: theme.spacing.lg,
    overflow: "hidden",
    gap: theme.spacing.xs,
  },
  langRow: {
    marginBottom: theme.spacing.xs,
  },
  langBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
  },
  phrase: {
    marginBottom: theme.spacing.xs,
  },
  meaningRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  meaningText: {
    flex: 1,
    lineHeight: 22,
  },
  section: {
    borderTopWidth: 1,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sectionTitle: {
    letterSpacing: 0.8,
  },
  equivChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  equivChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
  },
  originText: {
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: "100%",
  },
}));
