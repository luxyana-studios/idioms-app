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
    isLiked: false,
    onSkip: jest.fn(),
    onDetails: jest.fn(),
    onToggleLike: jest.fn(),
  };

  it("renders three action buttons", () => {
    render(<CardActionRow {...defaults} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("shows like accessibility label when isLiked is false", () => {
    render(<CardActionRow {...defaults} isLiked={false} />);
    expect(screen.getByLabelText("common.like")).toBeTruthy();
  });

  it("shows unlike accessibility label when isLiked is true", () => {
    render(<CardActionRow {...defaults} isLiked />);
    expect(screen.getByLabelText("common.unlike")).toBeTruthy();
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

  it("calls onToggleLike when like button is pressed", () => {
    const onToggleLike = jest.fn();
    render(<CardActionRow {...defaults} onToggleLike={onToggleLike} />);
    fireEvent.press(screen.getByLabelText("common.like"));
    expect(onToggleLike).toHaveBeenCalledTimes(1);
  });

  it("calls onToggleLike when liked-state button is pressed (unlike path)", () => {
    const onToggleLike = jest.fn();
    render(<CardActionRow {...defaults} isLiked onToggleLike={onToggleLike} />);
    fireEvent.press(screen.getByLabelText("common.unlike"));
    expect(onToggleLike).toHaveBeenCalledTimes(1);
  });

  it("does not call onToggleLike when disabled", () => {
    const onToggleLike = jest.fn();
    render(
      <CardActionRow {...defaults} disabled onToggleLike={onToggleLike} />,
    );
    fireEvent.press(screen.getByLabelText("common.like"));
    expect(onToggleLike).not.toHaveBeenCalled();
  });
});
