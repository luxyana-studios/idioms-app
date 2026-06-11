import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Typography } from "@/shared/components/Typography";

interface LanguageChipProps {
  flag: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function LanguageChip({
  flag,
  label,
  selected,
  onPress,
}: LanguageChipProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected
            ? `${theme.colors.primary}1e`
            : theme.colors.surfaceContainerHigh,
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          borderWidth: selected ? 2 : 1,
        },
        pressed && styles.pressed,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
    >
      {/* Checkmark badge — top-right corner when selected */}
      {selected && (
        <View
          style={[styles.checkBadge, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons
            name="checkmark"
            size={9}
            color={theme.colors.primaryText}
          />
        </View>
      )}

      <Typography style={styles.flag}>{flag}</Typography>

      <Typography
        variant="caption"
        weight={selected ? "semibold" : "regular"}
        style={{
          color: selected ? theme.colors.primary : theme.colors.textSecondary,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  chip: {
    width: 100,
    alignItems: "center",
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.xs,
  },
  flag: {
    fontSize: 34,
    lineHeight: 42,
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },
}));
