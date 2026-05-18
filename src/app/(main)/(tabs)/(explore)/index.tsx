import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerActions } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { useUiFonts } from "@/core/theme/fonts";
import { useIdioms } from "@/features/idioms/hooks/useIdioms";
import type { IdiomTag } from "@/features/idioms/types";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { DirectionalIcon } from "@/shared/components/DirectionalIcon";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Typography } from "@/shared/components/Typography";

export default function ExploreScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const fonts = useUiFonts();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const { tag: tagParam } = useLocalSearchParams<{ tag?: string }>();
  const { data: idioms = [] } = useIdioms();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(tagParam ?? null);

  // Sync filter + clear stale search when navigating here from a tag chip
  useEffect(() => {
    setActiveTag(tagParam ?? null);
    if (tagParam) setSearch("");
  }, [tagParam]);

  const allTags = useMemo(() => {
    const tagMap = new Map<string, IdiomTag>();
    for (const idiom of idioms) {
      for (const tag of idiom.tags) {
        if (!tagMap.has(tag.key)) {
          tagMap.set(tag.key, tag);
        }
      }
    }
    return Array.from(tagMap.values());
  }, [idioms]);

  const filtered = idioms.filter((idiom) => {
    const matchesSearch =
      search === "" ||
      idiom.expression.toLowerCase().includes(search.toLowerCase()) ||
      idiom.idiomaticMeaning.toLowerCase().includes(search.toLowerCase());

    const matchesTag =
      activeTag === null || idiom.tags.some((tag) => tag.key === activeTag);

    return matchesSearch && matchesTag;
  });

  function selectTag(key: string | null) {
    setActiveTag(key);
    // Keep URL in sync so web share/refresh reflects current filter
    router.setParams({ tag: key ?? undefined });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <GlowBackground subtle />

      <ScreenHeader
        left={
          <IconButton
            icon="menu"
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            accessibilityLabel={t("common.openMenu")}
          />
        }
        center={
          <Typography
            variant="heading"
            weight="extraBold"
            style={{ color: theme.colors.primary }}
          >
            {t("explore.title")}
          </Typography>
        }
      />

      {/* Search bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.colors.glassSurface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.colors.textMuted}
        />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: theme.colors.text,
              fontFamily: fonts.family("regular"),
              fontWeight: fonts.weight("regular"),
            },
          ]}
          placeholder={t("explore.search")}
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("explore.clearSearch")}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      {/* Tag filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        <Pressable
          onPress={() => selectTag(null)}
          accessibilityRole="radio"
          accessibilityState={{ selected: activeTag === null }}
          style={[
            styles.chip,
            activeTag === null
              ? { backgroundColor: theme.colors.primary }
              : {
                  backgroundColor: theme.colors.chipBg,
                  borderColor: theme.colors.chipBorder,
                },
          ]}
        >
          <Typography
            variant="caption"
            weight="bold"
            style={{
              color:
                activeTag === null
                  ? theme.colors.primaryText
                  : theme.colors.primary,
              fontSize: 12,
            }}
          >
            {t("explore.filterAll")}
          </Typography>
        </Pressable>

        {allTags.map((tag) => {
          const isActive = tag.key === activeTag;
          return (
            <Pressable
              key={tag.key}
              onPress={() => selectTag(tag.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.chip,
                isActive
                  ? { backgroundColor: theme.colors.primary }
                  : {
                      backgroundColor: theme.colors.chipBg,
                      borderColor: theme.colors.chipBorder,
                    },
              ]}
            >
              <Typography
                variant="caption"
                weight="bold"
                style={{
                  color: isActive
                    ? theme.colors.primaryText
                    : theme.colors.primary,
                  fontSize: 12,
                }}
              >
                {tag.label}
              </Typography>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Typography variant="caption" style={{ color: theme.colors.textMuted }}>
          {t("explore.resultsCount", { count: filtered.length })}
        </Typography>
      </View>

      {/* Idiom list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 8) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="search-outline"
              size={40}
              color={theme.colors.textMuted}
            />
            <Typography
              variant="body"
              style={{ color: theme.colors.textMuted, textAlign: "center" }}
            >
              {t("explore.noResults")}
            </Typography>
          </View>
        ) : (
          filtered.map((idiom) => (
            <Pressable
              key={idiom.id}
              onPress={() => router.push(`/(main)/(tabs)/(home)/${idiom.id}`)}
              style={({ pressed }) => [
                styles.idiomCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.cardBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              {Platform.OS !== "android" ? (
                <BlurView
                  intensity={40}
                  tint={isDark ? "dark" : "light"}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
                  pointerEvents="none"
                />
              ) : null}
              <View
                style={[
                  styles.langBox,
                  { backgroundColor: theme.colors.chipBg },
                ]}
              >
                <Typography
                  variant="caption"
                  weight="extraBold"
                  style={{
                    color: theme.colors.primary,
                    fontSize: 11,
                    textTransform: "uppercase",
                  }}
                >
                  {idiom.languageCode.slice(0, 2).toUpperCase()}
                </Typography>
              </View>
              <View style={styles.idiomText}>
                <Typography
                  variant="body"
                  weight="bold"
                  style={{ color: theme.colors.text, fontSize: 15 }}
                >
                  {idiom.expression}
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: theme.colors.textSecondary, lineHeight: 18 }}
                  numberOfLines={1}
                >
                  {idiom.idiomaticMeaning}
                </Typography>
                {idiom.tags.length > 0 && (
                  <View style={styles.tagRow}>
                    {idiom.tags.map((tag) => (
                      <CategoryChip key={tag.key} label={tag.label} />
                    ))}
                  </View>
                )}
              </View>
              <DirectionalIcon
                name="chevron-forward"
                size={16}
                color={theme.colors.textMuted}
              />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  chipsScroll: {
    flexGrow: 0,
    marginBottom: theme.spacing.sm,
  },
  chipsContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "transparent",
  },
  resultsHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  idiomCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  langBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  idiomText: {
    flex: 1,
    gap: 4,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: theme.spacing.md,
  },
}));
