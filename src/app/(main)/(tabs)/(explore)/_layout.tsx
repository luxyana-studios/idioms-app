import { DrawerToggleButton } from "@react-navigation/drawer";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

export default function ExploreLayout() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        } as unknown as { backgroundColor: string },
        headerTintColor: theme.colors.text,
        headerLeft: () => <DrawerToggleButton tintColor={theme.colors.text} />,
      }}
    >
      <Stack.Screen name="index" options={{ title: t("explore.title") }} />
    </Stack>
  );
}
