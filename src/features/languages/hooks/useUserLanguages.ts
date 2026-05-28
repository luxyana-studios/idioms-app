import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/core/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { UserLanguage } from "../types";

export const userLanguagesKey = (userId?: string) =>
  ["user-languages", userId] as const;

// Fetches the user's configured content languages, ordered for the
// quick-filter bar. Returns [] for signed-out / unconfigured users, which the
// app treats as "no filter — show all languages" until onboarding lands.
export const useUserLanguages = () => {
  const { user, initialized } = useAuth();

  return useQuery({
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
};
