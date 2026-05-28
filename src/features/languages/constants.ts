import type { EffectiveUserLanguage, UserLanguageInput } from "./types";

export const DEFAULT_IDIOM_LANGUAGE_CODES = [
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
] as const;

// Curated, on-brand swatches the user picks from when coloring a language.
// These are stored as data on user_languages.color (theme-independent hex), so
// they live here as constants rather than Unistyles theme tokens.
export const LANGUAGE_SWATCHES = [
  "#C96F4A", // terracotta
  "#A85638", // clay
  "#D9A441", // amber
  "#7A8450", // sage
  "#3E8C84", // teal
  "#3B5BA5", // blue
  "#5B4B8A", // indigo
  "#8A4F7D", // plum
  "#C25B6E", // rose
  "#5E6B73", // slate
] as const;

// Common flag emojis offered in the flag picker grid.
export const FLAG_OPTIONS = [
  "🇬🇧",
  "🇺🇸",
  "🇪🇸",
  "🇲🇽",
  "🇦🇷",
  "🇩🇪",
  "🇫🇷",
  "🇮🇹",
  "🇵🇹",
  "🇧🇷",
  "🇨🇳",
  "🇮🇳",
  "🇸🇦",
  "🇯🇵",
  "🇰🇷",
  "🇷🇺",
  "🇳🇱",
  "🇸🇪",
  "🇵🇱",
  "🇹🇷",
  "🇬🇷",
  "🇮🇩",
  "🇻🇳",
  "🇹🇭",
] as const;

// Fallback flag/color for content languages without an explicit default below.
const FALLBACK_FLAG = "🏳️";

// Sensible per-language suggestions so adding a language is a single tap.
// Fully editable afterwards — these are only the initial values.
const DEFAULTS: Record<string, { flag: string; color: string }> = {
  en: { flag: "🇬🇧", color: "#3B5BA5" },
  es: { flag: "🇪🇸", color: "#C96F4A" },
  de: { flag: "🇩🇪", color: "#5E6B73" },
  fr: { flag: "🇫🇷", color: "#5B4B8A" },
  it: { flag: "🇮🇹", color: "#7A8450" },
  pt: { flag: "🇵🇹", color: "#3E8C84" },
  zh: { flag: "🇨🇳", color: "#C25B6E" },
  hi: { flag: "🇮🇳", color: "#D9A441" },
  ar: { flag: "🇸🇦", color: "#A85638" },
  ja: { flag: "🇯🇵", color: "#8A4F7D" },
  ko: { flag: "🇰🇷", color: "#3B5BA5" },
};

// Deterministic swatch for an unknown language code, so two unmapped languages
// get visually distinct defaults rather than all sharing one color.
const swatchForCode = (code: string): string => {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  }
  return LANGUAGE_SWATCHES[hash % LANGUAGE_SWATCHES.length];
};

// Initial color + flag to seed when the user first selects `languageCode`.
export const defaultLanguageConfig = (
  languageCode: string,
  position: number,
): UserLanguageInput => {
  const preset = DEFAULTS[languageCode];
  return {
    languageCode,
    color: preset?.color ?? swatchForCode(languageCode),
    flag: preset?.flag ?? FALLBACK_FLAG,
    position,
  };
};

export const defaultEffectiveLanguage = (
  languageCode: string,
  position: number,
): EffectiveUserLanguage => ({
  ...defaultLanguageConfig(languageCode, position),
  position,
  source: "default",
});
