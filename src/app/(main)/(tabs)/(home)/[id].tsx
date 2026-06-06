import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { EquivalentsSection } from "@/features/idioms/components/EquivalentsSection";
import { IdiomInfoCard } from "@/features/idioms/components/IdiomInfoCard";
import { TranslationSection } from "@/features/idioms/components/TranslationSection";
import {
  useLikedIdiomIds,
  useToggleIdiomLike,
} from "@/features/idioms/hooks/useIdiomLikes";
import { useIdioms } from "@/features/idioms/hooks/useIdioms";
import type { IdiomTag } from "@/features/idioms/types";
import { BOTTOM_NAV_EXTRA_PADDING } from "@/shared/components/BottomNav";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Typography } from "@/shared/components/Typography";

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: idioms = [], isLoading, isError, refetch } = useIdioms();
  const { data: likedIds } = useLikedIdiomIds();
  const toggleIdiomLike = useToggleIdiomLike();

  const idiom = idioms.find((i) => i.id === id);
  const isLiked = !!idiom && (likedIds?.has(idiom.id) ?? false);
  const isLikePending =
    !!idiom &&
    toggleIdiomLike.isPending &&
    toggleIdiomLike.variables?.idiomId === idiom.id;

  // The whole detail view (idiom + its translations/equivalents) is gated on the
  // single useIdioms feed query, so surface its loading/error states before the
  // not-found fallback — otherwise a cold deep-link flashes "not found" mid-fetch.
  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => refetch()}
          accessibilityRole="button"
          accessibilityLabel={t("home.feedError")}
        >
          <Typography variant="body" style={{ color: theme.colors.textMuted }}>
            {t("home.feedError")}
          </Typography>
        </Pressable>
      </View>
    );
  }

  if (!idiom) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.notFound}>
          <Typography
            variant="heading"
            weight="bold"
            style={{ color: theme.colors.text }}
          >
            {t("detail.notFound")}
          </Typography>
          <Typography variant="body" style={{ color: theme.colors.textMuted }}>
            {t("detail.notFoundSubtitle")}
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <GlowBackground subtle />
      <ScreenHeader
        left={
          <IconButton
            icon="chevron-back"
            directional
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(main)/(tabs)/(home)")
            }
            accessibilityLabel={t("common.goBack")}
          />
        }
        center={<CategoryChip label={idiom.languageCode.toUpperCase()} />}
        right={
          <IconButton
            icon={isLiked ? "heart" : "heart-outline"}
            onPress={() => {
              if (isLikePending) return;
              toggleIdiomLike.mutate({ idiomId: idiom.id, isLiked });
            }}
            variant={isLiked ? "primary" : "glass"}
            accessibilityLabel={t(isLiked ? "common.unlike" : "common.like")}
          />
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Math.max(insets.bottom, 8) + 24 + BOTTOM_NAV_EXTRA_PADDING,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Typography
          variant="display"
          weight="extraBold"
          style={[styles.expression, { color: theme.colors.primary }]}
        >
          {idiom.expression}
        </Typography>

        <Typography
          variant="heading"
          weight="semibold"
          style={[styles.meaning, { color: theme.colors.textSecondary }]}
        >
          "{idiom.idiomaticMeaning}"
        </Typography>

        <Typography variant="caption" style={{ color: theme.colors.textMuted }}>
          {t("likes.count", { count: idiom.likesCount })}
        </Typography>

        {idiom.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {idiom.tags.map((tag: IdiomTag) => (
              <CategoryChip
                key={tag.key}
                label={tag.label}
                onPress={() =>
                  router.push(
                    `/(main)/(tabs)/(explore)?tag=${encodeURIComponent(tag.key)}`,
                  )
                }
              />
            ))}
          </View>
        )}

        {idiom.explanation && (
          <IdiomInfoCard label={t("detail.originLabel")}>
            <Typography
              variant="body"
              style={{ color: theme.colors.text, lineHeight: 26 }}
            >
              {idiom.explanation}
            </Typography>
          </IdiomInfoCard>
        )}

        {idiom.examples && idiom.examples.length > 0 && (
          <IdiomInfoCard label={t("detail.exampleLabel")}>
            {idiom.examples.map((example) => (
              <Typography
                key={example}
                variant="body"
                style={{
                  color: theme.colors.textSecondary,
                  lineHeight: 26,
                  fontStyle: "italic",
                }}
              >
                {example}
              </Typography>
            ))}
          </IdiomInfoCard>
        )}

        <TranslationSection
          idiomId={idiom.id}
          translations={idiom.translations}
        />
        <EquivalentsSection equivalents={idiom.equivalents} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  expression: {
    fontSize: theme.typography.sizes["5xl"],
    lineHeight: 46,
    letterSpacing: -1.2,
  },
  meaning: {
    fontSize: theme.typography.sizes.lg,
    lineHeight: 28,
    fontStyle: "italic",
    marginBottom: theme.spacing.sm,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
}));
