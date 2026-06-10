import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/core/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { UserLanguageInput, UserLanguagePatch } from "../types";
import { type CatalogRow, userLanguagesKey } from "./useUserLanguages";

// Optimistic context shared by every mutation: a snapshot of the cached catalog
// to roll back to if the request fails.
type MutationContext = { previous?: CatalogRow[] };

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
  const queryKey = userLanguagesKey(user?.id);

  return useMutation<void, Error, UserLanguageInput, MutationContext>({
    mutationFn: async (input) => {
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
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CatalogRow[]>(queryKey);

      // The catalog already carries a row for every global default, so adding
      // a language usually means flipping that row's flags on (and applying the
      // chosen color/flag/position). A language that isn't in the catalog yet
      // (non-global add) is appended as a configured, user-only row.
      queryClient.setQueryData<CatalogRow[]>(queryKey, (current) => {
        const rows = current ?? [];
        if (rows.some((row) => row.languageCode === input.languageCode)) {
          return rows.map((row) =>
            row.languageCode === input.languageCode
              ? {
                  ...row,
                  color: input.color,
                  flag: input.flag,
                  position: input.position ?? row.position,
                  isConfigured: true,
                  isActive: true,
                }
              : row,
          );
        }
        return [
          ...rows,
          {
            languageCode: input.languageCode,
            color: input.color,
            flag: input.flag,
            position: input.position ?? rows.length,
            isConfigured: true,
            inGlobal: false,
            isActive: true,
          },
        ];
      });

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
};

// Update color, flag, and/or position of an already-configured language.
export const useUpdateUserLanguage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = userLanguagesKey(user?.id);

  return useMutation<
    void,
    Error,
    { languageCode: string; patch: UserLanguagePatch },
    MutationContext
  >({
    mutationFn: async ({ languageCode, patch }) => {
      const safeUser = requireUser(user);
      const { error } = await supabase
        .from("user_languages")
        .update(patch)
        .eq("user_id", safeUser.id)
        .eq("language_code", languageCode);
      if (error) throw error;
    },
    onMutate: async ({ languageCode, patch }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CatalogRow[]>(queryKey);

      // Merge the patch into the matching row so the color/flag swap is instant.
      queryClient.setQueryData<CatalogRow[]>(queryKey, (current) =>
        current?.map((row) =>
          row.languageCode === languageCode ? { ...row, ...patch } : row,
        ),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
};

// Persist a new ordering of the user's configured languages. Writes each row's
// position to match its index in `orderedCodes`, optimistically reordering the
// cache first so the list reflows instantly.
export const useReorderUserLanguages = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = userLanguagesKey(user?.id);

  return useMutation<void, Error, string[], MutationContext>({
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
      const previous = queryClient.getQueryData<CatalogRow[]>(queryKey);

      // Reposition only the reordered (configured) rows; leave the available
      // rows in the catalog untouched so they don't vanish before the refetch.
      const orderIndex = new Map(orderedCodes.map((code, i) => [code, i]));
      queryClient.setQueryData<CatalogRow[]>(queryKey, (current) =>
        current?.map((row) => {
          const index = orderIndex.get(row.languageCode);
          return index === undefined ? row : { ...row, position: index };
        }),
      );

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
  const queryKey = userLanguagesKey(user?.id);

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: async (languageCode) => {
      const safeUser = requireUser(user);
      const { error } = await supabase
        .from("user_languages")
        .delete()
        .eq("user_id", safeUser.id)
        .eq("language_code", languageCode);
      if (error) throw error;
    },
    onMutate: async (languageCode) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CatalogRow[]>(queryKey);

      // A global default stays in the catalog as addable (flags off); a user-only
      // language has no default to fall back to, so it's dropped entirely.
      queryClient.setQueryData<CatalogRow[]>(queryKey, (current) =>
        current?.flatMap((row) => {
          if (row.languageCode !== languageCode) return [row];
          return row.inGlobal
            ? [{ ...row, isConfigured: false, isActive: false }]
            : [];
        }),
      );

      return { previous };
    },
    onError: (_error, _languageCode, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
};
