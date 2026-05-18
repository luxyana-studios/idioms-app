import { isRtlLang } from "../rtl";

describe("isRtlLang", () => {
  it("returns true for Arabic", () => {
    expect(isRtlLang("ar")).toBe(true);
  });

  it("returns false for all currently-supported non-Arabic languages", () => {
    for (const lang of [
      "en",
      "es",
      "fr",
      "de",
      "it",
      "pt",
      "zh",
      "ja",
      "ko",
      "hi",
    ]) {
      expect(isRtlLang(lang)).toBe(false);
    }
  });

  it("normalizes region-specific codes (ar-SA, ar-EG)", () => {
    expect(isRtlLang("ar-SA")).toBe(true);
    expect(isRtlLang("ar-EG")).toBe(true);
  });

  it("treats uppercase codes the same as lowercase", () => {
    expect(isRtlLang("AR")).toBe(true);
    expect(isRtlLang("EN")).toBe(false);
  });
});
