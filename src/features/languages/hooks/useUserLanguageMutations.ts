import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/core/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type {
  UserLanguage,
  UserLanguageInput,
  UserLanguagePatch,
} from "../types";
import { userLanguagesKey } from "./useUserLanguages";

const requireUser = (user: { id: string } | null) => {
  if (!user) {
    throw new Error("You must be signed in to configure languages.");
  }
  return user;
};

// Add a language to the user's content scope, or update its config if it's
// already there (upsert on the (user_id, language_code) unique key).
export const useAddUserLanguage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: UserLanguageInput) => {
      const safeUser = requireUser(user);
      const { error } = await supabase.from("user_languages").upsert(
        {
          user_id: safeUser.id,
          language_code: input.languageCode,
          color: input.color,
          flag: input.flag,
          position: input.position ?? 0,
        },
        { onConflict: "user_id,language_code" },
      );
      if (error) throw error;
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: userLanguagesKey(user?.id) }),
  });
};

// Update color, flag, and/or position of an already-configured language.
export const useUpdateUserLanguage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      languageCode,
      patch,
    }: {
      languageCode: string;
      patch: UserLanguagePatch;
    }) => {
      const safeUser = requireUser(user);
      const { error } = await supabase
        .from("user_languages")
        .update(patch)
        .eq("user_id", safeUser.id)
        .eq("language_code", languageCode);
      if (error) throw error;
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: userLanguagesKey(user?.id) }),
  });
};

// Persist a new ordering of the user's configured languages. Writes each row's
// position to match its index in `orderedCodes`, optimistically reordering the
// cache first so the list reflows instantly.
export const useReorderUserLanguages = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = userLanguagesKey(user?.id);

  return useMutation<void, Error, string[], { previous?: UserLanguage[] }>({
    mutationFn: async (orderedCodes) => {
      const safeUser = requireUser(user);
      await Promise.all(
        orderedCodes.map(async (code, index) => {
          const { error } = await supabase
            .from("user_languages")
            .update({ position: index })
            .eq("user_id", safeUser.id)
            .eq("language_code", code);
          if (error) throw error;
        }),
      );
    },
    onMutate: async (orderedCodes) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UserLanguage[]>(queryKey);

      queryClient.setQueryData<UserLanguage[]>(queryKey, (current) => {
        if (!current) return current;
        const byCode = new Map(
          current.map((lang) => [lang.languageCode, lang]),
        );
        return orderedCodes.flatMap((code, index) => {
          const lang = byCode.get(code);
          return lang ? [{ ...lang, position: index }] : [];
        });
      });

      return { previous };
    },
    onError: (_error, _orderedCodes, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
};

// Remove a language from the user's content scope.
export const useRemoveUserLanguage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (languageCode: string) => {
      const safeUser = requireUser(user);
      const { error } = await supabase
        .from("user_languages")
        .delete()
        .eq("user_id", safeUser.id)
        .eq("language_code", languageCode);
      if (error) throw error;
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: userLanguagesKey(user?.id) }),
  });
};
