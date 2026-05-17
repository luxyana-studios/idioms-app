export type Language = "en" | "es" | "de" | "fr";

export const LANGUAGES = ["en", "es", "de", "fr"] as const;

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
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
