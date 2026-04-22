import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { useIdiomsStore } from "@/features/idioms/stores/idioms.store";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { Typography } from "@/shared/components/Typography";

export default function SavedScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { idioms, savedIds, unsaveIdiom } = useIdiomsStore();

  const savedIdioms = idioms.filter((idiom) => savedIds.includes(idiom.id));

  const cardBg = isDark ? "rgba(26,36,21,0.72)" : "rgba(255,255,255,0.68)";

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <GlowBackground subtle />

      <View style={styles.header}>
        <Typography
          variant="title"
          weight="extraBold"
          style={{ color: theme.colors.text }}
        >
          {t("saved.title")}
        </Typography>
        {savedIdioms.length > 0 && (
          <Typography
            variant="caption"
            style={{ color: theme.colors.textMuted }}
          >
            {t("saved.count", { count: savedIdioms.length })}
          </Typography>
        )}
      </View>

      {savedIdioms.length === 0 ? (
        <View style={styles.empty}>
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor: isDark
                  ? "rgba(168,196,128,0.08)"
                  : "rgba(145,71,49,0.08)",
                borderColor: isDark
                  ? "rgba(168,196,128,0.14)"
                  : "rgba(145,71,49,0.14)",
              },
            ]}
          >
            <Ionicons
              name="heart-outline"
              size={32}
              color={theme.colors.primary}
            />
          </View>
          <Typography
            variant="heading"
            weight="bold"
            style={{ color: theme.colors.text }}
          >
            {t("saved.title")}
          </Typography>
          <Typography
            variant="body"
            style={{
              color: theme.colors.textSecondary,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            {t("saved.empty")}
          </Typography>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 8) + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {savedIdioms.map((idiom) => (
            <TouchableOpacity
              key={idiom.id}
              activeOpacity={0.85}
              onPress={() => router.push(`/(main)/(tabs)/(home)/${idiom.id}`)}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: cardBg,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              >
                {Platform.OS !== "android" ? (
                  <BlurView
                    intensity={50}
                    tint={isDark ? "dark" : "light"}
                    style={[
                      StyleSheet.absoluteFillObject,
                      { borderRadius: 22 },
                    ]}
                  />
                ) : null}
                {/* Top shimmer */}
                <LinearGradient
                  colors={[
                    isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.80)",
                    "transparent",
                  ]}
                  style={styles.cardShimmer}
                  pointerEvents="none"
                />

                {/* Card header: chip + unsave */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isDark
                          ? "rgba(236,190,142,0.10)"
                          : "rgba(145,71,49,0.09)",
                        borderColor: isDark
                          ? "rgba(236,190,142,0.18)"
                          : "rgba(145,71,49,0.18)",
                      },
                    ]}
                  >
                    <Typography
                      variant="caption"
                      weight="extraBold"
                      style={{
                        color: theme.colors.primary,
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                      }}
                    >
                      {idiom.tags[0] ?? idiom.languageCode}
                    </Typography>
                  </View>
                  <TouchableOpacity
                    onPress={() => unsaveIdiom(idiom.id)}
                    hitSlop={10}
                    style={styles.unsaveBtn}
                  >
                    <Ionicons
                      name="heart"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Expression */}
                <Typography
                  variant="title"
                  weight="extraBold"
                  style={[styles.expression, { color: theme.colors.primary }]}
                >
                  {idiom.expression}
                </Typography>

                {/* Meaning */}
                <Typography
                  variant="body"
                  style={[
                    styles.meaning,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {idiom.idiomaticMeaning}
                </Typography>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  unsaveBtn: {
    padding: 4,
  },
  expression: {
    fontSize: 22,

    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  meaning: {
    lineHeight: 22,
    fontSize: 14,
  },
}));
