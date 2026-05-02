import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { GlassView } from "@/shared/components/GlassView";
import { Typography } from "@/shared/components/Typography";

interface IdiomInfoCardProps {
  label: string;
  children: ReactNode;
}

export function IdiomInfoCard({ label, children }: IdiomInfoCardProps) {
  const { theme } = useUnistyles();
  return (
    <GlassView style={styles.card}>
      <LinearGradient
        colors={[theme.colors.cardShimmer, "transparent"]}
        style={styles.shimmer}
        pointerEvents="none"
      />
      <Typography
        variant="caption"
        weight="extraBold"
        style={[styles.label, { color: theme.colors.textMuted }]}
      >
        {label}
      </Typography>
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: 20,
    padding: 18,
    gap: theme.spacing.sm,
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  label: {
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 10,
  },
}));
