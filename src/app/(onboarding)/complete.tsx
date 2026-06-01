import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { defaultEffectiveLanguage } from "@/features/languages/constants";
import { useAddUserLanguage } from "@/features/languages/hooks/useUserLanguageMutations";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding.store";
import { Button } from "@/shared/components/Button";
import { GlassView } from "@/shared/components/GlassView";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

export default function CompleteScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const { selectedLanguageCodes, complete } = useOnboardingStore();
  const { mutateAsync: addLanguage } = useAddUserLanguage();
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    setSaving(true);
    try {
      await Promise.allSettled(
        selectedLanguageCodes.map((code, index) =>
          addLanguage(defaultEffectiveLanguage(code, index)),
        ),
      );
    } finally {
      complete();
      router.replace("/(main)/(tabs)/(home)");
    }
  };

  return (
    <ScreenContainer centered>
      <View style={styles.inner}>
        {/* Icon with layered glow — mirrors welcome screen logo */}
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconRing,
              { backgroundColor: `${theme.colors.primary}10` },
            ]}
          />
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: `${theme.colors.primary}14`,
                borderColor: `${theme.colors.primary}28`,
              },
            ]}
          >
            <Ionicons
              name="checkmark-done-circle"
              size={56}
              color={theme.colors.primary}
            />
          </View>
        </View>

        {/* Glass card */}
        <GlassView style={[styles.card, { borderRadius: theme.radius["2xl"] }]}>
          <Typography variant="title" weight="bold" style={styles.centered}>
            {t("onboarding.completeTitle")}
          </Typography>
          <Typography
            variant="body"
            color="textSecondary"
            style={styles.centered}
          >
            {t("onboarding.completeSubtitle")}
          </Typography>
        </GlassView>

        <Button
          title={t("onboarding.startExploring")}
          onPress={handleStart}
          loading={saving}
          style={styles.cta}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  inner: {
    width: "100%",
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    gap: theme.spacing.xl,
  },
  iconContainer: {
    width: 144,
    height: 144,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRing: {
    position: "absolute",
    width: 144,
    height: 144,
    borderRadius: 72,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: theme.radius["3xl"],
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
    alignItems: "center",
    overflow: "hidden",
  },
  centered: {
    textAlign: "center",
  },
  cta: {
    width: "100%",
  },
}));
