import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useIdiomTranslations } from "@/features/idioms/hooks/useIdiomTranslations";
import type { Idiom } from "@/features/idioms/types";
import { GlassView } from "@/shared/components/GlassView";
import { Typography } from "@/shared/components/Typography";

interface TranslationOverlayProps {
  idiom: Idiom;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 4000;

export function TranslationOverlay({
  idiom,
  onDismiss,
}: TranslationOverlayProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { data: translations = [], isLoading } = useIdiomTranslations(idiom.id);

  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [opacity, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const firstTranslation = translations[0];

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, styles.backdrop, animatedStyle]}
    >
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onDismiss} />
      <GlassView
        style={[
          styles.card,
          { backgroundColor: theme.colors.translationOverlayBg },
        ]}
        border={false}
      >
        <Typography
          variant="caption"
          weight="extraBold"
          style={[
            styles.sectionLabel,
            { color: theme.colors.translationOverlayText },
          ]}
        >
          {t("home.translation").toUpperCase()}
        </Typography>

        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : firstTranslation ? (
          <View style={styles.content}>
            <View style={styles.row}>
              <Typography
                variant="caption"
                weight="semibold"
                style={[
                  styles.rowLabel,
                  { color: theme.colors.translationOverlayText, opacity: 0.6 },
                ]}
              >
                {t("detail.translationLiteral").toUpperCase()}
              </Typography>
              <Typography
                variant="body"
                weight="medium"
                style={{ color: theme.colors.translationOverlayText }}
              >
                {firstTranslation.literalTranslation}
              </Typography>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Typography
                variant="caption"
                weight="semibold"
                style={[
                  styles.rowLabel,
                  { color: theme.colors.translationOverlayText, opacity: 0.6 },
                ]}
              >
                {t("detail.translationMeaning").toUpperCase()}
              </Typography>
              <Typography
                variant="body"
                style={{ color: theme.colors.translationOverlayText }}
              >
                {firstTranslation.idiomaticMeaning}
              </Typography>
            </View>
          </View>
        ) : (
          <Typography
            variant="body"
            style={{ color: theme.colors.translationOverlayText, opacity: 0.6 }}
          >
            {t("home.noTranslation")}
          </Typography>
        )}
      </GlassView>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    width: "100%",
    borderRadius: theme.radius["2xl"],
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionLabel: {
    letterSpacing: 2,
    fontSize: 10,
    opacity: 0.7,
  },
  content: {
    gap: theme.spacing.md,
  },
  row: {
    gap: theme.spacing.xs,
  },
  rowLabel: {
    letterSpacing: 1.5,
    fontSize: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
}));
