import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { DrawerActions } from "expo-router/react-navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Pressable,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { FeedCard } from "@/features/idioms/components/FeedCard";
import { useFeedList } from "@/features/idioms/hooks/useFeedList";
import {
  useLikedIdiomIds,
  useToggleIdiomLike,
} from "@/features/idioms/hooks/useIdiomLikes";
import type { Idiom } from "@/features/idioms/types";
import { IconButton } from "@/shared/components/IconButton";
import { Typography } from "@/shared/components/Typography";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { scrollToId } = useLocalSearchParams<{ scrollToId?: string }>();

  const {
    idioms,
    isLoading,
    isError,
    refetch,
    currentIndex,
    setCurrentIndex,
    enableShuffle,
    allIdiomIds,
    currentIdiomId,
    shuffleKey,
    isShuffled,
  } = useFeedList();
  // isError intentionally not handled — likes failing silently is acceptable;
  // the feed still shows and hearts render as unsaved until the query recovers.
  const { data: likedIds } = useLikedIdiomIds();
  const likedIdsSet = likedIds ?? new Set<string>();
  const toggleIdiomLike = useToggleIdiomLike();

  // Measured height of the FlatList container — the single source of truth for
  // card height, snap interval, and getItemLayout. Using screenHeight alone can
  // be off on Android because it includes system-bar pixels the layout doesn't own.
  const [cardHeight, setCardHeight] = useState(screenHeight);

  const flatListRef = useRef<FlatList<Idiom>>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });

  useEffect(() => {
    if (shuffleKey > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [shuffleKey]);

  useEffect(() => {
    if (!scrollToId || idioms.length === 0) {
      return;
    }
    const idx = idioms.findIndex((i) => i.id === scrollToId);
    if (idx >= 0) {
      flatListRef.current?.scrollToIndex({ index: idx, animated: false });
      setCurrentIndex(idx);
    }
    // Clear the param so re-tapping the same idiom from Explore re-triggers this effect.
    router.setParams({ scrollToId: undefined });
  }, [scrollToId, idioms, setCurrentIndex, router]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [setCurrentIndex],
  );

  const handleLike = useCallback(
    (idiomId: string, isLiked: boolean) => {
      if (!toggleIdiomLike.isPending) {
        toggleIdiomLike.mutate({ idiomId, isLiked });
      }
    },
    [toggleIdiomLike],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Idiom> | null | undefined, index: number) => ({
      length: cardHeight,
      offset: cardHeight * index,
      index,
    }),
    [cardHeight],
  );

  const renderItem = useCallback<ListRenderItem<Idiom>>(
    ({ item, index }) => (
      <FeedCard
        idiom={item}
        currentIndex={index}
        totalCount={idioms.length}
        likedIds={likedIdsSet}
        onLike={handleLike}
        onExpand={(idiomId) => router.push(`/(main)/(tabs)/(home)/${idiomId}`)}
        cardHeight={cardHeight}
      />
    ),
    [idioms.length, likedIdsSet, handleLike, router, cardHeight],
  );

  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.root, styles.centered]}>
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

  if (idioms.length === 0) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Typography variant="body" style={{ color: theme.colors.textMuted }}>
          {t("home.emptyFeed")}
        </Typography>
      </View>
    );
  }

  return (
    <View
      style={styles.root}
      onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
    >
      <FlatList
        ref={flatListRef}
        data={idioms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        snapToInterval={cardHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={getItemLayout}
        initialScrollIndex={currentIndex > 0 ? currentIndex : undefined}
        windowSize={3}
      />

      {/* Floating header — touch passes through to FlatList except on buttons */}
      <View
        style={[styles.floatingHeader, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      >
        <IconButton
          icon="menu"
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          accessibilityLabel={t("common.openMenu")}
        />
        <IconButton
          icon={isShuffled ? "dice" : "dice-outline"}
          onPress={() => enableShuffle(allIdiomIds, currentIdiomId)}
          accessibilityLabel={t("home.shuffle")}
          iconColor={isShuffled ? theme.colors.primary : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    overflow: "hidden" as const,
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
