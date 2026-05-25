import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { Variant } from "@/features/idioms/hooks/useVariantCarousel";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { IconButton } from "@/shared/components/IconButton";
import { Typography } from "@/shared/components/Typography";

interface FeedCardTrayProps {
  currentVariant: Variant;
  variants: Variant[];
  variantIndex: number;
  isSaved: boolean;
  onLike: () => void;
  onExpand: () => void;
  paddingBottom: number;
}

export function FeedCardTray({
  currentVariant,
  variants,
  variantIndex,
  isSaved,
  onLike,
  onExpand,
  paddingBottom,
}: FeedCardTrayProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        styles.tray,
        { backgroundColor: theme.colors.feedTrayBg, paddingBottom },
      ]}
    >
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

      <View style={styles.tagsActions}>
        <View style={styles.tagsRow}>
          <CategoryChip label={currentVariant.languageCode.toUpperCase()} />
          {currentVariant.tags.slice(0, 2).map((tag) => (
            <CategoryChip key={tag.key} label={tag.label} />
          ))}
        </View>
        <View style={styles.actions}>
          <IconButton
            icon="chevron-forward"
            onPress={onExpand}
            variant="bare"
            iconSize={22}
            containerSize={44}
            borderRadius={theme.radius.full}
            accessibilityLabel={t("home.expandIdiom")}
          />
          <IconButton
            icon={isSaved ? "heart" : "heart-outline"}
            onPress={onLike}
            variant="primary"
            iconSize={26}
            containerSize={52}
            borderRadius={theme.radius.full}
            accessibilityLabel={t(
              isSaved ? "home.unsaveIdiom" : "home.saveIdiom",
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
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
