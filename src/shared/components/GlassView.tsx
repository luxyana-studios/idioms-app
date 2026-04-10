import { BlurView } from "expo-blur";
import { Platform, View, type ViewProps } from "react-native";

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: "dark" | "light" | "default";
  border?: boolean;
}

/**
 * Cross-platform glassmorphism surface.
 * - iOS/Web: BlurView with backdrop-filter
 * - Android: semi-transparent fallback
 */
export function GlassView({
  intensity = 40,
  tint = "dark",
  border = true,
  style,
  children,
  ...props
}: GlassViewProps) {
  const borderStyle = border
    ? {
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
      }
    : {};

  if (Platform.OS === "android") {
    return (
      <View
        style={[
          { backgroundColor: "rgba(35, 31, 26, 0.85)" },
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
      tint={tint}
      style={[borderStyle, style]}
      {...props}
    >
      {children}
    </BlurView>
  );
}
