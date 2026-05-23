import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
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

  const { idioms, isLoading, currentIndex, setCurrentIndex } = useFeedList();
  // isError intentionally not handled — likes failing silently is acceptable;
  // the feed still shows and hearts render as unsaved until the query recovers.
  const { data: likedIds } = useLikedIdiomIds();
  const likedIdsSet = likedIds ?? new Set<string>();
  const toggleIdiomLike = useToggleIdiomLike();

  const flatListRef = useRef<FlatList<Idiom>>(null);
  const lastScrollTo = useRef<string | null>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });

  useEffect(() => {
    if (
      !scrollToId ||
      idioms.length === 0 ||
      scrollToId === lastScrollTo.current
    ) {
      return;
    }
    lastScrollTo.current = scrollToId;
    const idx = idioms.findIndex((i) => i.id === scrollToId);
    if (idx >= 0) {
      flatListRef.current?.scrollToIndex({ index: idx, animated: false });
      setCurrentIndex(idx);
    }
  }, [scrollToId, idioms, setCurrentIndex]);

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
      toggleIdiomLike.mutate({ idiomId, isLiked });
    },
    [toggleIdiomLike],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Idiom> | null | undefined, index: number) => ({
      length: screenHeight,
      offset: screenHeight * index,
      index,
    }),
    [screenHeight],
  );

  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
    <View style={styles.root}>
      <FlatList
        ref={flatListRef}
        data={idioms}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FeedCard
            idiom={item}
            currentIndex={index}
            totalCount={idioms.length}
            likedIds={likedIdsSet}
            onLike={handleLike}
            onExpand={(idiomId) =>
              router.push(`/(main)/(tabs)/(home)/${idiomId}`)
            }
          />
        )}
        pagingEnabled
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={getItemLayout}
        initialScrollIndex={currentIndex > 0 ? currentIndex : undefined}
        removeClippedSubviews
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
          icon="search"
          onPress={() => router.push("/(main)/(tabs)/(explore)")}
          accessibilityLabel={t("explore.title")}
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    zIndex: 20,
  },
}));
