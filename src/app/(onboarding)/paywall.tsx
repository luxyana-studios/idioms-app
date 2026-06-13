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
import { Button } from "@/shared/components/Button";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { Typography } from "@/shared/components/Typography";

type Plan = "monthly" | "yearly" | "lifetime";

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
    const pkg =
      selectedPlan === "yearly"
        ? packages?.yearly
        : selectedPlan === "lifetime"
          ? packages?.lifetime
          : packages?.monthly;

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

  const ctaLabel = FREE_TIER
    ? t("onboarding.continueForFree")
    : selectedPlan === "yearly"
      ? t("onboarding.startFreeTrial")
      : selectedPlan === "lifetime"
        ? t("onboarding.getLifetime")
        : t("onboarding.startMonthly");

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
            {/* Yearly */}
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
                      style={{
                        color: theme.colors.accent,
                        letterSpacing: 0.5,
                      }}
                    >
                      {t("onboarding.bestValue")}
                    </Typography>
                  </View>
                </View>
              </View>
            </Pressable>
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
  inner: { width: 10, height: 10, borderRadius: 5 },
}));

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
  restoreBtn: {
    paddingVertical: theme.spacing.xs,
  },
  legalNote: {
    marginTop: theme.spacing.sm,
  },
}));
