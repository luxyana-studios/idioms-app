import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { type StyleProp, TouchableOpacity, type ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  iconSize?: number;
  containerSize?: number;
  borderRadius?: number;
  variant?: "glass" | "primary";
  accessibilityLabel?: string;
  hitSlop?: number;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  onPress,
  iconSize = 20,
  containerSize = 40,
  borderRadius = 12,
  variant = "glass",
  accessibilityLabel,
  hitSlop = 8,
  style,
}: IconButtonProps) {
  const { theme } = useUnistyles();

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          width: containerSize,
          height: containerSize,
          borderRadius,
          backgroundColor:
            variant === "glass" ? theme.colors.glassBtn : theme.colors.primary,
          borderColor:
            variant === "glass" ? theme.colors.glassBtnBorder : "transparent",
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
        color={
          variant === "glass" ? theme.colors.primary : theme.colors.primaryText
        }
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
