import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface Props {
  selected: boolean;
}

export function PlanRadio({ selected }: Props) {
  const { theme } = useUnistyles();
  return (
    <View
      style={[
        styles.outer,
        { borderColor: selected ? theme.colors.primary : theme.colors.outline },
      ]}
    >
      {selected && (
        <View
          style={[styles.inner, { backgroundColor: theme.colors.primary }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  outer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  inner: { width: 10, height: 10, borderRadius: 5 },
}));
