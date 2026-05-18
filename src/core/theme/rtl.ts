// Right-to-left language detection.
//
// Kept as pure helpers in its own file so unit tests don't pull React Native
// modules (I18nManager) through the import graph. Callers that need to mutate
// the native RTL flag (settings.store.setLanguage) import I18nManager directly.

const RTL_LANGS = new Set(["ar"]);

export function isRtlLang(language: string): boolean {
  return RTL_LANGS.has(language.split("-")[0].toLowerCase());
}
