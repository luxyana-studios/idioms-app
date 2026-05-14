import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { IdiomCardStack } from "@/features/idioms/components/IdiomCardStack";
import { useIdioms } from "@/features/idioms/hooks/useIdioms";
import { useIdiomsStore } from "@/features/idioms/stores/idioms.store";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { Typography } from "@/shared/components/Typography";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const router = useRouter();
  const navigation =
    useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const insets = useSafeAreaInsets();
  const { data: idioms = [], isLoading } = useIdioms();
  const { currentIndex, savedIds, saveIdiom, unsaveIdiom, nextIdiom } =
    useIdiomsStore();

  const current = idioms[currentIndex];
  const scrollPaddingBottom =
    80 + Math.max(insets.bottom, 8) + theme.spacing.xl;

  if (isLoading || !current) {
    return (
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isSaved = savedIds.includes(current.id);
  const progress = (currentIndex + 1) / idioms.length;

  const handleSave = () => {
    if (isSaved) unsaveIdiom(current.id);
    else saveIdiom(current.id);
    nextIdiom(idioms.length);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <GlowBackground />
      <ScreenHeader
        left={
          <IconButton
            icon="menu"
            onPress={() => navigation.openDrawer()}
            accessibilityLabel={t("common.openMenu")}
          />
        }
        center={
          <Typography variant="heading" weight="extraBold" style={styles.logo}>
            IdiomDeck
          </Typography>
        }
        right={
          <IconButton
            icon="search"
            onPress={() => router.push("/(main)/(tabs)/(explore)")}
            accessibilityLabel={t("explore.title")}
          />
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          label={t("home.dailySelection")}
          title={t("home.expandLexicon")}
        />
        <IdiomCardStack
          idiom={current}
          progress={progress}
          currentIndex={currentIndex}
          totalCount={idioms.length}
          isSaved={isSaved}
          onPress={() => router.push(`/(main)/(tabs)/(home)/${current.id}`)}
          onSkip={() => nextIdiom(idioms.length)}
          onDetails={() => router.push(`/(main)/(tabs)/(home)/${current.id}`)}
          onSave={handleSave}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  logo: {
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: theme.spacing.md,
  },
}));
