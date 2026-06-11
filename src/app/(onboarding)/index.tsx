import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { HowItWorksSlide } from "@/features/onboarding/components/HowItWorksSlide";
import { PaywallSlide } from "@/features/onboarding/components/PaywallSlide";
import { StatsSlide } from "@/features/onboarding/components/StatsSlide";
import { WelcomeSlide } from "@/features/onboarding/components/WelcomeSlide";
import { ScreenContainer } from "@/shared/components/ScreenContainer";

const SLIDE_COUNT = 4;
const DOTS_BAR_HEIGHT = 38;

export default function WelcomeScreen() {
  const { width, height: windowHeight } = useWindowDimensions();
  const { theme } = useUnistyles();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideHeight, setSlideHeight] = useState(
    windowHeight - DOTS_BAR_HEIGHT,
  );

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveSlide(index);
  };

  const nextSlide = () => {
    if (activeSlide < SLIDE_COUNT - 1) goToSlide(activeSlide + 1);
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(e.nativeEvent.contentOffset.x / width);
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  const goToGoal = () => router.push("/(onboarding)/goal");

  const slideProps = { width, height: slideHeight };

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        style={styles.pager}
        onLayout={(e) => setSlideHeight(e.nativeEvent.layout.height)}
      >
        <WelcomeSlide {...slideProps} onNext={nextSlide} />
        <HowItWorksSlide
          {...slideProps}
          isActive={activeSlide === 1}
          onNext={nextSlide}
        />
        <StatsSlide
          {...slideProps}
          isActive={activeSlide === 2}
          onNext={nextSlide}
        />
        <PaywallSlide {...slideProps} onContinue={goToGoal} />
      </ScrollView>

      <View style={styles.dotsBar}>
        {Array.from({ length: SLIDE_COUNT }, (_, i) => i).map((i) => (
          <View
            key={`dot-${i}`}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === activeSlide
                    ? theme.colors.primary
                    : theme.colors.progressTrack,
                width: i === activeSlide ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 0,
  },
  pager: {
    flex: 1,
  },
  dotsBar: {
    height: DOTS_BAR_HEIGHT,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: theme.radius.full,
  },
}));
