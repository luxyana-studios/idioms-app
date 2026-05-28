export type Language =
  | "en"
  | "es"
  | "de"
  | "fr"
  | "it"
  | "pt"
  | "zh"
  | "ja"
  | "ko"
  | "hi"
  | "ar";

export const LANGUAGES = [
  "en",
  "es",
  "de",
  "fr",
  "it",
  "pt",
  "zh",
  "ja",
  "ko",
  "hi",
  "ar",
] as const;

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  hi: "Hindi",
  ar: "Arabic",
};

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

export type ExpressionRow = {
  id: string;
  language: Language;
  expression: string;
  expression_key: string;
  status: "seed" | "discovered" | "enriched" | "promoted" | "rejected";
};

export type RunRow = {
  id: string;
  job: string;
  params: Record<string, unknown>;
  status: "running" | "succeeded" | "failed";
};
