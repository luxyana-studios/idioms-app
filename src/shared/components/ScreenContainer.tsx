import { View, type ViewProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { GlowBackground } from "./GlowBackground";

interface ScreenContainerProps extends ViewProps {
  centered?: boolean;
}

export function ScreenContainer({
  centered,
  style,
  children,
  ...props
}: ScreenContainerProps) {
  return (
    <View
      style={[styles.container, centered && styles.centered, style]}
      {...props}
    >
      <GlowBackground subtle />
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    position: "relative",
  },
  centered: {
    justifyContent: "center" as const,
  },
}));
