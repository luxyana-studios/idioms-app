import { renderHook } from "@testing-library/react-native";
import type { UserLanguage } from "../../types";

const mockUseUserLanguages = jest.fn();
jest.mock("../useUserLanguages", () => ({
  useUserLanguages: () => mockUseUserLanguages(),
}));

import { useSelectedLanguages } from "../useSelectedLanguages";

const lang = (overrides: Partial<UserLanguage>): UserLanguage => ({
  languageCode: "es",
  color: "#C96F4A",
  flag: "🇪🇸",
  position: 0,
  ...overrides,
});

describe("useSelectedLanguages", () => {
  it("treats an empty configuration as no selection (no filter)", () => {
    mockUseUserLanguages.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useSelectedLanguages());

    expect(result.current.codes).toEqual([]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.byCode.size).toBe(0);
  });

  it("derives ordered codes and a color/flag lookup", () => {
    mockUseUserLanguages.mockReturnValue({
      data: [
        lang({ languageCode: "es", color: "#C96F4A", flag: "🇪🇸" }),
        lang({ languageCode: "fr", color: "#3B5BA5", flag: "🇫🇷", position: 1 }),
      ],
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useSelectedLanguages());

    expect(result.current.codes).toEqual(["es", "fr"]);
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.byCode.get("fr")).toEqual({
      color: "#3B5BA5",
      flag: "🇫🇷",
    });
  });

  it("falls back to an empty list while loading", () => {
    mockUseUserLanguages.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const { result } = renderHook(() => useSelectedLanguages());

    expect(result.current.codes).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
