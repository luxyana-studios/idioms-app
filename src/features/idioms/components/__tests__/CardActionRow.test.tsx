import { fireEvent, render, screen } from "@testing-library/react-native";
import { CardActionRow } from "../CardActionRow";

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
  useUnistyles: () => ({
    theme: {
      colors: {
        glassBtn: "rgba(255,255,255,0.75)",
        primary: "#914731",
        primaryText: "#ffffff",
        textSecondary: "#6b5a54",
        outline: "#87736d",
      },
      radius: { full: 9999 },
    },
  }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");

describe("CardActionRow", () => {
  const defaults = {
    isSaved: false,
    onSkip: jest.fn(),
    onDetails: jest.fn(),
    onSave: jest.fn(),
  };

  it("renders three action buttons", () => {
    render(<CardActionRow {...defaults} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("shows unsaved accessibility label when isSaved is false", () => {
    render(<CardActionRow {...defaults} isSaved={false} />);
    expect(screen.getByLabelText("common.save")).toBeTruthy();
  });

  it("shows saved accessibility label when isSaved is true", () => {
    render(<CardActionRow {...defaults} isSaved />);
    expect(screen.getByLabelText("home.saved")).toBeTruthy();
  });

  it("calls onSkip when skip button is pressed", () => {
    const onSkip = jest.fn();
    render(<CardActionRow {...defaults} onSkip={onSkip} />);
    fireEvent.press(screen.getByLabelText("home.skip"));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it("calls onDetails when details button is pressed", () => {
    const onDetails = jest.fn();
    render(<CardActionRow {...defaults} onDetails={onDetails} />);
    fireEvent.press(screen.getByLabelText("home.idiomDetails"));
    expect(onDetails).toHaveBeenCalledTimes(1);
  });

  it("calls onSave when save button is pressed", () => {
    const onSave = jest.fn();
    render(<CardActionRow {...defaults} onSave={onSave} />);
    fireEvent.press(screen.getByLabelText("common.save"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
