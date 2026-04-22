import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import type { ComponentProps } from "react";
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

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface Topic {
  icon: IoniconsName;
  labelKey: string;
  subtitleKey: string;
  accent: boolean;
}

const TOPICS: Topic[] = [
  {
    icon: "book",
    labelKey: "library.originStories",
    subtitleKey: "library.originStoriesSubtitle",
    accent: false,
  },
  {
    icon: "flash",
    labelKey: "library.quickQuiz",
    subtitleKey: "library.quickQuizSubtitle",
    accent: true,
  },
  {
    icon: "albums-outline",
    labelKey: "library.byLanguage",
    subtitleKey: "library.byLanguageSubtitle",
    accent: false,
  },
  {
    icon: "search-outline",
    labelKey: "library.slangModern",
    subtitleKey: "library.slangModernSubtitle",
    accent: false,
  },
];

export default function LibraryScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const insets = useSafeAreaInsets();
  const { idioms } = useIdiomsStore();

  const cardBg = isDark ? "rgba(26,36,21,0.70)" : "rgba(255,255,255,0.65)";

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
          {t("library.title")}
        </Typography>
        <Typography variant="caption" style={{ color: theme.colors.textMuted }}>
          {t("library.totalCount", { count: idioms.length })}
        </Typography>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 8) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {TOPICS.map((topic) => (
          <TouchableOpacity
            key={topic.labelKey}
            activeOpacity={0.8}
            disabled
            accessibilityRole="button"
            accessibilityLabel={t(topic.labelKey)}
            accessibilityState={{ disabled: true }}
          >
            {topic.accent ? (
              /* Accent card — solid primary */
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.primary,
                    borderColor: "transparent",
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.35,
                    shadowRadius: 20,
                    elevation: 10,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: "rgba(255,255,255,0.20)" },
                  ]}
                >
                  <Ionicons
                    name={topic.icon}
                    size={24}
                    color={theme.colors.primaryText}
                  />
                </View>
                <View style={styles.cardText}>
                  <Typography
                    variant="label"
                    weight="bold"
                    style={{ color: theme.colors.primaryText, fontSize: 15 }}
                  >
                    {t(topic.labelKey)}
                  </Typography>
                  <Typography
                    variant="caption"
                    style={{ color: theme.colors.primaryText, opacity: 0.75 }}
                  >
                    {t(topic.subtitleKey)}
                  </Typography>
                </View>
                <View style={styles.trailInfo}>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.primaryText}
                  />
                </View>
              </View>
            ) : (
              /* Regular glass card */
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
                    intensity={40}
                    tint={isDark ? "dark" : "light"}
                    style={[
                      StyleSheet.absoluteFillObject,
                      { borderRadius: 20 },
                    ]}
                  />
                ) : null}
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: theme.colors.surfaceContainerHighest },
                  ]}
                >
                  <Ionicons
                    name={topic.icon}
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.cardText}>
                  <Typography
                    variant="label"
                    weight="bold"
                    style={{ color: theme.colors.text, fontSize: 15 }}
                  >
                    {t(topic.labelKey)}
                  </Typography>
                  <Typography
                    variant="caption"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {t(topic.subtitleKey)}
                  </Typography>
                </View>
                <View style={styles.trailInfo}>
                  <Typography
                    variant="caption"
                    weight="bold"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {idioms.length}
                  </Typography>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.textMuted}
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
    paddingBottom: theme.spacing.lg,
    gap: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  trailInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
}));
