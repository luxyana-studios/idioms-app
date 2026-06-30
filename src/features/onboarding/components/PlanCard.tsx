import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Typography } from "@/shared/components/Typography";
import type { Plan } from "../types";
import { PlanRadio } from "./PlanRadio";

interface Props {
  plan: Plan;
  selectedPlan: Plan;
  onSelect: (plan: Plan) => void;
  label: string;
  detail?: string;
  price: string;
  unit?: string;
  trialBadgeLabel?: string;
  bestValueLabel?: string;
}

export function PlanCard({
  plan,
  selectedPlan,
  onSelect,
  label,
  detail,
  price,
  unit,
  trialBadgeLabel,
  bestValueLabel,
}: Props) {
  const { theme } = useUnistyles();
  const isSelected = selectedPlan === plan;

  return (
    <Pressable
      onPress={() => onSelect(plan)}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      style={[
        styles.planCard,
        {
          borderColor: isSelected
            ? theme.colors.primary
            : theme.colors.chipBorder,
          backgroundColor: isSelected ? theme.colors.chipBg : "transparent",
        },
      ]}
    >
      {trialBadgeLabel && (
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
              style={{ color: theme.colors.primaryText, letterSpacing: 0.6 }}
            >
              {trialBadgeLabel}
            </Typography>
          </View>
        </View>
      )}
      <View style={styles.planRow}>
        <View style={styles.planLeft}>
          <PlanRadio selected={isSelected} />
          <View>
            <Typography variant="body" weight="semibold">
              {label}
            </Typography>
            {detail && (
              <Typography variant="caption" color="textSecondary">
                {detail}
              </Typography>
            )}
          </View>
        </View>
        <View style={styles.planRight}>
          <Typography variant="heading" weight="bold">
            {price}
          </Typography>
          {unit && (
            <Typography variant="caption" color="textSecondary">
              {unit}
            </Typography>
          )}
          {bestValueLabel && (
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
                {bestValueLabel}
              </Typography>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
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
}));
