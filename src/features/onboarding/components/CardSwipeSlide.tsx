import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button } from "@/shared/components/Button";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { GlowBackground } from "@/shared/components/GlowBackground";
import { IconButton } from "@/shared/components/IconButton";
import { Typography } from "@/shared/components/Typography";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

const GESTURES: {
  icon: IoniconsName;
  labelKey: string;
  descKey: string;
  usePrimary: boolean;
}[] = [
  {
    icon: "heart-outline",
    labelKey: "onboarding.swipeRightLabel",
    descKey: "onboarding.swipeRightDesc",
    usePrimary: true,
  },
  {
    icon: "play-skip-forward-outline",
    labelKey: "onboarding.swipeLeftLabel",
    descKey: "onboarding.swipeLeftDesc",
    usePrimary: false,
  },
  {
    icon: "hand-left-outline",
    labelKey: "onboarding.holdLabel",
    descKey: "onboarding.holdDesc",
    usePrimary: true,
  },
  {
    icon: "expand-outline",
    labelKey: "onboarding.tapExpandLabel",
    descKey: "onboarding.tapExpandDesc",
    usePrimary: false,
  },
];

interface Props {
  width: number;
  height: number;
  isActive: boolean;
  onNext: () => void;
}

export function CardSwipeSlide({ width, height, isActive, onNext }: Props) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(20);
  const gesturesOpacity = useSharedValue(0);
  const gesturesY = useSharedValue(12);

  useEffect(() => {
    if (isActive) {
      cardOpacity.value = withDelay(80, withTiming(1, { duration: 380 }));
      cardY.value = withDelay(
        80,
        withSpring(0, { damping: 16, stiffness: 120 }),
      );
      gesturesOpacity.value = withDelay(520, withTiming(1, { duration: 360 }));
      gesturesY.value = withDelay(520, withSpring(0, { damping: 18 }));
    } else {
      cardOpacity.value = 0;
      cardY.value = 20;
      gesturesOpacity.value = 0;
      gesturesY.value = 12;
    }
  }, [isActive, cardOpacity, cardY, gesturesOpacity, gesturesY]);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));
  const gesturesAnim = useAnimatedStyle(() => ({
    opacity: gesturesOpacity.value,
    transform: [{ translateY: gesturesY.value }],
  }));

  return (
    <View style={[styles.slide, { width, height }]}>
      <View style={styles.inner}>
        <View style={styles.titleBlock}>
          <Typography variant="heading" weight="bold" style={styles.centered}>
            {t("onboarding.cardFeedTitle")}
          </Typography>
        </View>

        {/* Compact mock FeedCard */}
        <Animated.View style={[styles.cardWrap, cardAnim]}>
          <View
            style={[
              styles.mockCard,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <GlowBackground subtle />
            <View style={styles.heroArea}>
              <Typography
                variant="display"
                weight="extraBold"
                style={[styles.expression, { color: theme.colors.primary }]}
              >
                {t("onboarding.idiomExample")}
              </Typography>
            </View>
            <LinearGradient
              colors={[
                theme.colors.feedCardScrimStart,
                theme.colors.feedCardScrimEnd,
              ]}
              style={styles.scrim}
              pointerEvents="none"
            />
            <View
              style={[
                styles.tray,
                { backgroundColor: theme.colors.feedTrayBg },
              ]}
            >
              <Typography
                variant="body"
                weight="medium"
                style={[styles.meaning, { color: theme.colors.textSecondary }]}
                numberOfLines={1}
              >
                {t("onboarding.idiomMeaning")}
              </Typography>
              <View style={styles.tagsActions}>
                <View style={styles.tagsRow}>
                  <CategoryChip label="EN" />
                  <CategoryChip label="INFORMAL" />
                </View>
                <View style={styles.actions}>
                  <IconButton
                    icon="chevron-forward"
                    onPress={() => {}}
                    variant="bare"
                    iconSize={20}
                    containerSize={36}
                    borderRadius={theme.radius.full}
                    accessibilityLabel={t("home.expandIdiom")}
                  />
                  <IconButton
                    icon="heart-outline"
                    onPress={() => {}}
                    variant="primary"
                    iconSize={20}
                    containerSize={40}
                    borderRadius={theme.radius.full}
                    accessibilityLabel={t("home.saveIdiom")}
                  />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Gesture guide */}
        <Animated.View style={[styles.gestureList, gesturesAnim]}>
          {GESTURES.map(({ icon, labelKey, descKey, usePrimary }) => (
            <View key={labelKey} style={styles.gestureRow}>
              <View
                style={[
                  styles.iconPill,
                  {
                    backgroundColor: usePrimary
                      ? `${theme.colors.primary}18`
                      : `${theme.colors.accent}18`,
                    borderColor: usePrimary
                      ? `${theme.colors.primary}30`
                      : `${theme.colors.accent}30`,
                  },
                ]}
              >
                <Ionicons
                  name={icon}
                  size={18}
                  color={
                    usePrimary ? theme.colors.primary : theme.colors.accent
                  }
                />
              </View>
              <View style={styles.gestureText}>
                <Typography variant="body" weight="semibold">
                  {t(labelKey)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t(descKey)}
                </Typography>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.spacer} />

        <Button
          title={t("onboarding.next")}
          onPress={onNext}
          style={styles.cta}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  slide: {
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    alignItems: "center",
  },
  titleBlock: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  centered: {
    textAlign: "center",
  },
  cardWrap: {
    width: "100%",
  },
  mockCard: {
    width: "100%",
    borderRadius: theme.radius["2xl"],
    overflow: "hidden",
    height: 178,
  },
  heroArea: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  expression: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -1.5,
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
  },
  tray: {
    borderTopLeftRadius: theme.radius["2xl"],
    borderTopRightRadius: theme.radius["2xl"],
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
    zIndex: 2,
  },
  meaning: {
    letterSpacing: 0.1,
  },
  tagsActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  tagsRow: {
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  gestureList: {
    width: "100%",
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  gestureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  gestureText: {
    flex: 1,
    gap: 1,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: "100%",
  },
}));
