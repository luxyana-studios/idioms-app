import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("@/core/supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from "@/core/supabase/client";
import { useIdiomTranslations } from "../useIdiomTranslations";

const mockFrom = supabase.from as jest.Mock;

function makeChain(result: { data: unknown; error: unknown }) {
  const promise = Promise.resolve(result) as Promise<typeof result> & {
    select: jest.Mock;
    eq: jest.Mock;
  };
  promise.select = jest.fn(() => promise);
  promise.eq = jest.fn(() => promise);
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

describe("useIdiomTranslations", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("is disabled when idiomId is empty", () => {
    const { result } = renderHook(() => useIdiomTranslations(""), {
      wrapper: makeWrapper(),
    });
    expect(result.current.data).toBeUndefined();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("returns empty array when no translations exist", async () => {
    mockFrom.mockReturnValueOnce(makeChain({ data: [], error: null }));

    const { result } = renderHook(() => useIdiomTranslations("idiom-1"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("maps all rows to camelCase IdiomTranslation", async () => {
    const rows = [
      {
        id: "t-1",
        idiom_id: "idiom-1",
        language_code: "es",
        literal_translation: "patear el cubo",
        idiomatic_meaning: "morir",
        explanation: null,
        source: "human",
      },
      {
        id: "t-2",
        idiom_id: "idiom-1",
        language_code: "de",
        literal_translation: "den Eimer treten",
        idiomatic_meaning: "sterben",
        explanation: "Redewendung",
        source: "ai_mined",
      },
    ];
    mockFrom.mockReturnValueOnce(makeChain({ data: rows, error: null }));

    const { result } = renderHook(() => useIdiomTranslations("idiom-1"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toMatchObject({
      id: "t-1",
      idiomId: "idiom-1",
      languageCode: "es",
      literalTranslation: "patear el cubo",
      idiomaticMeaning: "morir",
      source: "human",
    });
    expect(result.current.data?.[0].explanation).toBeUndefined();
    expect(result.current.data?.[1].explanation).toBe("Redewendung");
  });

  it("propagates database errors", async () => {
    const dbError = new Error("DB error");
    mockFrom.mockReturnValueOnce(makeChain({ data: null, error: dbError }));

    const { result } = renderHook(() => useIdiomTranslations("idiom-1"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(dbError);
  });
});
