import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import {
  I18nManager,
  type StyleProp,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  iconSize?: number;
  containerSize?: number;
  borderRadius?: number;
  variant?: "glass" | "primary" | "bare";
  iconColor?: string;
  accessibilityLabel?: string;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
  /** Set true for chevrons/arrows/etc. so the glyph mirrors in RTL layouts. */
  directional?: boolean;
}

export function IconButton({
  icon,
  onPress,
  iconSize = 20,
  containerSize = 40,
  borderRadius = 12,
  variant = "glass",
  iconColor,
  accessibilityLabel,
  hitSlop = 8,
  style,
  directional = false,
}: IconButtonProps) {
  const { theme } = useUnistyles();

  const resolvedIconColor =
    iconColor ??
    (variant === "primary"
      ? theme.colors.primaryText
      : variant === "bare"
        ? theme.colors.textSecondary
        : theme.colors.primary);

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          width: containerSize,
          height: containerSize,
          borderRadius,
          backgroundColor:
            variant === "glass"
              ? theme.colors.glassBtn
              : variant === "primary"
                ? theme.colors.primary
                : "transparent",
          borderColor:
            variant === "glass" ? theme.colors.glassBtnBorder : "transparent",
          borderWidth: variant === "glass" ? 1 : 0,
        },
        style,
      ]}
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons
        name={icon}
        size={iconSize}
        color={resolvedIconColor}
        style={
          directional && I18nManager.isRTL
            ? { transform: [{ scaleX: -1 }] }
            : undefined
        }
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
