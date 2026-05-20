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
import type { Idiom } from "@/features/idioms/types";
import { IconButton } from "@/shared/components/IconButton";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { scrollTo } = useLocalSearchParams<{ scrollTo?: string }>();

  const {
    idioms,
    isLoading,
    currentIndex,
    savedIds,
    saveIdiom,
    unsaveIdiom,
    deferIdiom,
    setCurrentIndex,
  } = useFeedList();

  const flatListRef = useRef<FlatList<Idiom>>(null);
  const lastScrollTo = useRef<string | null>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });

  useEffect(() => {
    if (!scrollTo || idioms.length === 0 || scrollTo === lastScrollTo.current) {
      return;
    }
    lastScrollTo.current = scrollTo;
    const idx = parseInt(scrollTo, 10);
    if (!Number.isNaN(idx) && idx >= 0 && idx < idioms.length) {
      flatListRef.current?.scrollToIndex({ index: idx, animated: false });
      setCurrentIndex(idx);
    }
  }, [scrollTo, idioms.length, setCurrentIndex]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [setCurrentIndex],
  );

  const handleSkip = useCallback(
    (idiomId: string) => {
      deferIdiom(idiomId);
    },
    [deferIdiom],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Idiom> | null | undefined, index: number) => ({
      length: screenHeight,
      offset: screenHeight * index,
      index,
    }),
    [screenHeight],
  );

  if (isLoading || idioms.length === 0) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
            isSaved={savedIds.includes(item.id)}
            onSave={() => {
              if (savedIds.includes(item.id)) {
                unsaveIdiom(item.id);
              } else {
                saveIdiom(item.id);
              }
            }}
            onSkip={() => handleSkip(item.id)}
            onExpand={() => router.push(`/(main)/(tabs)/(home)/${item.id}`)}
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
