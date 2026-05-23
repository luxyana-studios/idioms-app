import { fireEvent, render } from "@testing-library/react-native";
import type { Idiom } from "@/features/idioms/types";
import { FeedCard } from "../FeedCard";

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: { View },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
    withTiming: (v: unknown) => v,
    withSpring: (v: unknown) => v,
    runOnJS: (fn: unknown) => fn,
    Easing: { out: () => undefined, cubic: undefined },
    createAnimatedComponent: (C: unknown) => C,
  };
});
jest.mock("react-native-gesture-handler", () => ({
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
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
const mockTheme = {
  colors: {
    primary: "#914731",
    text: "#1c1c19",
    textSecondary: "#6b5a54",
    textMuted: "#9a8880",
    primaryText: "#ffffff",
    background: "#fcf9f4",
    glassBtn: "rgba(255,255,255,0.75)",
    glassBtnBorder: "rgba(0,0,0,0.07)",
    glassSurface: "rgba(255,255,255,0.78)",
    cardBorder: "rgba(255,255,255,0.85)",
    chipBg: "rgba(145,71,49,0.09)",
    chipBorder: "rgba(145,71,49,0.18)",
    blob1: "#914731",
    blob2: "#596244",
    feedSwipeLikeGlow: "rgba(89,98,68,0.18)",
    feedSwipeSkipGlow: "rgba(145,71,49,0.14)",
    feedProgressLine: "rgba(145,71,49,0.20)",
    feedProgressLineActive: "#914731",
    translationOverlayBg: "rgba(28,28,25,0.82)",
    translationOverlayText: "#fcf9f4",
    border: "#dac1bb",
    shadow: "#000",
    feedCardScrimStart: "rgba(252,249,244,0)",
    feedCardScrimEnd: "rgba(252,249,244,0.97)",
    feedTrayBg: "rgba(252,249,244,0.92)",
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48 },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    card: 20,
    "2xl": 24,
    chip: 14,
    "3xl": 32,
    full: 9999,
  },
  typography: {
    fonts: {
      sans: "Manrope_400Regular",
      sansLight: "Manrope_300Light",
      sansMedium: "Manrope_500Medium",
      sansSemibold: "Manrope_600SemiBold",
      sansBold: "Manrope_700Bold",
      sansExtraBold: "Manrope_800ExtraBold",
    },
    sizes: {
      "2xs": 10,
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
      "5xl": 38,
    },
    weights: { regular: "400", medium: "500", semibold: "600", bold: "700" },
  },
};

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: unknown) => styles,
    absoluteFillObject: {},
  },
  useUnistyles: () => ({ theme: mockTheme }),
  UnistylesRuntime: { themeName: "light" },
}));
jest.mock("expo-blur", () => ({
  BlurView: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: [], isLoading: false }),
}));
jest.mock("@/core/supabase/client", () => ({
  supabase: { from: jest.fn() },
}));
jest.mock("react-native-svg", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
  Circle: () => null,
  Defs: () => null,
  Filter: () => null,
  FeGaussianBlur: () => null,
}));
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("@/core/theme/fonts", () => ({
  useUiFonts: () => ({
    family: () => "System",
    weight: () => "400",
  }),
  useLoadFonts: () => [true, null],
}));

const mockIdiom: Idiom = {
  id: "test-1",
  expression: "Kick the bucket",
  languageCode: "en",
  idiomaticMeaning: "To die",
  explanation: "Origin story here",
  examples: ["He kicked the bucket last year."],
  tags: [{ key: "death", facet: "theme", label: "Death" }],
  source: "human",
  status: "published",
  likesCount: 0,
};

const defaultProps = {
  idiom: mockIdiom,
  currentIndex: 0,
  totalCount: 10,
  isSaved: false,
  onLike: jest.fn(),
  onNext: jest.fn(),
  onPrev: jest.fn(),
  onExpand: jest.fn(),
};

describe("FeedCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it("renders the idiom expression", () => {
    const { getByText } = render(<FeedCard {...defaultProps} />);
    expect(getByText("Kick the bucket")).toBeTruthy();
  });

  it("renders the idiom meaning", () => {
    const { getByText } = render(<FeedCard {...defaultProps} />);
    expect(getByText("To die")).toBeTruthy();
  });

  it("calls onExpand on single tap of card body after delay", () => {
    const onExpand = jest.fn();
    const { getByLabelText } = render(
      <FeedCard {...defaultProps} onExpand={onExpand} />,
    );
    fireEvent.press(getByLabelText("Kick the bucket"));
    expect(onExpand).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it("calls onLike on double-tap of card body", () => {
    const onLike = jest.fn();
    const onExpand = jest.fn();
    const { getByLabelText } = render(
      <FeedCard {...defaultProps} onLike={onLike} onExpand={onExpand} />,
    );
    const overlay = getByLabelText("Kick the bucket");
    fireEvent.press(overlay); // first tap — starts 300 ms timer
    fireEvent.press(overlay); // second tap — cancels timer, fires like
    expect(onLike).toHaveBeenCalledTimes(1);
    expect(onExpand).not.toHaveBeenCalled();
  });

  it("calls onLike when save button is pressed", () => {
    const onLike = jest.fn();
    const { getByLabelText } = render(
      <FeedCard {...defaultProps} onLike={onLike} />,
    );
    fireEvent.press(getByLabelText("home.saveIdiom"));
    expect(onLike).toHaveBeenCalledTimes(1);
  });

  it("calls onExpand when expand button is pressed", () => {
    const onExpand = jest.fn();
    const { getByLabelText } = render(
      <FeedCard {...defaultProps} onExpand={onExpand} />,
    );
    fireEvent.press(getByLabelText("home.expandIdiom"));
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it("shows saved label when isSaved is true", () => {
    const { getByLabelText } = render(<FeedCard {...defaultProps} isSaved />);
    expect(getByLabelText("home.saved")).toBeTruthy();
  });
});
