import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { LANG_KEY } from "@/features/idioms/constants";
import { useIdiomEquivalents } from "@/features/idioms/hooks/useIdiomEquivalents";
import type { IdiomEquivalent } from "@/features/idioms/types";
import { Typography } from "@/shared/components/Typography";
import { IdiomInfoCard } from "./IdiomInfoCard";

interface EquivalentsSectionProps {
  idiomId: string;
}

function EquivalentCard({ equiv }: { equiv: IdiomEquivalent }) {
  const { theme } = useUnistyles();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(main)/(tabs)/(home)/${equiv.equivalentId}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surfaceContainerLow,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={equiv.expression}
    >
      <View style={styles.cardText}>
        <Typography
          variant="body"
          weight="bold"
          style={{ color: theme.colors.text }}
        >
          {equiv.expression}
        </Typography>
        <Typography
          variant="caption"
          style={{ color: theme.colors.textSecondary }}
          numberOfLines={1}
        >
          {equiv.idiomaticMeaning}
        </Typography>
      </View>
      <Ionicons
        name="chevron-forward"
        size={14}
        color={theme.colors.textMuted}
      />
    </Pressable>
  );
}

export function EquivalentsSection({ idiomId }: EquivalentsSectionProps) {
  const { t } = useTranslation();
  const { data: equivalents = [], isError } = useIdiomEquivalents(idiomId);

  // Equivalents are supplementary — a failed fetch should not degrade the main idiom detail view.
  if (isError || equivalents.length === 0) return null;

  const byLanguage = equivalents.reduce<Record<string, IdiomEquivalent[]>>(
    (acc, equiv) => {
      const key = equiv.languageCode;
      if (!acc[key]) acc[key] = [];
      acc[key].push(equiv);
      return acc;
    },
    {},
  );

  const languageGroups = Object.entries(byLanguage).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <IdiomInfoCard label={t("detail.equivalents")}>
      {languageGroups.map(([langCode, equivs], groupIndex) => (
        <View
          key={langCode}
          style={groupIndex > 0 ? styles.groupSpacing : undefined}
        >
          <Typography
            variant="caption"
            weight="extraBold"
            style={styles.langHeader}
          >
            {t(LANG_KEY[langCode] ?? langCode).toUpperCase()}
          </Typography>
          <View style={styles.groupCards}>
            {equivs.map((equiv) => (
              <EquivalentCard key={equiv.edgeId} equiv={equiv} />
            ))}
          </View>
        </View>
      ))}
    </IdiomInfoCard>
  );
}

const styles = StyleSheet.create((theme) => ({
  groupSpacing: {
    marginTop: theme.spacing.sm,
  },
  langHeader: {
    color: theme.colors.accent,
    letterSpacing: 1.2,
    fontSize: theme.typography.sizes["2xs"],
    marginBottom: theme.spacing.xs,
  },
  groupCards: {
    gap: theme.spacing.xs,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderRadius: theme.radius.chip,
    padding: theme.spacing.sm,
    borderWidth: 1,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
}));
