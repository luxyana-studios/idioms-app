import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/core/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Idiom } from "../types";

interface ToggleIdiomLikeInput {
  idiomId: string;
  isLiked: boolean;
}

interface ToggleIdiomLikeContext {
  previousLikedIds?: string[];
  previousIdioms?: Array<[readonly unknown[], Idiom[] | undefined]>;
}

const updateIdiomsLikesCount = (
  idioms: Idiom[] | undefined,
  idiomId: string,
  delta: number,
) =>
  idioms?.map((idiom) =>
    idiom.id === idiomId
      ? { ...idiom, likesCount: Math.max(idiom.likesCount + delta, 0) }
      : idiom,
  );

export const useLikedIdiomIds = () => {
  const { user, initialized } = useAuth();

  return useQuery({
    queryKey: ["idiom-likes", user?.id],
    enabled: initialized && !!user && !!process.env.EXPO_PUBLIC_SUPABASE_URL,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("idiom_likes")
        .select("idiom_id")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row) => row.idiom_id);
    },
  });
};

export const useToggleIdiomLike = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, ToggleIdiomLikeInput, ToggleIdiomLikeContext>(
    {
      mutationFn: async ({ idiomId, isLiked }) => {
        if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
          return;
        }

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

        const { error } = await supabase.from("idiom_likes").insert({
          user_id: user.id,
          idiom_id: idiomId,
        });

        if (error) throw error;
      },
      onMutate: async ({ idiomId, isLiked }) => {
        await Promise.all([
          queryClient.cancelQueries({ queryKey: ["idiom-likes", user?.id] }),
          queryClient.cancelQueries({ queryKey: ["idioms"] }),
        ]);

        const previousLikedIds = queryClient.getQueryData<string[]>([
          "idiom-likes",
          user?.id,
        ]);
        const previousIdioms = queryClient.getQueriesData<Idiom[]>({
          queryKey: ["idioms"],
        });

        queryClient.setQueryData<string[]>(
          ["idiom-likes", user?.id],
          (current = []) =>
            isLiked
              ? current.filter((likedId) => likedId !== idiomId)
              : [idiomId, ...current.filter((likedId) => likedId !== idiomId)],
        );

        queryClient.setQueriesData<Idiom[]>(
          { queryKey: ["idioms"] },
          (current) =>
            updateIdiomsLikesCount(current, idiomId, isLiked ? -1 : 1),
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
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["idiom-likes", user?.id],
          }),
          queryClient.invalidateQueries({ queryKey: ["idioms"] }),
        ]);
      },
    },
  );
};
