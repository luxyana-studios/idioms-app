// Single source of truth for the supported UI-language code list.
// Lives in its own file so test mocks (which replace @/core/i18n) can
// import the codes without pulling the rest of the i18n module graph.

// Ordered alphabetically by Roman/English language name so the settings
// picker reads as a familiar A→Z list regardless of current UI language.
export const SUPPORTED_UI_LANGUAGES = [
  "ar", // Arabic
  "zh", // Chinese
  "en", // English
  "fr", // French
  "de", // German
  "hi", // Hindi
  "it", // Italian
  "ja", // Japanese
  "ko", // Korean
  "pt", // Portuguese
  "es", // Spanish
] as const;

export type SupportedUiLanguage = (typeof SUPPORTED_UI_LANGUAGES)[number];
