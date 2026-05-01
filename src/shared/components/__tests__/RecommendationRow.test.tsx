import { RecommendationRow } from "../RecommendationRow";

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
  useUnistyles: jest.fn(),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

describe("RecommendationRow", () => {
  it("is a function component", () => {
    expect(typeof RecommendationRow).toBe("function");
  });

  it("is exported as a named export", () => {
    const { RecommendationRow: exported } = require("../RecommendationRow");
    expect(exported).toBeDefined();
  });
});
