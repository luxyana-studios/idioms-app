import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";

type Plan = "monthly" | "yearly" | "lifetime";

interface Props {
  width: number;
  height: number;
  onContinue: () => void;
}

export function PaywallSlide({ width, height, onContinue }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");

  const ctaLabel =
    selectedPlan === "yearly"
      ? t("onboarding.startFreeTrial")
      : selectedPlan === "lifetime"
        ? t("onboarding.getLifetime")
        : t("onboarding.startMonthly");

  return (
    <View style={[styles.slide, { width, height }]}>
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
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
              name="diamond-outline"
              size={34}
              color={theme.colors.primary}
            />
          </View>
          <Typography variant="title" weight="bold" style={styles.centered}>
            {t("onboarding.paywallTitle")}
          </Typography>
          <Typography
            variant="body"
            color="textSecondary"
            style={styles.centered}
          >
            {t("onboarding.paywallSubtitle")}
          </Typography>
        </View>

        {/* Plan cards */}
        <View style={styles.plans}>
          {/* Yearly — featured with free trial */}
          <Pressable
            onPress={() => setSelectedPlan("yearly")}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedPlan === "yearly" }}
            style={[
              styles.planCard,
              {
                borderColor:
                  selectedPlan === "yearly"
                    ? theme.colors.primary
                    : theme.colors.chipBorder,
                backgroundColor:
                  selectedPlan === "yearly"
                    ? theme.colors.chipBg
                    : "transparent",
              },
            ]}
          >
            <View style={styles.planBadgeRow}>
              <View
                style={[
                  styles.trialBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Typography
                  variant="caption"
                  weight="bold"
                  style={{
                    color: theme.colors.primaryText,
                    letterSpacing: 0.6,
                  }}
                >
                  {t("onboarding.freeTrialBadge")}
                </Typography>
              </View>
            </View>
            <View style={styles.planRow}>
              <View style={styles.planLeft}>
                <Radio selected={selectedPlan === "yearly"} theme={theme} />
                <View>
                  <Typography variant="body" weight="semibold">
                    {t("onboarding.planYearly")}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t("onboarding.planYearlyDetail")}
                  </Typography>
                </View>
              </View>
              <View style={styles.planRight}>
                <Typography variant="heading" weight="bold">
                  {t("onboarding.planYearlyPrice")}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  /yr
                </Typography>
              </View>
            </View>
          </Pressable>

          {/* Monthly */}
          <Pressable
            onPress={() => setSelectedPlan("monthly")}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedPlan === "monthly" }}
            style={[
              styles.planCard,
              {
                borderColor:
                  selectedPlan === "monthly"
                    ? theme.colors.primary
                    : theme.colors.chipBorder,
                backgroundColor:
                  selectedPlan === "monthly"
                    ? theme.colors.chipBg
                    : "transparent",
              },
            ]}
          >
            <View style={styles.planRow}>
              <View style={styles.planLeft}>
                <Radio selected={selectedPlan === "monthly"} theme={theme} />
                <Typography variant="body" weight="semibold">
                  {t("onboarding.planMonthly")}
                </Typography>
              </View>
              <View style={styles.planRight}>
                <Typography variant="heading" weight="bold">
                  {t("onboarding.planMonthlyPrice")}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  /mo
                </Typography>
              </View>
            </View>
          </Pressable>

          {/* Lifetime */}
          <Pressable
            onPress={() => setSelectedPlan("lifetime")}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedPlan === "lifetime" }}
            style={[
              styles.planCard,
              {
                borderColor:
                  selectedPlan === "lifetime"
                    ? theme.colors.primary
                    : theme.colors.chipBorder,
                backgroundColor:
                  selectedPlan === "lifetime"
                    ? theme.colors.chipBg
                    : "transparent",
              },
            ]}
          >
            <View style={styles.planRow}>
              <View style={styles.planLeft}>
                <Radio selected={selectedPlan === "lifetime"} theme={theme} />
                <View>
                  <Typography variant="body" weight="semibold">
                    {t("onboarding.planLifetime")}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t("onboarding.planLifetimeDetail")}
                  </Typography>
                </View>
              </View>
              <View style={styles.planRight}>
                <Typography variant="heading" weight="bold">
                  {t("onboarding.planLifetimePrice")}
                </Typography>
                <View
                  style={[
                    styles.bestValueBadge,
                    {
                      backgroundColor: `${theme.colors.accent}18`,
                      borderColor: `${theme.colors.accent}30`,
                    },
                  ]}
                >
                  <Typography
                    variant="caption"
                    weight="bold"
                    style={{ color: theme.colors.accent, letterSpacing: 0.5 }}
                  >
                    {t("onboarding.bestValue")}
                  </Typography>
                </View>
              </View>
            </View>
          </Pressable>
        </View>

        {/* CTA */}
        <Button title={ctaLabel} onPress={onContinue} style={styles.cta} />

        <Pressable
          onPress={onContinue}
          accessibilityRole="button"
          style={styles.skipBtn}
        >
          <Typography variant="caption" color="textSecondary">
            {t("onboarding.continueForFree")}
          </Typography>
        </Pressable>

        <Typography
          variant="caption"
          color="textSecondary"
          style={[styles.legalNote, styles.centered]}
        >
          {t("onboarding.paywallNote")}
        </Typography>
      </View>
    </View>
  );
}

function Radio({
  selected,
  theme,
}: {
  selected: boolean;
  theme: { colors: { primary: string; outline: string } };
}) {
  return (
    <View
      style={[
        radioStyles.outer,
        { borderColor: selected ? theme.colors.primary : theme.colors.outline },
      ]}
    >
      {selected && (
        <View
          style={[radioStyles.inner, { backgroundColor: theme.colors.primary }]}
        />
      )}
    </View>
  );
}

const radioStyles = StyleSheet.create(() => ({
  outer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
}));

const styles = StyleSheet.create((theme) => ({
  slide: {
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: theme.radius["2xl"],
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
  centered: {
    textAlign: "center",
  },
  plans: {
    width: "100%",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  planCard: {
    width: "100%",
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 6,
  },
  planBadgeRow: {
    flexDirection: "row",
  },
  trialBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flex: 1,
  },
  planRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  bestValueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
  },
  cta: {
    width: "100%",
  },
  skipBtn: {
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  legalNote: {
    marginTop: theme.spacing.xs,
  },
}));
