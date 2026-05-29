import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Typography } from "@/shared/components/Typography";

interface LanguageDisplayRowProps {
  label: string;
  flag: string;
  color: string;
  leading?: ReactNode;
}

interface LanguageAppearanceControlsProps {
  flag: string;
  color: string;
  flagControl?: ReactNode;
  colorControl?: ReactNode;
  trailing?: ReactNode;
  inactive?: boolean;
}

export function LanguageDisplayRow({
  label,
  flag,
  color,
  leading,
}: LanguageDisplayRowProps) {
  return (
    <>
      <LanguageRowBody label={label} leading={leading} />
      <LanguageAppearanceControls flag={flag} color={color} />
    </>
  );
}

interface LanguageRowBodyProps {
  label: string;
  leading?: ReactNode;
}

export function LanguageRowBody({ label, leading }: LanguageRowBodyProps) {
  return (
    <>
      {leading}
      <Typography variant="body" style={styles.label}>
        {label}
      </Typography>
    </>
  );
}

export function LanguageAppearanceControls({
  flag,
  color,
  trailing,
  flagControl,
  colorControl,
  inactive,
}: LanguageAppearanceControlsProps) {
  return (
    <View style={styles.controls}>
      {flagControl ?? (
        <View style={[styles.flagBtn, inactive && styles.inactiveControl]}>
          <Text style={styles.flagGlyph}>{flag}</Text>
        </View>
      )}
      {colorControl ?? (
        <View
          style={[
            styles.colorDot,
            inactive && styles.inactiveControl,
            { backgroundColor: color },
          ]}
        />
      )}
      {trailing}
    </View>
  );
}

export const languageDisplayRowStyles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.sm,
    minHeight: theme.spacing.touchTarget,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  pressableContent: {
    flex: 1,
    minHeight: theme.spacing.touchTarget,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
}));

const styles = StyleSheet.create((theme) => ({
  label: {
    flex: 1,
  },
  controls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.sm,
  },
  flagBtn: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  flagGlyph: {
    fontSize: theme.typography.sizes.xl,
  },
  colorDot: {
    width: theme.spacing.lg,
    height: theme.spacing.lg,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.xs,
  },
  inactiveControl: {
    opacity: 0.45,
  },
}));
