import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native-unistyles";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenContainer style={styles.container}>
      <Typography variant="heading">Detail</Typography>
      <Typography variant="body" color="textSecondary">
        Item ID: {id}
      </Typography>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
}));
