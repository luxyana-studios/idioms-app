import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Platform, Pressable, View } from "react-native";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import type { Idiom } from "@/features/idioms/types";
import { Typography } from "@/shared/components/Typography";

interface LanguageIdiomCardProps {
  idiom: Idiom;
}

export function LanguageIdiomCard({ idiom }: LanguageIdiomCardProps) {
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(main)/(tabs)/(home)/${idiom.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.cardBorder,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={idiom.expression}
    >
      {Platform.OS !== "android" && (
        <BlurView
          intensity={40}
          tint={isDark ? "dark" : "light"}
          style={[StyleSheet.absoluteFillObject, styles.blurRadius]}
        />
      )}
      <View style={[styles.langBox, { backgroundColor: theme.colors.chipBg }]}>
        <Typography
          variant="caption"
          weight="extraBold"
          style={[styles.langCode, { color: theme.colors.primary }]}
        >
          {idiom.languageCode.slice(0, 2).toUpperCase()}
        </Typography>
      </View>
      <View style={styles.idiomText}>
        <Typography
          variant="body"
          weight="bold"
          style={{ color: theme.colors.text }}
        >
          {idiom.expression}
        </Typography>
        <Typography
          variant="caption"
          style={{ color: theme.colors.textSecondary }}
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
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  blurRadius: {
    borderRadius: theme.radius.card,
  },
  langBox: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.chip,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  langCode: {
    fontSize: theme.typography.sizes.xs,
    textTransform: "uppercase",
  },
  idiomText: {
    flex: 1,
    gap: 2,
  },
}));
