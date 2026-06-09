import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";

export default function HomeLayout() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: t("home.idiomDetails"),
          headerStyle: {
            backgroundColor: theme.colors.background,
          } as unknown as { backgroundColor: string },
          headerTintColor: theme.colors.primary,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
