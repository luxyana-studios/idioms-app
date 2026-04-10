import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

export default function SavedScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <View style={styles.empty}>
        <Typography variant="title" weight="bold">
          {t("saved.title")}
        </Typography>
        <Typography variant="body" color="textSecondary">
          {t("saved.empty")}
        </Typography>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
}));
