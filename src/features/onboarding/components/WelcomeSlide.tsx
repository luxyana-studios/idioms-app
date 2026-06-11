import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Typography } from "@/shared/components/Typography";

const FEATURES = [
  { icon: "earth-outline", key: "onboarding.pillLanguages" },
  { icon: "chatbubble-ellipses-outline", key: "onboarding.pillContexts" },
  { icon: "sunny-outline", key: "onboarding.pillDaily" },
] as const;

interface Props {
  width: number;
  height: number;
  onNext: () => void;
}

export function WelcomeSlide({ width, height, onNext }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={[styles.slide, { width, height }]}>
      <View style={styles.inner}>
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoRing,
              { backgroundColor: `${theme.colors.primary}12` },
            ]}
          />
          <View
            style={[
              styles.logoBox,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
              },
            ]}
          >
            <Ionicons name="book" size={44} color={theme.colors.primaryText} />
          </View>
        </View>

        <View style={styles.titles}>
          <Typography
            variant="display"
            weight="bold"
            style={[styles.appName, { color: theme.colors.text }]}
          >
            IdiomDeck
          </Typography>
          <Typography
            variant="body"
            color="textSecondary"
            style={styles.tagline}
          >
            {t("onboarding.welcomeTagline")}
          </Typography>
        </View>

        <View style={styles.features}>
          {FEATURES.map(({ icon, key }) => (
            <View
              key={key}
              style={[
                styles.featureTile,
                {
                  backgroundColor: theme.colors.chipBg,
                  borderColor: theme.colors.chipBorder,
                },
              ]}
            >
              <Ionicons name={icon} size={22} color={theme.colors.primary} />
              <Typography
                variant="caption"
                weight="semibold"
                color="primary"
                style={styles.featureLabel}
              >
                {t(key)}
              </Typography>
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <Pressable
            onPress={onNext}
            accessibilityRole="button"
            accessibilityLabel={t("onboarding.getStarted")}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
              },
              pressed && styles.ctaPressed,
            ]}
          >
            <Typography
              variant="label"
              weight="bold"
              style={{ color: theme.colors.primaryText, letterSpacing: 0.5 }}
            >
              {t("onboarding.getStarted")}
            </Typography>
          </Pressable>
          <Typography
            variant="caption"
            color="textSecondary"
            style={styles.footerNote}
          >
            {t("onboarding.welcomeNote")}
          </Typography>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  slide: {
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing["2xl"],
    paddingBottom: theme.spacing.lg,
    alignItems: "center",
  },
  logoContainer: {
    width: 144,
    height: 144,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  logoRing: {
    position: "absolute",
    width: 144,
    height: 144,
    borderRadius: 72,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: theme.radius["3xl"],
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 16,
  },
  titles: {
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  appName: {
    textAlign: "center",
    letterSpacing: -1,
  },
  tagline: {
    textAlign: "center",
    paddingHorizontal: theme.spacing.xl,
    lineHeight: 24,
  },
  features: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    width: "100%",
  },
  featureTile: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
  },
  featureLabel: {
    textAlign: "center",
    lineHeight: 16,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    width: "100%",
    gap: theme.spacing.md,
    alignItems: "center",
  },
  cta: {
    width: "100%",
    height: 56,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  ctaPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  footerNote: {
    textAlign: "center",
  },
}));
