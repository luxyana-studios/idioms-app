import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native-unistyles";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();

  return (
    <ScreenContainer style={styles.container}>
      <Typography variant="heading">{t("home.idiomDetails")}</Typography>
      <Typography variant="body" color="textSecondary">
        {id}
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
