import { Text, type TextProps } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { type UiFontWeight, useUiFonts } from "@/core/theme/fonts";

interface TypographyProps extends TextProps {
  variant?: "display" | "title" | "heading" | "body" | "label" | "caption";
  color?: "text" | "textSecondary" | "primary" | "error";
  weight?: UiFontWeight;
}

const VARIANT_WEIGHT: Record<
  NonNullable<TypographyProps["variant"]>,
  UiFontWeight
> = {
  display: "extraBold",
  title: "bold",
  heading: "semibold",
  body: "regular",
  label: "bold",
  caption: "regular",
};

export function Typography({
  variant = "body",
  color,
  weight,
  style,
  ...props
}: TypographyProps) {
  const { theme } = useUnistyles();
  const fonts = useUiFonts();

  const effectiveWeight = weight ?? VARIANT_WEIGHT[variant];
  const fontFamily = fonts.family(effectiveWeight);
  const fontWeight = fonts.weight(effectiveWeight);

  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        color && { color: theme.colors[color] },
        { fontFamily, fontWeight },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  base: {
    color: theme.colors.text,
  },
  display: {
    fontSize: theme.typography.sizes["4xl"],
    letterSpacing: -1,
    lineHeight: theme.typography.sizes["4xl"] * 1.1,
  },
  title: {
    fontSize: theme.typography.sizes["3xl"],
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: theme.typography.sizes.xl,
  },
  body: {
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.sizes.md * 1.6,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    letterSpacing: 1,
  },
  caption: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
}));
