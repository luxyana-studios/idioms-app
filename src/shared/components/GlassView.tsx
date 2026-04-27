import { BlurView } from "expo-blur";
import { Platform, View, type ViewProps } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: "dark" | "light" | "default";
  border?: boolean;
}

/**
 * Cross-platform glassmorphism surface.
 * - iOS/Web: BlurView with backdrop-filter
 * - Android: theme-aware semi-transparent fallback
 */
export function GlassView({
  intensity = 60,
  tint = "default",
  border = true,
  style,
  children,
  ...props
}: GlassViewProps) {
  const isDark = UnistylesRuntime.themeName === "dark";

  const borderStyle = border
    ? {
        borderWidth: 1,
        borderColor: isDark
          ? "rgba(180,210,140,0.10)"
          : "rgba(255,255,255,0.85)",
      }
    : {};

  if (Platform.OS === "android") {
    return (
      <View
        style={[
          {
            backgroundColor: isDark
              ? "rgba(30,42,22,0.88)"
              : "rgba(255,255,255,0.80)",
          },
          borderStyle,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={isDark ? "dark" : tint === "default" ? "light" : tint}
      style={[borderStyle, style]}
      {...props}
    >
      {children}
    </BlurView>
  );
}
