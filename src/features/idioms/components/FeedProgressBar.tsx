import { type DimensionValue, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface FeedProgressBarProps {
  current: number;
  total: number;
}

export function FeedProgressBar({ current, total }: FeedProgressBarProps) {
  const { theme } = useUnistyles();
  const pct: DimensionValue =
    total > 0 ? `${((current + 1) / total) * 100}%` : "0%";

  return (
    <View
      style={[styles.track, { backgroundColor: theme.colors.feedProgressLine }]}
    >
      <View
        style={[
          styles.fill,
          {
            width: pct,
            backgroundColor: theme.colors.feedProgressLineActive,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    flex: 1,
    height: theme.feed.progressBarHeight,
    borderRadius: theme.radius.full,
    overflow: "hidden",
  },
  fill: {
    height: theme.feed.progressBarHeight,
    borderRadius: theme.radius.full,
  },
}));
