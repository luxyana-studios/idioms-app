import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, View } from "react-native";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { LANG_KEY } from "@/features/idioms/constants";
import { Typography } from "@/shared/components/Typography";

interface LanguageCardProps {
  code: string;
  count: number;
}

export function LanguageCard({ code, count }: LanguageCardProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(main)/(tabs)/(library)/${code}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.cardBorder,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={t(LANG_KEY[code] ?? code)}
    >
      {Platform.OS !== "android" && (
        <BlurView
          intensity={40}
          tint={isDark ? "dark" : "light"}
          style={[StyleSheet.absoluteFillObject, styles.blurRadius]}
        />
      )}
      <View
        style={[styles.langCircle, { backgroundColor: theme.colors.chipBg }]}
      >
        <Typography
          variant="body"
          weight="extraBold"
          style={[styles.langCode, { color: theme.colors.primary }]}
        >
          {code.toUpperCase()}
        </Typography>
      </View>
      <View style={styles.cardText}>
        <Typography
          variant="body"
          weight="bold"
          style={{ color: theme.colors.text }}
        >
          {t(LANG_KEY[code] ?? code)}
        </Typography>
        <Typography variant="caption" style={{ color: theme.colors.textMuted }}>
          {t("byLanguage.idiomCount", { count })}
        </Typography>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
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
  langCircle: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  langCode: {
    fontSize: theme.typography.sizes.sm,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
}));
