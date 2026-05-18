import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { I18nManager, type StyleProp, type TextStyle } from "react-native";

type IoniconsProps = ComponentProps<typeof Ionicons>;

interface DirectionalIconProps extends Omit<IoniconsProps, "style"> {
  style?: StyleProp<TextStyle>;
}

/**
 * Wraps Ionicons with a horizontal flip when the app is in RTL mode.
 * Use for direction-sensitive glyphs (chevrons, arrows, etc.). For
 * direction-neutral icons (search, heart, settings) use Ionicons directly.
 */
export function DirectionalIcon({ style, ...props }: DirectionalIconProps) {
  return (
    <Ionicons
      {...props}
      style={[I18nManager.isRTL && { transform: [{ scaleX: -1 }] }, style]}
    />
  );
}
