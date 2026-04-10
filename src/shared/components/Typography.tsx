import { Text, type TextProps } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface TypographyProps extends TextProps {
  variant?: "display" | "title" | "heading" | "body" | "label" | "caption";
  color?: "text" | "textSecondary" | "primary" | "error";
  weight?: "light" | "regular" | "medium" | "semibold" | "bold" | "extraBold";
}

export function Typography({
  variant = "body",
  color,
  weight,
  style,
  ...props
}: TypographyProps) {
  const { theme } = useUnistyles();

  const fontFamily = weight
    ? {
        light: theme.typography.fonts.sansLight,
        regular: theme.typography.fonts.sans,
        medium: theme.typography.fonts.sansMedium,
        semibold: theme.typography.fonts.sansSemibold,
        bold: theme.typography.fonts.sansBold,
        extraBold: theme.typography.fonts.sansExtraBold,
      }[weight]
    : undefined;

  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        color && { color: theme.colors[color] },
        fontFamily && { fontFamily },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  base: {
    color: theme.colors.text,
    fontFamily: theme.typography.fonts.sans,
  },
  display: {
    fontSize: theme.typography.sizes["4xl"],
    fontFamily: theme.typography.fonts.sansExtraBold,
    letterSpacing: -1,
    lineHeight: theme.typography.sizes["4xl"] * 1.1,
  },
  title: {
    fontSize: theme.typography.sizes["3xl"],
    fontFamily: theme.typography.fonts.sansBold,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.sansSemibold,
  },
  body: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fonts.sans,
    lineHeight: theme.typography.sizes.md * 1.6,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.sansBold,
    letterSpacing: 1,
  },
  caption: {
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fonts.sans,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
}));
