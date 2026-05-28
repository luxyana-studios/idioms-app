// A content language the user has chosen to explore, with their display
// customizations. Maps to a row in public.user_languages.
export interface UserLanguage {
  languageCode: string; // ISO 639-1, e.g. "es"
  color: string; // "#RRGGBB"
  flag: string; // flag emoji, e.g. "🇪🇸"
  position: number; // order in the quick-filter bar
}

// Fields a user can set when adding or editing a configured language.
export interface UserLanguageInput {
  languageCode: string;
  color: string;
  flag: string;
  position?: number;
}

// Partial edit to an already-configured language (color, flag, or order).
export type UserLanguagePatch = Partial<
  Pick<UserLanguage, "color" | "flag" | "position">
>;
