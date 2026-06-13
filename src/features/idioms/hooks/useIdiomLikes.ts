import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/core/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Idiom } from "../types";

interface ToggleIdiomLikeInput {
  idiomId: string;
  isLiked: boolean;
}

interface ToggleIdiomLikeContext {
  previousLikedIds?: Set<string>;
  previousIdioms?: Array<[readonly unknown[], Idiom[] | undefined]>;
}

const adjustLikesCount = (
  idioms: Idiom[] | undefined,
  idiomId: string,
  delta: number,
) =>
  idioms?.map((idiom) =>
    idiom.id === idiomId
      ? { ...idiom, likesCount: Math.max(idiom.likesCount + delta, 0) }
      : idiom,
  );

const toggleInSet = (
  current: Set<string>,
  idiomId: string,
  isLiked: boolean,
) => {
  const next = new Set(current);
  if (isLiked) next.delete(idiomId);
  else next.add(idiomId);
  return next;
};

export const useLikedIdiomIds = () => {
  const { user, initialized } = useAuth();

  return useQuery({
    queryKey: ["idiom-likes", user?.id],
    enabled: initialized && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("idiom_likes")
        .select("idiom_id")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Set((data ?? []).map((row) => row.idiom_id));
    },
  });
};

export const useToggleIdiomLike = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, ToggleIdiomLikeInput, ToggleIdiomLikeContext>(
    {
      mutationFn: async ({ idiomId, isLiked }) => {
        if (!user) {
          throw new Error("You must be signed in to like an idiom.");
        }

        if (isLiked) {
          const { error } = await supabase
            .from("idiom_likes")
            .delete()
            .eq("user_id", user.id)
            .eq("idiom_id", idiomId);

          if (error) throw error;
          return;
        }

        const { error } = await supabase
          .from("idiom_likes")
          .upsert(
            { user_id: user.id, idiom_id: idiomId },
            { onConflict: "user_id,idiom_id", ignoreDuplicates: true },
          );

        // Ignore duplicate-key violations — row already exists, like is already recorded.
        // PostgREST may surface this as Postgres code "23505" or HTTP status "409".
        if (error) {
          const isDuplicate =
            error.code === "23505" ||
            error.code === "409" ||
            error.message?.includes("duplicate key") ||
            error.message?.includes("unique constraint");
          if (!isDuplicate) throw error;
        }
      },
      onMutate: async ({ idiomId, isLiked }) => {
        await Promise.all([
          queryClient.cancelQueries({ queryKey: ["idiom-likes", user?.id] }),
          queryClient.cancelQueries({ queryKey: ["idioms"] }),
        ]);

        const previousLikedIds = queryClient.getQueryData<Set<string>>([
          "idiom-likes",
          user?.id,
        ]);
        const previousIdioms = queryClient.getQueriesData<Idiom[]>({
          queryKey: ["idioms"],
        });

        queryClient.setQueryData<Set<string>>(
          ["idiom-likes", user?.id],
          (current = new Set()) => toggleInSet(current, idiomId, isLiked),
        );

        queryClient.setQueriesData<Idiom[]>(
          { queryKey: ["idioms"] },
          (current) => adjustLikesCount(current, idiomId, isLiked ? -1 : 1),
        );

        return { previousLikedIds, previousIdioms };
      },
      onError: (_error, _variables, context) => {
        queryClient.setQueryData(
          ["idiom-likes", user?.id],
          context?.previousLikedIds,
        );

        for (const [queryKey, idioms] of context?.previousIdioms ?? []) {
          queryClient.setQueryData(queryKey, idioms);
        }
      },
      onSettled: async () => {
        // Only refetch the small likes cache. likesCount in the idioms catalog
        // is patched optimistically (and rolled back on error), so the heavier
        // enriched feed is not re-downloaded on every like toggle.
        await queryClient.invalidateQueries({
          queryKey: ["idiom-likes", user?.id],
        });
      },
    },
  );
};
