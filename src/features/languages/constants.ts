// Curated, on-brand swatches the user picks from when coloring a language.
// These are stored as data on user_languages.color (theme-independent hex), so
// they live here as constants rather than Unistyles theme tokens.
//
// The default catalog of languages and their initial flag/color now live in the
// database (global_language_config), surfaced per-user through the
// user_language_catalog view — they are no longer hardcoded here.
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
