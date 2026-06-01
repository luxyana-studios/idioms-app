import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface StepProgressProps {
  total: number;
  current: number;
}

const SEGMENT_KEYS = [0, 1, 2, 3] as const;

export function StepProgress({ total, current }: StepProgressProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.row}>
      {SEGMENT_KEYS.slice(0, total).map((key) => (
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
