import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

export default function LibraryLayout() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        } as unknown as { backgroundColor: string },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: t("library.title") }} />
    </Stack>
  );
}
