import { useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export const SWIPE_THRESHOLD = 80;
export const GLOW_START = 20;
const FLY_OFF_DURATION = 220;
const MAX_TILT_DEG = 4;

interface UseFeedGestureOpts {
  onSave: () => void;
  onSkip: () => void;
}

export function useFeedGesture({ onSave, onSkip }: UseFeedGestureOpts) {
  const { width: screenWidth } = useWindowDimensions();

  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const glowIsLike = useSharedValue(true);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-8, 8])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      rotateZ.value = (e.translationX / screenWidth) * MAX_TILT_DEG;
      const absX = Math.abs(e.translationX);
      glowOpacity.value = Math.min(
        Math.max((absX - GLOW_START) / (SWIPE_THRESHOLD - GLOW_START), 0),
        1,
      );
      glowIsLike.value = e.translationX > 0;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const direction = e.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(
          direction * screenWidth * 1.5,
          { duration: FLY_OFF_DURATION },
          () => {
            if (direction > 0) {
              runOnJS(onSave)();
            } else {
              runOnJS(onSkip)();
            }
            translateX.value = 0;
            rotateZ.value = 0;
            glowOpacity.value = 0;
          },
        );
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        rotateZ.value = withSpring(0, { damping: 20, stiffness: 200 });
        glowOpacity.value = withTiming(0, { duration: 150 });
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotateZ.value}deg` },
    ],
  }));

  const isLikeDirection = useDerivedValue(() => glowIsLike.value);

  return {
    panGesture,
    animatedCardStyle,
    glowOpacity: glowOpacity as SharedValue<number>,
    isLikeDirection,
  };
}
