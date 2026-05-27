import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerActions } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { ExploreFilterControls } from "@/features/idioms/components/ExploreFilterControls";
import { useIdioms } from "@/features/idioms/hooks/useIdioms";
import { useExploreFiltersStore } from "@/features/idioms/stores/exploreFilters.store";
import type { IdiomTag } from "@/features/idioms/types";
import { useUserLanguages } from "@/features/languages/hooks/useUserLanguages";
import { BOTTOM_NAV_EXTRA_PADDING } from "@/shared/components/BottomNav";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { DirectionalIcon } from "@/shared/components/DirectionalIcon";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Typography } from "@/shared/components/Typography";

export default function ExploreScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const { tag: tagParam } = useLocalSearchParams<{ tag?: string }>();
  const { data: idioms = [], isLoading, isError, refetch } = useIdioms();
  const { languages } = useUserLanguages();
  const selectedLanguageCodes = useExploreFiltersStore(
    (s) => s.selectedLanguageCodes,
  );
  const selectedTagKeys = useExploreFiltersStore((s) => s.selectedTagKeys);
  const toggleLanguage = useExploreFiltersStore((s) => s.toggleLanguage);
  const toggleTag = useExploreFiltersStore((s) => s.toggleTag);
  const setTags = useExploreFiltersStore((s) => s.setTags);
  const clearLanguages = useExploreFiltersStore((s) => s.clearLanguages);
  const clearTags = useExploreFiltersStore((s) => s.clearTags);
  const [search, setSearch] = useState("");
  const languageCodes = useMemo(
    () => languages.map((language) => language.languageCode),
    [languages],
  );
  const activeLanguageCodes = selectedLanguageCodes.filter((code) =>
    languageCodes.includes(code),
  );

  // Sync filter + clear stale search when navigating here from a tag chip
  useEffect(() => {
    if (!tagParam) return;
    setTags([tagParam]);
    setSearch("");
  }, [tagParam, setTags]);

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
    const normalizedSearch = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      idiom.expression.toLowerCase().includes(normalizedSearch) ||
      idiom.idiomaticMeaning.toLowerCase().includes(normalizedSearch);

    const matchesTag =
      selectedTagKeys.length === 0 ||
      idiom.tags.some((tag) => selectedTagKeys.includes(tag.key));

    const matchesLanguage =
      activeLanguageCodes.length === 0 ||
      activeLanguageCodes.includes(idiom.languageCode);

    return matchesSearch && matchesTag && matchesLanguage;
  });

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

      <ExploreFilterControls
        search={search}
        onSearchChange={setSearch}
        languages={languages}
        selectedLanguageCodes={activeLanguageCodes}
        selectedTagKeys={selectedTagKeys}
        tags={allTags}
        onToggleLanguage={toggleLanguage}
        onToggleTag={toggleTag}
        onClearLanguages={clearLanguages}
        onClearTags={clearTags}
      />

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <Pressable
          style={styles.stateContainer}
          onPress={() => refetch()}
          accessibilityRole="button"
          accessibilityLabel={t("home.feedError")}
        >
          <Typography
            variant="body"
            color="error"
            style={{ textAlign: "center" }}
          >
            {t("home.feedError")}
          </Typography>
        </Pressable>
      ) : (
        <>
          {/* Results count */}
          <View style={styles.resultsHeader}>
            <Typography
              variant="caption"
              style={{ color: theme.colors.textMuted }}
            >
              {t("explore.resultsCount", { count: filtered.length })}
            </Typography>
          </View>

          {/* Idiom list */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingBottom:
                  Math.max(insets.bottom, 8) + 24 + BOTTOM_NAV_EXTRA_PADDING,
              },
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
                  onPress={() => {
                    router.push(`/(main)/(tabs)/(home)?scrollToId=${idiom.id}`);
                  }}
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
                      style={[
                        StyleSheet.absoluteFillObject,
                        { borderRadius: 20 },
                      ]}
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
                      style={{
                        color: theme.colors.textSecondary,
                        lineHeight: 18,
                      }}
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
}));
