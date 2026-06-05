import { Stack, useNavigation, useRouter } from "expo-router";
import { DrawerActions } from "expo-router/react-navigation";
import { useTranslation } from "react-i18next";
import { useUnistyles } from "react-native-unistyles";
import { IconButton } from "@/shared/components/IconButton";

export default function SettingsLayout() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        } as unknown as { backgroundColor: string },
        headerTintColor: theme.colors.text,
        headerLeft: () => (
          <IconButton
            icon="menu"
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            accessibilityLabel={t("common.openMenu")}
          />
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: t("settings.title") }} />
      <Stack.Screen
        name="languages"
        options={{
          title: t("languages.title"),
          headerLeft: () => (
            <IconButton
              icon="chevron-back"
              directional
              variant="bare"
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace("/(main)/(settings)")
              }
              accessibilityLabel={t("common.goBack")}
            />
          ),
        }}
      />
    </Stack>
  );
}
