import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ShuffleButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

export function ShuffleToggle({
  onPress,
  accessibilityLabel,
}: ShuffleButtonProps) {
  const { theme } = useUnistyles();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSequence(
      withTiming(0.82, { duration: 80 }),
      withTiming(1, { duration: 150 }),
    );
    onPress();
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.pill, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <Ionicons name="shuffle" size={16} color={theme.colors.textMuted} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  pill: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.glassBtn,
    borderWidth: 1,
    borderColor: theme.colors.glassBtnBorder,
  },
}));
