import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProviders } from "@/core/providers/AppProviders";
import { useLoadFonts } from "@/core/theme/fonts";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  DEV_ALWAYS_SHOW_ONBOARDING,
  useOnboardingStore,
} from "@/features/onboarding/stores/onboarding.store";

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { session, initialized } = useAuthStore();
  const onboardingCompleted = useOnboardingStore((s) => s.completed);

  useEffect(() => {
    if (!initialized) return;

    const segment = segments[0] as string;
    const inAuth = segment === "(auth)";
    const inOnboarding = segment === "(onboarding)";

    if (!session && !inAuth) {
      router.replace("/(auth)/login");
    } else if (session && inAuth) {
      router.replace(
        onboardingCompleted ? "/(main)/(tabs)/(home)" : "/(onboarding)",
      );
    } else if (session && !onboardingCompleted && !inOnboarding) {
      router.replace("/(onboarding)");
    } else if (session && onboardingCompleted && inOnboarding) {
      router.replace("/(main)/(tabs)/(home)");
    }
  }, [session, initialized, onboardingCompleted, segments, router.replace]);

  return <>{children}</>;
}

// On web: constrain to a phone-width column centered on screen
function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: "#16130e" }}>
      <View style={{ flex: 1, width: "100%", maxWidth: 430 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({ gestureRoot: { flex: 1 } });

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const { fontsLoaded, fontError } = useLoadFonts();
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  useEffect(() => {
    if (DEV_ALWAYS_SHOW_ONBOARDING) {
      resetOnboarding();
    }
    initialize();
  }, [initialize, resetOnboarding]);

  useEffect(() => {
    if (initialized && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [initialized, fontsLoaded, fontError]);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <AppProviders>
        <WebFrame>
          <AuthGate>
            <Slot />
          </AuthGate>
        </WebFrame>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
