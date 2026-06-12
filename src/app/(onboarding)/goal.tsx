import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { GoalCard } from "@/features/onboarding/components/GoalCard";
import { StepProgress } from "@/features/onboarding/components/StepProgress";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding.store";
import { Button } from "@/shared/components/Button";
import { ScreenContainer } from "@/shared/components/ScreenContainer";
import { Typography } from "@/shared/components/Typography";

const GOALS = [
  { id: "learning", emoji: "🌍" },
  { id: "professional", emoji: "💼" },
  { id: "travel", emoji: "✈️" },
  { id: "academic", emoji: "📚" },
  { id: "fun", emoji: "🎉" },
] as const;

export default function GoalScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const { goals, toggleGoal } = useOnboardingStore();

  return (
    <ScreenContainer>
      <View style={styles.inner}>
        <StepProgress total={3} current={1} />

        <View style={styles.header}>
          <Typography variant="title" weight="bold">
            {t("onboarding.goalTitle")}
          </Typography>
          <Typography
            variant="body"
            style={{ color: theme.colors.textSecondary }}
          >
            {t("onboarding.goalSubtitle")}
          </Typography>
        </View>

        <View style={styles.goals}>
          {GOALS.map(({ id, emoji }) => (
            <GoalCard
              key={id}
              emoji={emoji}
              label={t(`onboarding.goal_${id}`)}
              selected={goals.includes(id)}
              onPress={() => toggleGoal(id)}
            />
          ))}
        </View>

        <Button
          title={t("onboarding.continue")}
          onPress={() => router.push("/(onboarding)/languages")}
        />
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
  goals: {
    flex: 1,
    gap: theme.spacing.sm,
    justifyContent: "center",
  },
}));
