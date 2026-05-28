import { fireEvent, render } from "@testing-library/react-native";

jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles: unknown) => styles,
    absoluteFillObject: {},
  },
  useUnistyles: () => ({ theme: { colors: {}, spacing: {}, radius: {} } }),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("@/shared/components/Typography", () => {
  const react = require("react");
  const { Text } = require("react-native");
  return {
    Typography: ({ children }: { children: unknown }) =>
      react.createElement(Text, null, children),
  };
});

const mockUseUserLanguages = jest.fn();
jest.mock("../../hooks/useUserLanguages", () => ({
  useUserLanguages: () => mockUseUserLanguages(),
}));

const mockAddMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockRemoveMutate = jest.fn();
const mockReorderMutate = jest.fn();
jest.mock("../../hooks/useUserLanguageMutations", () => ({
  useAddUserLanguage: () => ({ mutate: mockAddMutate }),
  useUpdateUserLanguage: () => ({ mutate: mockUpdateMutate }),
  useRemoveUserLanguage: () => ({ mutate: mockRemoveMutate }),
  useReorderUserLanguages: () => ({ mutate: mockReorderMutate }),
}));

// Lightweight row stand-in: exposes the wired callbacks as pressables so the
// list's orchestration (ordering + handler wiring) can be exercised without
// pulling in the picker modals. Uses createElement (not JSX) because the
// jest.mock factory is hoisted above imports.
jest.mock("../LanguageConfigRow", () => {
  const react = require("react");
  const { Pressable, View } = require("react-native");
  return {
    LanguageConfigRow: ({
      code,
      onToggle,
      onSetColor,
      onDragByRows,
    }: {
      code: string;
      onToggle: (c: string) => void;
      onSetColor: (c: string, color: string) => void;
      onDragByRows: (c: string, rowDelta: number) => void;
    }) =>
      react.createElement(View, { testID: `row-${code}` }, [
        react.createElement(Pressable, {
          key: "toggle",
          testID: `toggle-${code}`,
          onPress: () => onToggle(code),
        }),
        react.createElement(Pressable, {
          key: "color",
          testID: `color-${code}`,
          onPress: () => onSetColor(code, "#000000"),
        }),
        react.createElement(Pressable, {
          key: "dragdown",
          testID: `dragdown-${code}`,
          onPress: () => onDragByRows(code, 1),
        }),
      ]),
  };
});

import { LanguageConfigList } from "../LanguageConfigList";

const language = (code: string, color: string, flag: string, position = 0) => ({
  languageCode: code,
  color,
  flag,
  position,
});

const languageState = ({
  configured,
  available,
}: {
  configured: Array<ReturnType<typeof language>>;
  available: Array<ReturnType<typeof language> & { source: "default" }>;
}) => ({
  configuredLanguages: configured,
  configuredByCode: new Map(
    configured.map((lang) => [lang.languageCode, lang]),
  ),
  availableLanguages: available,
  isLoading: false,
  isError: false,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseUserLanguages.mockReturnValue(
    languageState({
      configured: [language("es", "#C96F4A", "🇪🇸")],
      available: [
        { ...language("fr", "#5B4B8A", "🇫🇷", 1), source: "default" },
        { ...language("en", "#3B5BA5", "🇬🇧", 2), source: "default" },
      ],
    }),
  );
});

describe("LanguageConfigList", () => {
  it("renders selected languages first, then remaining available ones", () => {
    const { getAllByTestId } = render(<LanguageConfigList />);
    const order = getAllByTestId(/^row-/).map((node) => node.props.testID);
    expect(order).toEqual(["row-es", "row-fr", "row-en"]);
  });

  it("adds an unselected language with its suggested defaults", () => {
    const { getByTestId } = render(<LanguageConfigList />);
    fireEvent.press(getByTestId("toggle-fr"));
    expect(mockAddMutate).toHaveBeenCalledWith({
      languageCode: "fr",
      color: "#5B4B8A",
      flag: "🇫🇷",
      position: 1,
    });
  });

  it("removes an already-selected language", () => {
    const { getByTestId } = render(<LanguageConfigList />);
    fireEvent.press(getByTestId("toggle-es"));
    expect(mockRemoveMutate).toHaveBeenCalledWith("es");
  });

  it("updates color via the update mutation", () => {
    const { getByTestId } = render(<LanguageConfigList />);
    fireEvent.press(getByTestId("color-es"));
    expect(mockUpdateMutate).toHaveBeenCalledWith({
      languageCode: "es",
      patch: { color: "#000000" },
    });
  });

  it("reorders by swapping adjacent selected languages", () => {
    mockUseUserLanguages.mockReturnValue(
      languageState({
        configured: [
          language("es", "#C96F4A", "🇪🇸"),
          language("fr", "#5B4B8A", "🇫🇷", 1),
        ],
        available: [],
      }),
    );
    const { getByTestId } = render(<LanguageConfigList />);
    fireEvent.press(getByTestId("dragdown-es"));
    expect(mockReorderMutate).toHaveBeenCalledWith(["fr", "es"]);
  });

  it("shows the empty state when nothing is available", () => {
    mockUseUserLanguages.mockReturnValue(
      languageState({ configured: [], available: [] }),
    );
    const { getByText } = render(<LanguageConfigList />);
    expect(getByText("languages.empty")).toBeTruthy();
  });
});
