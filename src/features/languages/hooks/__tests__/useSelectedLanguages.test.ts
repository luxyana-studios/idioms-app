import { renderHook } from "@testing-library/react-native";
import type { EffectiveUserLanguage } from "../../types";

const mockUseUserLanguages = jest.fn();
jest.mock("../useUserLanguages", () => ({
  useUserLanguages: () => mockUseUserLanguages(),
}));

import { useSelectedLanguages } from "../useSelectedLanguages";

const lang = (
  overrides: Partial<EffectiveUserLanguage>,
): EffectiveUserLanguage => ({
  languageCode: "es",
  color: "#C96F4A",
  flag: "🇪🇸",
  position: 0,
  source: "user",
  ...overrides,
});

describe("useSelectedLanguages", () => {
  it("returns the effective language scope from useUserLanguages", () => {
    mockUseUserLanguages.mockReturnValue({
      languages: [
        lang({ languageCode: "en", color: "#3B5BA5", flag: "🇬🇧" }),
        lang({ languageCode: "es", color: "#C96F4A", flag: "🇪🇸" }),
      ],
      hasUserConfiguration: false,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useSelectedLanguages());

    expect(result.current.codes).toEqual(["en", "es"]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.hasUserConfiguration).toBe(false);
    expect(result.current.byCode.get("es")).toEqual({
      color: "#C96F4A",
      flag: "🇪🇸",
    });
  });

  it("marks explicit user configuration as selected", () => {
    mockUseUserLanguages.mockReturnValue({
      languages: [
        lang({ languageCode: "es", color: "#C96F4A", flag: "🇪🇸" }),
        lang({ languageCode: "fr", color: "#3B5BA5", flag: "🇫🇷", position: 1 }),
      ],
      hasUserConfiguration: true,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useSelectedLanguages());

    expect(result.current.codes).toEqual(["es", "fr"]);
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.hasUserConfiguration).toBe(true);
    expect(result.current.byCode.get("fr")).toEqual({
      color: "#3B5BA5",
      flag: "🇫🇷",
    });
  });

  it("falls back to an empty list while loading", () => {
    mockUseUserLanguages.mockReturnValue({
      languages: [],
      hasUserConfiguration: false,
      isLoading: true,
      isError: false,
    });

    const { result } = renderHook(() => useSelectedLanguages());

    expect(result.current.codes).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
