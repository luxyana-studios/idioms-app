import { Link } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button } from "@/shared/components/Button";
import { TextInput } from "@/shared/components/TextInput";
import { Typography } from "@/shared/components/Typography";
import { useAuth } from "../hooks/useAuth";

export function SignupForm() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    if (password.length < 6) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    try {
      await signUp(email, password);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Typography variant="title" style={styles.title}>
        {t("auth.signup")}
      </Typography>
      <TextInput
        placeholder={t("auth.email")}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder={t("auth.password")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? (
        <Typography
          variant="caption"
          style={{ color: theme.colors.error, textAlign: "center" }}
        >
          {error}
        </Typography>
      ) : null}
      <Button
        title={t("auth.signup")}
        onPress={handleSignup}
        loading={loading}
      />
      <Link href="/(auth)/login" style={styles.link}>
        <Typography variant="body" color="primary">
          {t("auth.hasAccount")}
        </Typography>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  title: {
    textAlign: "center" as const,
    marginBottom: theme.spacing.lg,
  },
  link: {
    alignSelf: "center" as const,
    marginTop: theme.spacing.sm,
  },
}));
