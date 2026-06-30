import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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

  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = isActive ? withTiming(1, { duration: 350 }) : 0;
  }, [isActive, opacity]);

  const fadeAnim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[styles.slide, { width, height }]}>
      <GlowBackground subtle />
      <Animated.View style={[styles.inner, fadeAnim]}>
        <View style={styles.titleBlock}>
          <Typography variant="heading" weight="bold" style={styles.centered}>
            {t("onboarding.cardDetailTitle")}
          </Typography>
        </View>

        {/* Detail view mock — mirrors the actual [id].tsx detail screen */}
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: theme.colors.surfaceContainerLow,
              borderColor: theme.colors.border,
            },
          ]}
        >
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

          <View style={styles.tagsRow}>
            <CategoryChip label="EN" />
            <CategoryChip label="INFORMAL" />
          </View>

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
        </View>

        {/* Equivalents section */}
        <View style={styles.equivSection}>
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
        </View>

        <View style={styles.spacer} />

        <Button
          title={t("onboarding.next")}
          onPress={onNext}
          style={styles.cta}
        />
      </Animated.View>
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
