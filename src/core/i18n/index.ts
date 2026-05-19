import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./ar.json";
import { SUPPORTED_UI_LANGUAGES, type SupportedUiLanguage } from "./codes";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import hi from "./hi.json";
import it from "./it.json";
import ja from "./ja.json";
import ko from "./ko.json";
import pt from "./pt.json";
import zh from "./zh.json";

export { SUPPORTED_UI_LANGUAGES, type SupportedUiLanguage };

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
  it: { translation: it },
  zh: { translation: zh },
  hi: { translation: hi },
  ar: { translation: ar },
  ja: { translation: ja },
  ko: { translation: ko },
  pt: { translation: pt },
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
