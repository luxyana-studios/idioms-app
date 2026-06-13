import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface StepProgressProps {
  total: number;
  current: number;
}

export function StepProgress({ total, current }: StepProgressProps) {
  const { theme } = useUnistyles();
  const keys = Array.from({ length: total }, (_, i) => i);

  return (
    <View style={styles.row}>
      {keys.map((key) => (
        <View
          key={key}
          style={[
            styles.segment,
            {
              backgroundColor:
                key < current
                  ? theme.colors.primary
                  : `${theme.colors.primary}22`,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: theme.radius.full,
  },
}));
