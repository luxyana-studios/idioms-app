import {
  getUiFontFamily,
  getUiFontWeight,
  isLatinScriptLang,
} from "../scriptFonts";

describe("isLatinScriptLang", () => {
  it.each([
    ["en", true],
    ["es", true],
    ["fr", true],
    ["de", true],
    ["it", true],
    ["pt", true],
    ["zh", false],
    ["ja", false],
    ["ko", false],
    ["hi", false],
    ["ar", false],
  ])("returns %s for %s", (lang, expected) => {
    expect(isLatinScriptLang(lang)).toBe(expected);
  });

  it("normalizes region-specific codes (en-US, pt-BR, zh-Hans)", () => {
    expect(isLatinScriptLang("en-US")).toBe(true);
    expect(isLatinScriptLang("pt-BR")).toBe(true);
    expect(isLatinScriptLang("zh-Hans")).toBe(false);
  });

  it("treats uppercased codes the same as lowercase", () => {
    expect(isLatinScriptLang("EN")).toBe(true);
    expect(isLatinScriptLang("AR")).toBe(false);
  });
});

describe("getUiFontFamily", () => {
  it("returns the matching Manrope variant for Latin languages", () => {
    expect(getUiFontFamily("en", "regular")).toBe("Manrope_400Regular");
    expect(getUiFontFamily("pt", "bold")).toBe("Manrope_700Bold");
    expect(getUiFontFamily("it", "extraBold")).toBe("Manrope_800ExtraBold");
  });

  it("returns undefined for non-Latin languages so the system font renders", () => {
    expect(getUiFontFamily("zh", "regular")).toBeUndefined();
    expect(getUiFontFamily("ja", "bold")).toBeUndefined();
    expect(getUiFontFamily("ko", "extraBold")).toBeUndefined();
    expect(getUiFontFamily("hi", "regular")).toBeUndefined();
    expect(getUiFontFamily("ar", "bold")).toBeUndefined();
  });
});

describe("getUiFontWeight", () => {
  it("maps every named weight to its numeric CSS value", () => {
    expect(getUiFontWeight("light")).toBe("300");
    expect(getUiFontWeight("regular")).toBe("400");
    expect(getUiFontWeight("medium")).toBe("500");
    expect(getUiFontWeight("semibold")).toBe("600");
    expect(getUiFontWeight("bold")).toBe("700");
    expect(getUiFontWeight("extraBold")).toBe("800");
  });
});
