import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { FeedCard } from "@/features/idioms/components/FeedCard";
import {
  useLikedIdiomIds,
  useToggleIdiomLike,
} from "@/features/idioms/hooks/useIdiomLikes";
import { useSurpriseIdiom } from "@/features/idioms/hooks/useSurpriseIdiom";
import { IconButton } from "@/shared/components/IconButton";
import { Typography } from "@/shared/components/Typography";

export default function SurpriseScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { idiom, isLoading, isError, rollAgain } = useSurpriseIdiom();
  const { data: likedIds } = useLikedIdiomIds();
  const likedIdsSet = likedIds ?? new Set<string>();
  const toggleIdiomLike = useToggleIdiomLike();

  const handleLike = useCallback(
    (idiomId: string, isLiked: boolean) => {
      toggleIdiomLike.mutate({ idiomId, isLiked });
    },
    [toggleIdiomLike],
  );

  if (isLoading || (!idiom && !isError)) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError && !idiom) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Typography variant="body" style={{ color: theme.colors.textMuted }}>
          {t("home.feedError")}
        </Typography>
      </View>
    );
  }

  if (!idiom) return null;

  return (
    <View style={styles.root}>
      <FeedCard
        idiom={idiom}
        currentIndex={0}
        totalCount={1}
        likedIds={likedIdsSet}
        onLike={handleLike}
        onExpand={(idiomId) => router.push(`/(main)/(tabs)/(home)/${idiomId}`)}
      />

      <View
        style={[styles.floatingHeader, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      >
        <IconButton
          icon="arrow-back"
          onPress={() => router.back()}
          accessibilityLabel={t("common.goBack")}
          directional
        />
        <IconButton
          icon="dice-outline"
          onPress={rollAgain}
          accessibilityLabel={t("home.rollAgain")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    zIndex: 20,
  },
}));
