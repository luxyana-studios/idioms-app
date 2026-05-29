import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/core/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  DEFAULT_IDIOM_LANGUAGE_CODES,
  defaultEffectiveLanguage,
} from "../constants";
import type { EffectiveUserLanguage, UserLanguage } from "../types";

export const userLanguagesKey = (userId?: string) =>
  ["user-languages", userId] as const;

const asUserEffectiveLanguage = (
  language: UserLanguage,
): EffectiveUserLanguage => ({
  ...language,
  source: "user",
});

// Fetches the user's persisted content-language rows and derives the effective
// idiom-language model. Empty user configuration falls back to the frontend
// default catalog, while configured/available expose the true persisted split.
export const useUserLanguages = () => {
  const { user, initialized } = useAuth();

  const query = useQuery({
    queryKey: userLanguagesKey(user?.id),
    enabled: initialized && !!user,
    queryFn: async (): Promise<UserLanguage[]> => {
      const { data, error } = await supabase
        .from("user_languages")
        .select("language_code, color, flag, position")
        .order("position", { ascending: true })
        .order("language_code", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((row) => ({
        languageCode: row.language_code,
        color: row.color,
        flag: row.flag,
        position: row.position,
      }));
    },
  });

  return useMemo(() => {
    const configuredLanguages = query.data ?? [];
    const configuredCodes = new Set(
      configuredLanguages.map((lang) => lang.languageCode),
    );
    const hasUserConfiguration = configuredLanguages.length > 0;

    const defaultLanguages = DEFAULT_IDIOM_LANGUAGE_CODES.map((code, index) =>
      defaultEffectiveLanguage(code, index),
    );
    const availableLanguages = defaultLanguages.filter(
      (lang) => !configuredCodes.has(lang.languageCode),
    );
    const languages: EffectiveUserLanguage[] = hasUserConfiguration
      ? configuredLanguages.map(asUserEffectiveLanguage)
      : defaultLanguages;

    return {
      ...query,
      languages,
      configuredLanguages,
      availableLanguages,
      byCode: new Map(languages.map((lang) => [lang.languageCode, lang])),
      configuredByCode: new Map(
        configuredLanguages.map((lang) => [lang.languageCode, lang]),
      ),
      hasUserConfiguration,
      isLoading: !initialized || query.isLoading,
    };
  }, [initialized, query]);
};
