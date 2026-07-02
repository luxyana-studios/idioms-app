import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { Typography } from "@/shared/components/Typography";

type AnimViewStyle = ComponentProps<typeof Animated.View>["style"];

interface Variant {
  lang: string;
  expression: string;
  meaning: string;
}

interface Props {
  current: Variant;
  variantIdx: number;
  totalVariants: number;
  contentAnim: AnimViewStyle;
}

export function MockFeedCard({
  current,
  variantIdx,
  totalVariants,
  contentAnim,
}: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={styles.cardWrap}>
      <View
        style={[styles.mockCard, { backgroundColor: theme.colors.background }]}
      >
        <GlowBackground subtle />
        <Animated.View style={[styles.heroArea, contentAnim]}>
          <Typography
            variant="display"
            weight="extraBold"
            style={[styles.expression, { color: theme.colors.primary }]}
          >
            {current.expression}
          </Typography>
        </Animated.View>
        <LinearGradient
          colors={[
            theme.colors.feedCardScrimStart,
            theme.colors.feedCardScrimEnd,
          ]}
          style={styles.scrim}
          pointerEvents="none"
        />
        <View
          style={[styles.tray, { backgroundColor: theme.colors.feedTrayBg }]}
        >
          <Animated.View style={contentAnim}>
            <Typography
              variant="body"
              weight="medium"
              style={[styles.meaning, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {current.meaning}
            </Typography>
          </Animated.View>
          <View style={styles.tagsActions}>
            <Animated.View style={[styles.tagsRow, contentAnim]}>
              <CategoryChip label={current.lang} />
              <CategoryChip label="INFORMAL" />
            </Animated.View>
            <View style={styles.actions}>
              <IconButton
                icon="chevron-forward"
                onPress={() => {}}
                variant="bare"
                iconSize={20}
                containerSize={36}
                borderRadius={theme.radius.full}
                accessibilityLabel={t("home.expandIdiom")}
              />
              <IconButton
                icon="heart-outline"
                onPress={() => {}}
                variant="primary"
                iconSize={20}
                containerSize={40}
                borderRadius={theme.radius.full}
                accessibilityLabel={t("home.saveIdiom")}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.variantDots}>
        {Array.from({ length: totalVariants }, (_, i) => i).map((i) => (
          <View
            key={`dot-${i}`}
            style={[
              styles.variantDot,
              {
                backgroundColor:
                  i === variantIdx
                    ? theme.colors.primary
                    : theme.colors.progressTrack,
                width: i === variantIdx ? 16 : 5,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  cardWrap: {
    width: "100%",
    gap: theme.spacing.sm,
  },
  mockCard: {
    width: "100%",
    borderRadius: theme.radius["2xl"],
    overflow: "hidden",
    height: 178,
  },
  heroArea: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  expression: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -1.5,
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
  },
  tray: {
    borderTopLeftRadius: theme.radius["2xl"],
    borderTopRightRadius: theme.radius["2xl"],
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
    zIndex: 2,
  },
  meaning: {
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
  variantDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  variantDot: {
    height: 5,
    borderRadius: theme.radius.full,
  },
}));
