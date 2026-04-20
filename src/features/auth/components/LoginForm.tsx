import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform, TouchableOpacity, View } from "react-native";
import {
  StyleSheet,
  UnistylesRuntime,
  useUnistyles,
} from "react-native-unistyles";
import { TextInput } from "@/shared/components/TextInput";
import { Typography } from "@/shared/components/Typography";
import { useAuth } from "../hooks/useAuth";

export function LoginForm() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isDark = UnistylesRuntime.themeName === "dark";
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert(t("common.error"), (error as Error).message);
    }
  };

  const cardBg = isDark ? "rgba(26,36,21,0.75)" : "rgba(255,255,255,0.75)";

  return (
    <View style={styles.wrapper}>
      {/* Logo */}
      <View
        style={[
          styles.logoBox,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          },
        ]}
      >
        <Ionicons name="book" size={32} color={theme.colors.primaryText} />
      </View>

      <Typography
        variant="title"
        weight="extraBold"
        style={[styles.appName, { color: theme.colors.text }]}
      >
        IdiomDeck
      </Typography>
      <Typography
        variant="body"
        style={[styles.tagline, { color: theme.colors.textMuted }]}
      >
        {t("auth.tagline")}
      </Typography>

      {/* Glass form card */}
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: theme.colors.cardBorder },
        ]}
      >
        {Platform.OS !== "android" ? (
          <BlurView
            intensity={60}
            tint={isDark ? "dark" : "light"}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 28 }]}
          />
        ) : null}
        {/* Card shimmer */}
        <LinearGradient
          colors={[
            isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.90)",
            "transparent",
          ]}
          style={styles.cardShimmer}
          pointerEvents="none"
        />

        <Typography
          variant="heading"
          weight="bold"
          style={{ color: theme.colors.text, marginBottom: theme.spacing.lg }}
        >
          {t("auth.login")}
        </Typography>

        <View style={styles.fields}>
          <View style={styles.fieldGroup}>
            <Typography
              variant="caption"
              weight="extraBold"
              style={[styles.fieldLabel, { color: theme.colors.textMuted }]}
            >
              {t("auth.email").toUpperCase()}
            </Typography>
            <TextInput
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Typography
              variant="caption"
              weight="extraBold"
              style={[styles.fieldLabel, { color: theme.colors.textMuted }]}
            >
              {t("auth.password").toUpperCase()}
            </Typography>
            <TextInput
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            },
          ]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Typography
            variant="label"
            weight="bold"
            style={{ color: theme.colors.primaryText, letterSpacing: 0.5 }}
          >
            {loading ? t("common.loading") : t("auth.login")}
          </Typography>
        </TouchableOpacity>

        <Link href="/(auth)/signup" style={styles.link}>
          <Typography variant="body" color="primary">
            {t("auth.noAccount")}
          </Typography>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    width: "100%",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  appName: {
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  tagline: {
    marginBottom: theme.spacing.lg,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderWidth: 1,
    overflow: "hidden",
    gap: theme.spacing.sm,
  },
  cardShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  fields: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    letterSpacing: 1,
    fontSize: 10,
  },
  submitBtn: {
    height: 52,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  link: {
    alignSelf: "center",
    marginTop: theme.spacing.sm,
  },
}));
