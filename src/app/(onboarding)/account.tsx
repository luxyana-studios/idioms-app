import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { StepProgress } from "@/features/onboarding/components/StepProgress";
import { Button } from "@/shared/components/Button";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { TextInput } from "@/shared/components/TextInput";
import { Typography } from "@/shared/components/Typography";

const IS_DEMO = !process.env.EXPO_PUBLIC_SUPABASE_URL;

export default function AccountScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const { signUp, loading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    if (!name.trim()) {
      setError(`${t("auth.fullName")} is required`);
      return;
    }
    if (password.length < 6) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    try {
      await signUp(email.trim(), password, name.trim());
      router.push("/(onboarding)/paywall");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDevContinue = () => {
    router.push("/(onboarding)/paywall");
  };

  return (
    <ScreenContainer>
      <View style={styles.inner}>
        <StepProgress total={3} current={3} />

        <View style={styles.header}>
          <Typography variant="title" weight="bold">
            {t("onboarding.accountTitle")}
          </Typography>
          <Typography
            variant="body"
            style={{ color: theme.colors.textSecondary }}
          >
            {t("onboarding.accountSubtitle")}
          </Typography>
        </View>

        {IS_DEMO ? (
          <View style={styles.devBox}>
            <Typography
              variant="caption"
              style={{ color: theme.colors.textMuted, textAlign: "center" }}
            >
              {t("onboarding.accountDevMode")}
            </Typography>
            <Button
              title={t("onboarding.accountContinueDev")}
              variant="outline"
              onPress={handleDevContinue}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              placeholder={t("auth.fullNamePlaceholder")}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
            />
            <TextInput
              placeholder={t("auth.email")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />
            <TextInput
              placeholder={t("auth.password")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            {error ? (
              <Typography
                variant="caption"
                color="error"
                style={{ textAlign: "center" }}
              >
                {error}
              </Typography>
            ) : null}

            <Button
              title={t("auth.signup")}
              onPress={handleCreate}
              loading={loading}
              style={styles.cta}
            />

            <Link href="/(auth)/login" style={styles.link}>
              <Typography
                variant="caption"
                style={{ color: theme.colors.primary, textAlign: "center" }}
              >
                {t("auth.hasAccount")} {t("auth.signIn")}
              </Typography>
            </Link>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing["2xl"],
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  header: {
    gap: 6,
  },
  form: {
    flex: 1,
    gap: theme.spacing.md,
  },
  devBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.lg,
  },
  cta: {
    marginTop: theme.spacing.sm,
  },
  link: {
    alignSelf: "center",
    paddingTop: theme.spacing.xs,
  },
}));
