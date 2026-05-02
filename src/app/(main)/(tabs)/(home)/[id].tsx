import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { IdiomInfoCard } from "@/features/idioms/components/IdiomInfoCard";
import { PronunciationButton } from "@/features/idioms/components/PronunciationButton";
import { useIdioms } from "@/features/idioms/hooks/useIdioms";
import { useIdiomsStore } from "@/features/idioms/stores/idioms.store";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { Typography } from "@/shared/components/Typography";

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: idioms = [] } = useIdioms();
  const { savedIds, saveIdiom, unsaveIdiom } = useIdiomsStore();

  const idiom = idioms.find((i) => i.id === id);
  const isSaved = idiom ? savedIds.includes(idiom.id) : false;

  if (!idiom) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.notFound}>
          <Typography
            variant="heading"
            weight="bold"
            style={{ color: theme.colors.text }}
          >
            {t("detail.notFound")}
          </Typography>
          <Typography variant="body" style={{ color: theme.colors.textMuted }}>
            {t("detail.notFoundSubtitle")}
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <GlowBackground subtle />
      <ScreenHeader
        left={
          <IconButton
            icon="chevron-back"
            onPress={() => router.back()}
            accessibilityLabel={t("common.goBack")}
          />
        }
        center={
          <CategoryChip label={idiom.tags[0]?.label ?? idiom.languageCode} />
        }
        right={
          <IconButton
            icon={isSaved ? "heart" : "heart-outline"}
            onPress={() =>
              isSaved ? unsaveIdiom(idiom.id) : saveIdiom(idiom.id)
            }
            variant={isSaved ? "primary" : "glass"}
            accessibilityLabel={t(isSaved ? "home.saved" : "common.save")}
          />
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 8) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Typography
          variant="display"
          weight="extraBold"
          style={[styles.expression, { color: theme.colors.primary }]}
        >
          {idiom.expression}
        </Typography>

        <Typography
          variant="heading"
          weight="semibold"
          style={[styles.meaning, { color: theme.colors.textSecondary }]}
        >
          "{idiom.idiomaticMeaning}"
        </Typography>

        {idiom.explanation && (
          <IdiomInfoCard label={t("detail.originLabel")}>
            <Typography
              variant="body"
              style={{ color: theme.colors.text, lineHeight: 26 }}
            >
              {idiom.explanation}
            </Typography>
          </IdiomInfoCard>
        )}

        {idiom.examples && idiom.examples.length > 0 && (
          <IdiomInfoCard label={t("detail.exampleLabel")}>
            {idiom.examples.map((example) => (
              <Typography
                key={example}
                variant="body"
                style={{
                  color: theme.colors.textSecondary,
                  lineHeight: 26,
                  fontStyle: "italic",
                }}
              >
                {example}
              </Typography>
            ))}
          </IdiomInfoCard>
        )}

        <PronunciationButton />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  expression: {
    fontSize: theme.typography.sizes["5xl"],
    lineHeight: 46,
    letterSpacing: -1.2,
  },
  meaning: {
    fontSize: theme.typography.sizes.lg,
    lineHeight: 28,
    fontStyle: "italic",
    marginBottom: theme.spacing.sm,
  },
}));
