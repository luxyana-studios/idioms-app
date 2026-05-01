import { IconButton } from "../IconButton";

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
  useUnistyles: jest.fn(),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

describe("IconButton", () => {
  it("is a function component", () => {
    expect(typeof IconButton).toBe("function");
  });

  it("is exported as a named export", () => {
    const { IconButton: exported } = require("../IconButton");
    expect(exported).toBeDefined();
  });
});
