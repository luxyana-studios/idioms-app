import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/core/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { EffectiveUserLanguage, UserLanguage } from "../types";

export const userLanguagesKey = (userId?: string) =>
  ["user-languages", userId] as const;

// One row of the user_language_catalog view: the server-merged result of the
// global default catalog overlaid with the user's own config. The view owns the
// override + bootstrap policy; the client only reads the resulting flags.
export interface CatalogRow {
  languageCode: string;
  color: string;
  flag: string;
  position: number;
  isConfigured: boolean; // user has a row → active/inactive UI split
  inGlobal: boolean; // present in the default catalog → addable bucket
  isActive: boolean; // belongs to the feed content scope
}

const toUserLanguage = (row: CatalogRow): UserLanguage => ({
  languageCode: row.languageCode,
  color: row.color,
  flag: row.flag,
  position: row.position,
});

const byPosition = (a: CatalogRow, b: CatalogRow) => a.position - b.position;

// Reads the per-user merged language catalog and exposes the same derived model
// the rest of the app already consumes. All override/bootstrap logic now lives
// in the DB view, so this hook just splits the flagged rows into the active feed
// scope, the user's configured set, and the still-available defaults.
export const useUserLanguages = () => {
  const { user, initialized } = useAuth();

  const query = useQuery({
    queryKey: userLanguagesKey(user?.id),
    enabled: initialized && !!user,
    queryFn: async (): Promise<CatalogRow[]> => {
      const { data, error } = await supabase
        .from("user_language_catalog")
        .select(
          "language_code, color, flag, position, is_configured, in_global, is_active",
        )
        .order("position", { ascending: true })
        .order("language_code", { ascending: true });

      if (error) throw error;

      return (data ?? []).flatMap((row) => {
        if (row.language_code == null) return [];
        return [
          {
            languageCode: row.language_code,
            color: row.color ?? "",
            flag: row.flag ?? "",
            position: row.position ?? 0,
            isConfigured: row.is_configured ?? false,
            inGlobal: row.in_global ?? false,
            isActive: row.is_active ?? false,
          },
        ];
      });
    },
  });

  return useMemo(() => {
    const rows = query.data ?? [];

    const configuredLanguages = rows
      .filter((row) => row.isConfigured)
      .sort(byPosition)
      .map(toUserLanguage);

    const availableLanguages: EffectiveUserLanguage[] = rows
      .filter((row) => row.inGlobal && !row.isConfigured)
      .sort(byPosition)
      .map((row) => ({ ...toUserLanguage(row), source: "default" }));

    const languages: EffectiveUserLanguage[] = rows
      .filter((row) => row.isActive)
      .sort(byPosition)
      .map((row) => ({
        ...toUserLanguage(row),
        source: row.isConfigured ? "user" : "default",
      }));

    return {
      ...query,
      languages,
      configuredLanguages,
      availableLanguages,
      byCode: new Map(languages.map((lang) => [lang.languageCode, lang])),
      configuredByCode: new Map(
        configuredLanguages.map((lang) => [lang.languageCode, lang]),
      ),
      hasUserConfiguration: configuredLanguages.length > 0,
      isLoading: !initialized || query.isLoading,
    };
  }, [initialized, query]);
};
