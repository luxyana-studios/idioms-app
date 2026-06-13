import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Typography } from "@/shared/components/Typography";

interface GoalCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function GoalCard({ emoji, label, selected, onPress }: GoalCardProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected
            ? `${theme.colors.primary}12`
            : theme.colors.card,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 1.5 : 1,
        },
        pressed && styles.pressed,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
    >
      {selected && (
        <View
          style={[styles.accent, { backgroundColor: theme.colors.primary }]}
        />
      )}
      <Typography style={styles.emoji}>{emoji}</Typography>
      <Typography
        variant="body"
        weight={selected ? "semibold" : "regular"}
        style={[
          styles.label,
          { color: selected ? theme.colors.primary : theme.colors.text },
        ]}
      >
        {label}
      </Typography>
      <Ionicons
        name={selected ? "checkmark-circle" : "ellipse-outline"}
        size={20}
        color={selected ? theme.colors.primary : theme.colors.outlineVariant}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    overflow: "hidden",
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  label: {
    flex: 1,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
}));
