// Script-aware font selection.
//
// Manrope covers Latin / Cyrillic / Vietnamese well but has no glyphs for
// CJK, Devanagari, or Arabic. For those UI languages we drop the explicit
// fontFamily and let the OS-supplied system font render (PingFang on iOS-zh,
// Hiragino on iOS-ja, Apple SD Gothic on iOS-ko, system Noto on Android,
// Geeza Pro on iOS-ar, etc.). fontWeight is still set so the system font
// is asked for the right boldness.
//
// Kept as pure functions in their own file so unit tests can import them
// without pulling native modules (Ionicons / @expo-google-fonts) through
// the dependency graph.

import { useTranslation } from "react-i18next";

export type UiFontWeight =
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extraBold";

const LATIN_UI_LANGS = new Set(["en", "es", "fr", "de", "it", "pt"]);

const MANROPE: Record<UiFontWeight, string> = {
  light: "Manrope_300Light",
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semibold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extraBold: "Manrope_800ExtraBold",
};

const NUMERIC_WEIGHT: Record<
  UiFontWeight,
  "300" | "400" | "500" | "600" | "700" | "800"
> = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extraBold: "800",
};

export function isLatinScriptLang(language: string): boolean {
  return LATIN_UI_LANGS.has(language.split("-")[0].toLowerCase());
}

export function getUiFontFamily(
  language: string,
  weight: UiFontWeight,
): string | undefined {
  return isLatinScriptLang(language) ? MANROPE[weight] : undefined;
}

export function getUiFontWeight(
  weight: UiFontWeight,
): "300" | "400" | "500" | "600" | "700" | "800" {
  return NUMERIC_WEIGHT[weight];
}

export function useUiFonts() {
  const { i18n } = useTranslation();
  return {
    family: (weight: UiFontWeight) => getUiFontFamily(i18n.language, weight),
    weight: (weight: UiFontWeight) => getUiFontWeight(weight),
  };
}
