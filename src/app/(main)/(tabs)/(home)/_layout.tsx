import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

export default function HomeLayout() {
  const { theme } = useUnistyles();

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
          title: "Idiom Details",
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
