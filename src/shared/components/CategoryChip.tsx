import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Typography } from "./Typography";

interface CategoryChipProps {
  label: string;
}

export function CategoryChip({ label }: CategoryChipProps) {
  return (
    <View style={styles.chip}>
      <Typography variant="caption" weight="extraBold" style={styles.label}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    backgroundColor: theme.colors.chipBg,
    borderColor: theme.colors.chipBorder,
  },
  label: {
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 10,
  },
}));
