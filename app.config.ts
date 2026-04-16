import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "IdiomDeck",
  slug: "idiom-deck",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "idiomdeck",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#16130e",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.luxyana.idiomdeck",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#16130e",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    package: "com.luxyana.idiomdeck",
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
  },
  experiments: {
    typedRoutes: true,
  },
  plugins: [["expo-router", { root: "./src/app" }], "expo-localization"],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: "40534188-2d07-47e3-b5a9-699399810371",
    },
  },
});
