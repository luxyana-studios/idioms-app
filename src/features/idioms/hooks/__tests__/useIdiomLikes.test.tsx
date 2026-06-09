import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import type { Idiom } from "../../types";

jest.mock("@/core/supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

const mockUseAuth = jest.fn();
jest.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

import { supabase } from "@/core/supabase/client";
import { useLikedIdiomIds, useToggleIdiomLike } from "../useIdiomLikes";

const mockFrom = supabase.from as jest.Mock;

const makeSelectChain = (result: { data: unknown; error: unknown }) => {
  const promise = Promise.resolve(result) as Promise<typeof result> & {
    select: jest.Mock;
    order: jest.Mock;
  };
  promise.select = jest.fn(() => promise);
  promise.order = jest.fn(() => promise);
  return promise;
};

const makeUpsertChain = (result: { error: unknown }) => ({
  upsert: jest.fn(() => Promise.resolve(result)),
});

const makeDeleteChain = (result: { error: unknown }) => {
  const promise = Promise.resolve(result) as Promise<typeof result> & {
    delete: jest.Mock;
    eq: jest.Mock;
  };
  promise.delete = jest.fn(() => promise);
  promise.eq = jest.fn(() => promise);
  return promise;
};

const makeIdiom = (id: string, likesCount = 0): Idiom => ({
  id,
  expression: id,
  languageCode: "en",
  idiomaticMeaning: "x",
  likesCount,
  tags: [],
  translations: [],
  equivalents: [],
  source: "human",
  status: "published",
});

const makeWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe("useLikedIdiomIds", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      initialized: true,
    });
  });

  it("returns a Set of liked idiom ids", async () => {
    mockFrom.mockReturnValue(
      makeSelectChain({
        data: [{ idiom_id: "a" }, { idiom_id: "b" }],
        error: null,
      }),
    );

    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useLikedIdiomIds(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeInstanceOf(Set);
    expect(result.current.data?.has("a")).toBe(true);
    expect(result.current.data?.has("b")).toBe(true);
    expect(result.current.data?.size).toBe(2);
  });

  it("is disabled when there is no user", () => {
    mockUseAuth.mockReturnValue({ user: null, initialized: true });

    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useLikedIdiomIds(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("useToggleIdiomLike", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      initialized: true,
    });
  });

  it("optimistically adds to the liked set and increments likesCount", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(["idiom-likes", "user-1"], new Set<string>());
    queryClient.setQueryData(["idioms", "en"], [makeIdiom("idiom-1", 3)]);

    mockFrom.mockImplementation(() => makeUpsertChain({ error: null }));

    const { result } = renderHook(() => useToggleIdiomLike(), {
      wrapper: makeWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        idiomId: "idiom-1",
        isLiked: false,
      });
    });

    const liked = queryClient.getQueryData<Set<string>>([
      "idiom-likes",
      "user-1",
    ]);
    expect(liked?.has("idiom-1")).toBe(true);

    const idioms = queryClient.getQueryData<Idiom[]>(["idioms", "en"]);
    expect(idioms?.[0].likesCount).toBe(4);
  });

  it("optimistically removes from the liked set and decrements likesCount", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(
      ["idiom-likes", "user-1"],
      new Set<string>(["idiom-1"]),
    );
    queryClient.setQueryData(["idioms", "en"], [makeIdiom("idiom-1", 5)]);

    mockFrom.mockImplementation(() => makeDeleteChain({ error: null }));

    const { result } = renderHook(() => useToggleIdiomLike(), {
      wrapper: makeWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        idiomId: "idiom-1",
        isLiked: true,
      });
    });

    const liked = queryClient.getQueryData<Set<string>>([
      "idiom-likes",
      "user-1",
    ]);
    expect(liked?.has("idiom-1")).toBe(false);

    const idioms = queryClient.getQueryData<Idiom[]>(["idioms", "en"]);
    expect(idioms?.[0].likesCount).toBe(4);
  });

  it("rolls back optimistic state when the mutation fails", async () => {
    const queryClient = makeQueryClient();
    const initialLikes = new Set<string>();
    const initialIdioms = [makeIdiom("idiom-1", 3)];
    queryClient.setQueryData(["idiom-likes", "user-1"], initialLikes);
    queryClient.setQueryData(["idioms", "en"], initialIdioms);

    mockFrom.mockImplementation(() =>
      makeUpsertChain({ error: { message: "boom" } }),
    );

    const { result } = renderHook(() => useToggleIdiomLike(), {
      wrapper: makeWrapper(queryClient),
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          idiomId: "idiom-1",
          isLiked: false,
        });
      } catch {
        // expected
      }
    });

    const liked = queryClient.getQueryData<Set<string>>([
      "idiom-likes",
      "user-1",
    ]);
    expect(liked?.has("idiom-1")).toBe(false);

    const idioms = queryClient.getQueryData<Idiom[]>(["idioms", "en"]);
    expect(idioms?.[0].likesCount).toBe(3);
  });

  it("throws when no user is signed in", async () => {
    mockUseAuth.mockReturnValue({ user: null, initialized: true });

    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useToggleIdiomLike(), {
      wrapper: makeWrapper(queryClient),
    });

    await expect(
      result.current.mutateAsync({ idiomId: "idiom-1", isLiked: false }),
    ).rejects.toThrow(/signed in/);
  });
});
