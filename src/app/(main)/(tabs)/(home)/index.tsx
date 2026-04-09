import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/components/Button";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Typography variant="heading">
          {t("home.welcome", { name: user?.email ?? "User" })}
        </Typography>
        <Button
          title={t("home.viewDetail")}
          onPress={() => router.push("/(main)/(tabs)/(home)/123")}
          variant="outline"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
}));
