import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("@/core/supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

import { supabase } from "@/core/supabase/client";
import { useIdiomTranslation } from "../useIdiomTranslation";

const mockFrom = supabase.from as jest.Mock;

function makeChain(result: { data: unknown; error: unknown }) {
  const promise = Promise.resolve(result) as Promise<typeof result> & {
    select: jest.Mock;
    eq: jest.Mock;
    maybeSingle: jest.Mock;
  };
  promise.select = jest.fn(() => promise);
  promise.eq = jest.fn(() => promise);
  promise.maybeSingle = jest.fn(() => Promise.resolve(result));
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

describe("useIdiomTranslation", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("is disabled when languageCode is null", () => {
    const { result } = renderHook(() => useIdiomTranslation("idiom-1", null), {
      wrapper: makeWrapper(),
    });
    expect(result.current.data).toBeUndefined();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("is disabled when idiomId is empty", () => {
    const { result } = renderHook(() => useIdiomTranslation("", "es"), {
      wrapper: makeWrapper(),
    });
    expect(result.current.data).toBeUndefined();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("returns null when no translation exists for the language", async () => {
    mockFrom.mockReturnValueOnce(makeChain({ data: null, error: null }));

    const { result } = renderHook(() => useIdiomTranslation("idiom-1", "es"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("maps snake_case DB columns to camelCase IdiomTranslation", async () => {
    const row = {
      id: "trans-1",
      idiom_id: "idiom-1",
      language_code: "es",
      literal_translation: "patear el cubo",
      idiomatic_meaning: "morir",
      explanation: "Origen incierto",
      source: "human",
    };
    mockFrom.mockReturnValueOnce(makeChain({ data: row, error: null }));

    const { result } = renderHook(() => useIdiomTranslation("idiom-1", "es"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      id: "trans-1",
      idiomId: "idiom-1",
      languageCode: "es",
      literalTranslation: "patear el cubo",
      idiomaticMeaning: "morir",
      explanation: "Origen incierto",
      source: "human",
    });
  });

  it("omits explanation when null in DB", async () => {
    const row = {
      id: "trans-2",
      idiom_id: "idiom-1",
      language_code: "de",
      literal_translation: "den Eimer treten",
      idiomatic_meaning: "sterben",
      explanation: null,
      source: "ai_mined",
    };
    mockFrom.mockReturnValueOnce(makeChain({ data: row, error: null }));

    const { result } = renderHook(() => useIdiomTranslation("idiom-1", "de"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.explanation).toBeUndefined();
  });

  it("propagates database errors", async () => {
    const dbError = new Error("DB error");
    mockFrom.mockReturnValueOnce(makeChain({ data: null, error: dbError }));

    const { result } = renderHook(() => useIdiomTranslation("idiom-1", "es"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(dbError);
  });
});
