import {
  DEFAULT_IDIOM_LANGUAGE_CODES,
  defaultEffectiveLanguage,
  defaultLanguageConfig,
  FLAG_OPTIONS,
  LANGUAGE_SWATCHES,
} from "../constants";

describe("defaultLanguageConfig", () => {
  it("returns the preset color and flag for a known language", () => {
    expect(defaultLanguageConfig("es", 0)).toEqual({
      languageCode: "es",
      color: "#C96F4A",
      flag: "🇪🇸",
      position: 0,
    });
  });

  it("passes the supplied position through", () => {
    expect(defaultLanguageConfig("fr", 3).position).toBe(3);
  });

  it("falls back to a palette swatch and neutral flag for unknown codes", () => {
    const config = defaultLanguageConfig("xx", 0);
    expect(LANGUAGE_SWATCHES).toContain(config.color);
    expect(config.flag).toBe("🏳️");
  });

  it("is deterministic for the same unknown code", () => {
    expect(defaultLanguageConfig("xx", 0).color).toBe(
      defaultLanguageConfig("xx", 5).color,
    );
  });

  it("offers only flag emojis in the picker options", () => {
    expect(FLAG_OPTIONS.length).toBeGreaterThan(0);
    for (const flag of FLAG_OPTIONS) {
      expect(flag).toMatch(/\p{Regional_Indicator}{2}/u);
    }
  });

  it("declares the frontend default idiom language catalog", () => {
    expect(DEFAULT_IDIOM_LANGUAGE_CODES).toEqual([
      "en",
      "es",
      "de",
      "fr",
      "it",
      "pt",
      "zh",
      "hi",
      "ar",
      "ja",
      "ko",
    ]);
  });

  it("builds default effective language entries", () => {
    expect(defaultEffectiveLanguage("es", 2)).toEqual({
      languageCode: "es",
      color: "#C96F4A",
      flag: "🇪🇸",
      position: 2,
      source: "default",
    });
  });
});
