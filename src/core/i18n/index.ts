import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";

export const SUPPORTED_UI_LANGUAGES = ["en", "es", "fr", "de"] as const;

export type SupportedUiLanguage = (typeof SUPPORTED_UI_LANGUAGES)[number];

export const normalizeLanguageTag = (
  language?: string | null,
): SupportedUiLanguage => {
  const baseLanguage = language?.split("-")[0]?.toLowerCase();

  if (
    baseLanguage &&
    SUPPORTED_UI_LANGUAGES.includes(baseLanguage as SupportedUiLanguage)
  ) {
    return baseLanguage as SupportedUiLanguage;
  }

  return "en";
};

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
} as const;

const deviceLanguage = normalizeLanguageTag(getLocales()[0]?.languageCode);

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  supportedLngs: SUPPORTED_UI_LANGUAGES,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
