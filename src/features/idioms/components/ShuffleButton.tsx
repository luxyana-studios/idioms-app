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

export function ShuffleButton({
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
      style={[styles.btn, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
    >
      <Ionicons name="shuffle" size={20} color={theme.colors.textMuted} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  btn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.glassBtn,
    borderWidth: 1,
    borderColor: theme.colors.glassBtnBorder,
  },
}));
