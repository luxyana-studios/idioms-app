import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Typography } from "./Typography";

interface ButtonProps extends Omit<PressableProps, "children"> {
  title: string;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
}

export function Button({
  title,
  variant = "primary",
  loading,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useUnistyles();
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        typeof style === "function"
          ? style({ pressed } as Parameters<typeof style>[0])
          : style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {({ pressed }) => (
        <>
          {isPrimary && (
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradient, pressed && styles.pressed]}
            />
          )}
          {isOutline && (
            <View
              style={[
                styles.outlineBg,
                { borderColor: `${theme.colors.primary}40` },
              ]}
            />
          )}
          {loading ? (
            <ActivityIndicator
              color={
                isPrimary ? theme.colors.primaryText : theme.colors.primary
              }
            />
          ) : (
            <Typography
              variant="label"
              weight="bold"
              style={
                isPrimary
                  ? { color: theme.colors.primaryText, letterSpacing: 0.5 }
                  : { color: theme.colors.primary }
              }
            >
              {title}
            </Typography>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: {
    height: 52,
    borderRadius: theme.radius.full,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  outlineBg: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: theme.radius.full,
    backgroundColor: `${theme.colors.primary}0a`,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
}));
