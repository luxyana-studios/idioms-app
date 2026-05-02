import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Typography } from "./Typography";

interface SectionHeaderProps {
  label: string;
  title: string;
}

export function SectionHeader({ label, title }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Typography variant="caption" weight="extraBold" style={styles.label}>
        {label}
      </Typography>
      <Typography variant="title" weight="extraBold" style={styles.title}>
        {title}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignSelf: "stretch",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  label: {
    color: theme.colors.accent,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    marginBottom: 6,
    fontSize: 10,
  },
  title: {
    color: theme.colors.text,
    alignSelf: "stretch",
    textAlign: "center",
    letterSpacing: -0.5,
  },
}));
