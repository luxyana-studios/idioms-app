import { fireEvent, render } from "@testing-library/react-native";
import { RecommendationRow } from "../RecommendationRow";

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
  useUnistyles: () => ({
    theme: {
      colors: {
        primary: "#914731",
        primaryText: "#ffffff",
        text: "#1c1c19",
        textMuted: "#9a8880",
        textSecondary: "#6b5a54",
        surfaceContainerHighest: "#e5e2dd",
        card: "rgba(255,255,255,0.62)",
        cardBorder: "rgba(255,255,255,0.85)",
      },
    },
  }),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

jest.mock("../Typography", () => {
  const { Text } = require("react-native");
  return {
    Typography: ({ children }: { children: React.ReactNode }) => (
      <Text>{children}</Text>
    ),
  };
});

describe("RecommendationRow", () => {
  it("renders title and subtitle", async () => {
    const { getByText } = await render(
      <RecommendationRow
        icon="book"
        title="Origin Stories"
        subtitle="Learn the history"
        onPress={jest.fn()}
      />,
    );
    expect(getByText("Origin Stories")).toBeTruthy();
    expect(getByText("Learn the history")).toBeTruthy();
  });

  it("has role button with accessibility label defaulting to title", async () => {
    const { getByRole } = await render(
      <RecommendationRow
        icon="book"
        title="Origin Stories"
        subtitle="Learn the history"
        onPress={jest.fn()}
      />,
    );
    expect(getByRole("button", { name: "Origin Stories" })).toBeTruthy();
  });

  it("uses custom accessibilityLabel when provided", async () => {
    const { getByLabelText } = await render(
      <RecommendationRow
        icon="book"
        title="Origin Stories"
        subtitle="Learn the history"
        onPress={jest.fn()}
        accessibilityLabel="Go to library"
      />,
    );
    expect(getByLabelText("Go to library")).toBeTruthy();
  });

  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <RecommendationRow
        icon="flash"
        title="Quick Quiz"
        subtitle="Test yourself"
        onPress={onPress}
      />,
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders accent variant without crashing", async () => {
    const { getByText } = await render(
      <RecommendationRow
        icon="flash"
        title="Quick Quiz"
        subtitle="Test yourself"
        onPress={jest.fn()}
        variant="accent"
      />,
    );
    expect(getByText("Quick Quiz")).toBeTruthy();
  });
});
