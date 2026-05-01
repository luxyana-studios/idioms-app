import { fireEvent, render, screen } from "@testing-library/react-native";
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
      },
    },
  }),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

describe("IconButton", () => {
  it("renders with the given accessibility label", () => {
    render(
      <IconButton
        icon="menu"
        onPress={jest.fn()}
        accessibilityLabel="Open menu"
      />,
    );
    expect(screen.getByLabelText("Open menu")).toBeTruthy();
  });

  it("has role button", () => {
    render(
      <IconButton
        icon="search"
        onPress={jest.fn()}
        accessibilityLabel="Search"
      />,
    );
    expect(screen.getByRole("button")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    render(
      <IconButton icon="menu" onPress={onPress} accessibilityLabel="Menu" />,
    );
    fireEvent.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders glass variant by default", () => {
    render(
      <IconButton icon="heart" onPress={jest.fn()} accessibilityLabel="Save" />,
    );
    expect(screen.getByRole("button")).toBeTruthy();
  });

  it("renders primary variant", () => {
    render(
      <IconButton
        icon="heart"
        onPress={jest.fn()}
        variant="primary"
        accessibilityLabel="Save"
      />,
    );
    expect(screen.getByRole("button")).toBeTruthy();
  });
});
