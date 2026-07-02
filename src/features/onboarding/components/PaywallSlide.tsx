import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/shared/components/Button";
import { Typography } from "@/shared/components/Typography";
import type { Plan } from "../types";
import { PlanCard } from "./PlanCard";

interface Props {
  width: number;
  height: number;
  onContinue: () => void;
}

export function PaywallSlide({ width, height, onContinue }: Props) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");

  const ctaLabels: Record<Plan, string> = {
    yearly: t("onboarding.startFreeTrial"),
    lifetime: t("onboarding.getLifetime"),
    monthly: t("onboarding.startMonthly"),
  };

  return (
    <View style={[styles.slide, { width, height }]}>
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
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
          <PlanCard
            plan="yearly"
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlan}
            label={t("onboarding.planYearly")}
            detail={t("onboarding.planYearlyDetail")}
            price={t("onboarding.planYearlyPrice")}
            unit="/yr"
            trialBadgeLabel={t("onboarding.freeTrialBadge")}
          />
          <PlanCard
            plan="monthly"
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlan}
            label={t("onboarding.planMonthly")}
            price={t("onboarding.planMonthlyPrice")}
            unit="/mo"
          />
          <PlanCard
            plan="lifetime"
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlan}
            label={t("onboarding.planLifetime")}
            detail={t("onboarding.planLifetimeDetail")}
            price={t("onboarding.planLifetimePrice")}
            bestValueLabel={t("onboarding.bestValue")}
          />
        </View>

        {/* CTA */}
        <Button
          title={ctaLabels[selectedPlan]}
          onPress={onContinue}
          style={styles.cta}
        />

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
  centered: {
    textAlign: "center",
  },
  plans: {
    width: "100%",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
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
