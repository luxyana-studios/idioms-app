import { CardActionRow } from "../CardActionRow";

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
  useUnistyles: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

describe("CardActionRow", () => {
  it("is a function component", () => {
    expect(typeof CardActionRow).toBe("function");
  });

  it("is exported as a named export", () => {
    const { CardActionRow: exported } = require("../CardActionRow");
    expect(exported).toBeDefined();
  });
});
