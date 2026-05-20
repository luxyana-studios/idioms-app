import { GLOW_START, SWIPE_THRESHOLD } from "../useFeedGesture";

jest.mock("react-native-reanimated", () => ({
  useSharedValue: (v: unknown) => ({ value: v }),
  useAnimatedStyle: (fn: () => unknown) => fn(),
  useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
  withTiming: (v: unknown) => v,
  withSpring: (v: unknown) => v,
  runOnJS: (fn: unknown) => fn,
  Easing: { out: () => undefined, cubic: undefined },
}));
jest.mock("react-native-gesture-handler", () => ({
  Gesture: {
    Pan: () => ({
      activeOffsetX: function () {
        return this;
      },
      failOffsetY: function () {
        return this;
      },
      onUpdate: function () {
        return this;
      },
      onEnd: function () {
        return this;
      },
    }),
  },
}));

describe("useFeedGesture constants", () => {
  it("SWIPE_THRESHOLD is 80", () => {
    expect(SWIPE_THRESHOLD).toBe(80);
  });

  it("GLOW_START is 20", () => {
    expect(GLOW_START).toBe(20);
  });

  it("SWIPE_THRESHOLD is greater than GLOW_START", () => {
    expect(SWIPE_THRESHOLD).toBeGreaterThan(GLOW_START);
  });
});
