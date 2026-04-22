import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { useIdiomsStore } from "@/features/idioms/stores/idioms.store";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { Typography } from "@/shared/components/Typography";

const CATEGORIES = ["All", "English", "French", "German", "Slang"];

const CATEGORY_LANG_CODES: Record<string, string[]> = {
  English: ["en"],
  French: ["fr"],
  German: ["de"],
  Spanish: ["es"],
};

export default function ExploreScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { idioms } = useIdiomsStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = idioms.filter((idiom) => {
    const matchesSearch =
      search === "" ||
      idiom.expression.toLowerCase().includes(search.toLowerCase()) ||
      idiom.idiomaticMeaning.toLowerCase().includes(search.toLowerCase());

    const langCodes = CATEGORY_LANG_CODES[activeCategory];
    const matchesCategory =
      activeCategory === "All" ||
      (langCodes
        ? langCodes.includes(idiom.languageCode)
        : idiom.tags.some(
            (tag) => tag.toLowerCase() === activeCategory.toLowerCase(),
          ));

    return matchesSearch && matchesCategory;
  });

  const searchBg = isDark ? "rgba(30,40,24,0.65)" : "rgba(255,255,255,0.70)";
  const searchBorder = isDark
    ? "rgba(168,196,128,0.22)"
    : "rgba(145,71,49,0.20)";
  const cardBg = isDark ? "rgba(26,36,21,0.70)" : "rgba(255,255,255,0.65)";

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <GlowBackground subtle />

      {/* Header */}
      <View style={styles.header}>
        <Typography
          variant="title"
          weight="extraBold"
          style={{ color: theme.colors.text }}
        >
          {t("explore.title")}
        </Typography>
      </View>

      {/* Search bar */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: searchBg, borderColor: searchBorder },
        ]}
      >
        {Platform.OS !== "android" ? (
          <BlurView
            intensity={40}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.colors.textMuted}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t("explore.search")}
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.chip,
                isActive
                  ? { backgroundColor: theme.colors.primary }
                  : {
                      backgroundColor: isDark
                        ? "rgba(168,196,128,0.10)"
                        : "rgba(145,71,49,0.08)",
                      borderColor: isDark
                        ? "rgba(168,196,128,0.20)"
                        : "rgba(145,71,49,0.18)",
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
                {cat}
              </Typography>
            </TouchableOpacity>
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
          { paddingBottom: Math.max(insets.bottom, 8) + 80 },
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
                  backgroundColor: cardBg,
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
                />
              ) : null}
              <View
                style={[
                  styles.langBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(168,196,128,0.12)"
                      : "rgba(145,71,49,0.10)",
                  },
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
              </View>
              <Ionicons
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
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
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
    fontFamily: "Manrope_400Regular",
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
    gap: 3,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: theme.spacing.md,
  },
}));
