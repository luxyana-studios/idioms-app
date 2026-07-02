import { fireEvent, render } from "@testing-library/react-native";
import { IconButton } from "../IconButton";

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
  useUnistyles: () => ({
    theme: {
      colors: {
        glassBtn: "rgba(255,255,255,0.75)",
        glassBtnBorder: "rgba(0,0,0,0.07)",
        primary: "#914731",
        primaryText: "#ffffff",
        textSecondary: "#6b5a54",
      },
    },
  }),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

describe("IconButton", () => {
  it("renders with the given accessibility label", async () => {
    const { getByLabelText } = await render(
      <IconButton
        icon="menu"
        onPress={jest.fn()}
        accessibilityLabel="Open menu"
      />,
    );
    expect(getByLabelText("Open menu")).toBeTruthy();
  });

  it("has role button", async () => {
    const { getByRole } = await render(
      <IconButton
        icon="search"
        onPress={jest.fn()}
        accessibilityLabel="Search"
      />,
    );
    expect(getByRole("button")).toBeTruthy();
  });

  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <IconButton icon="menu" onPress={onPress} accessibilityLabel="Menu" />,
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders glass variant by default", async () => {
    const { getByRole } = await render(
      <IconButton icon="heart" onPress={jest.fn()} accessibilityLabel="Save" />,
    );
    expect(getByRole("button")).toBeTruthy();
  });

  it("renders primary variant", async () => {
    const { getByRole } = await render(
      <IconButton
        icon="heart"
        onPress={jest.fn()}
        variant="primary"
        accessibilityLabel="Save"
      />,
    );
    expect(getByRole("button")).toBeTruthy();
  });
});
