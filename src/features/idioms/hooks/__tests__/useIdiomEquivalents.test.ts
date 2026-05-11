import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("@/core/supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from "@/core/supabase/client";
import { useIdiomEquivalents } from "../useIdiomEquivalents";

const mockFrom = supabase.from as jest.Mock;

function makeChain(result: { data: unknown; error: unknown }) {
  const promise = Promise.resolve(result) as Promise<typeof result> & {
    select: jest.Mock;
    eq: jest.Mock;
    in: jest.Mock;
  };
  promise.select = jest.fn(() => promise);
  promise.eq = jest.fn(() => promise);
  promise.in = jest.fn(() => promise);
  return promise;
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useIdiomEquivalents", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("returns empty array when idiomId is empty", () => {
    const { result } = renderHook(() => useIdiomEquivalents(""), {
      wrapper: makeWrapper(),
    });
    expect(result.current.data).toBeUndefined();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("merges equivalents from both query directions", async () => {
    const asAData = [
      {
        id: "row-1",
        idiom_id_b: "idiom-b",
        similarity_score: 0.9,
        verified: true,
      },
    ];
    const asBData = [
      {
        id: "row-2",
        idiom_id_a: "idiom-a",
        similarity_score: 0.8,
        verified: false,
      },
    ];
    const idiomsData = [
      {
        id: "idiom-b",
        expression: "kick the bucket",
        language_code: "en",
        idiomatic_meaning: "to die",
      },
      {
        id: "idiom-a",
        expression: "morder el polvo",
        language_code: "es",
        idiomatic_meaning: "to die",
      },
    ];

    mockFrom
      .mockReturnValueOnce(makeChain({ data: asAData, error: null }))
      .mockReturnValueOnce(makeChain({ data: asBData, error: null }))
      .mockReturnValueOnce(makeChain({ data: idiomsData, error: null }));

    const { result } = renderHook(() => useIdiomEquivalents("idiom-x"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].equivalentId).toBe("idiom-b");
    expect(result.current.data?.[1].equivalentId).toBe("idiom-a");
  });

  it("filters out unpublished equivalents not returned by the idioms query", async () => {
    const asAData = [
      {
        id: "row-1",
        idiom_id_b: "idiom-published",
        similarity_score: 0.9,
        verified: true,
      },
      {
        id: "row-2",
        idiom_id_b: "idiom-draft",
        similarity_score: 0.7,
        verified: false,
      },
    ];

    mockFrom
      .mockReturnValueOnce(makeChain({ data: asAData, error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(
        makeChain({
          data: [
            {
              id: "idiom-published",
              expression: "hit the road",
              language_code: "en",
              idiomatic_meaning: "to leave",
            },
          ],
          error: null,
        }),
      );

    const { result } = renderHook(() => useIdiomEquivalents("idiom-x"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].equivalentId).toBe("idiom-published");
  });

  it("propagates errors from the first equivalents query", async () => {
    const dbError = new Error("DB error A");
    mockFrom
      .mockReturnValueOnce(makeChain({ data: null, error: dbError }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }));

    const { result } = renderHook(() => useIdiomEquivalents("idiom-x"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(dbError);
  });

  it("propagates errors from the second equivalents query", async () => {
    const dbError = new Error("DB error B");
    mockFrom
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: dbError }));

    const { result } = renderHook(() => useIdiomEquivalents("idiom-x"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(dbError);
  });

  it("returns empty array when no equivalents exist", async () => {
    mockFrom
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }));

    const { result } = renderHook(() => useIdiomEquivalents("idiom-x"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
