import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppProviders } from "@/core/providers/AppProviders";
import { useLoadFonts } from "@/core/theme/fonts";
import { useAuthStore } from "@/features/auth/stores/auth.store";

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { session, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) return;

    const inAuth = segments[0] === "(auth)";

    if (!session && !inAuth) {
      router.replace("/(auth)/login");
    } else if (session && inAuth) {
      router.replace("/(main)/(tabs)/(home)");
    }
  }, [session, initialized, segments, router.replace]);

  return <>{children}</>;
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const { fontsLoaded, fontError } = useLoadFonts();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (initialized && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [initialized, fontsLoaded, fontError]);

  return (
    <AppProviders>
      <AuthGate>
        <Slot />
      </AuthGate>
    </AppProviders>
  );
}
