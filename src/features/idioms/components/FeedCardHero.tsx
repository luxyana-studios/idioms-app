import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Typography } from "@/shared/components/Typography";

interface FeedCardHeroProps {
  expression: string;
  expressionSize: number;
  color: string;
  safeTop: number;
}

export function FeedCardHero({
  expression,
  expressionSize,
  color,
  safeTop,
}: FeedCardHeroProps) {
  return (
    <View
      style={[styles.heroArea, { paddingTop: safeTop }]}
      pointerEvents="none"
    >
      <Typography
        variant="display"
        weight="extraBold"
        style={[
          styles.expression,
          {
            color,
            fontSize: expressionSize,
            lineHeight: expressionSize * 1.2,
          },
        ]}
      >
        {expression}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  heroArea: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing["2xl"],
  },
  expression: {
    letterSpacing: -2,
  },
}));
