import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import {
  FREE_TIER,
  getOfferings,
  getPackagesByPlatform,
  isPaymentConfigured,
  type PurchasesPackage,
  purchasePackage,
  restorePurchases,
} from "@/core/payments/purchases";
import { PlanCard } from "@/features/onboarding/components/PlanCard";
import type { Plan } from "@/features/onboarding/types";
import { Button } from "@/shared/components/Button";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { Typography } from "@/shared/components/Typography";

export default function PaywallScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<{
    monthly: PurchasesPackage | null;
    yearly: PurchasesPackage | null;
    lifetime: PurchasesPackage | null;
  } | null>(null);

  useEffect(() => {
    if (!isPaymentConfigured) return;
    getOfferings().then((result) => {
      const pkgs = result?.current?.availablePackages ?? [];
      setPackages(getPackagesByPlatform(pkgs));
    });
  }, []);

  const goToComplete = () => router.replace("/(onboarding)/complete");

  const handlePurchase = async () => {
    if (FREE_TIER || !isPaymentConfigured) {
      goToComplete();
      return;
    }
    const pkg = packages?.[selectedPlan];
    if (!pkg) {
      goToComplete();
      return;
    }

    setError(null);
    setPurchasing(true);
    try {
      await purchasePackage(pkg);
      goToComplete();
    } catch (err: unknown) {
      const e = err as { userCancelled?: boolean; message?: string };
      if (!e.userCancelled) {
        setError(t("onboarding.purchaseError"));
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      await restorePurchases();
      goToComplete();
    } catch {
      setError(t("onboarding.purchaseError"));
    } finally {
      setPurchasing(false);
    }
  };

  const ctaLabels: Record<Plan, string> = {
    yearly: t("onboarding.startFreeTrial"),
    lifetime: t("onboarding.getLifetime"),
    monthly: t("onboarding.startMonthly"),
  };
  const ctaLabel = FREE_TIER
    ? t("onboarding.continueForFree")
    : ctaLabels[selectedPlan];

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <GlowBackground />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Loading packages */}
        {isPaymentConfigured && !packages && (
          <ActivityIndicator
            color={theme.colors.primary}
            style={{ marginVertical: 24 }}
          />
        )}

        {/* Plan cards — hidden when FREE_TIER */}
        {!FREE_TIER && (
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
        )}

        {error ? (
          <Typography
            variant="caption"
            color="error"
            style={{ textAlign: "center", marginBottom: 8 }}
          >
            {error}
          </Typography>
        ) : null}

        <Button
          title={ctaLabel}
          onPress={handlePurchase}
          loading={purchasing}
          style={styles.cta}
        />

        {!FREE_TIER && (
          <Pressable
            onPress={goToComplete}
            accessibilityRole="button"
            style={styles.skipBtn}
          >
            <Typography variant="caption" color="textSecondary">
              {t("onboarding.continueForFree")}
            </Typography>
          </Pressable>
        )}

        {isPaymentConfigured && !FREE_TIER && (
          <Pressable
            onPress={handleRestore}
            accessibilityRole="button"
            style={styles.restoreBtn}
          >
            <Typography
              variant="caption"
              style={{ color: theme.colors.primary }}
            >
              {t("onboarding.restorePurchases")}
            </Typography>
          </Pressable>
        )}

        <Typography
          variant="caption"
          color="textSecondary"
          style={[styles.legalNote, styles.centered]}
        >
          {t("onboarding.paywallNote")}
        </Typography>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing["2xl"],
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
  cta: {
    width: "100%",
  },
  skipBtn: {
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  restoreBtn: {
    paddingVertical: theme.spacing.xs,
  },
  legalNote: {
    marginTop: theme.spacing.sm,
  },
}));
