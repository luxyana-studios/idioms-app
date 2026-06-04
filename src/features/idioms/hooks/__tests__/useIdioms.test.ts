import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: "en" } }),
}));

jest.mock("@/core/supabase/client", () => ({
  supabase: { rpc: jest.fn() },
}));

const mockUseUserLanguages = jest.fn();
jest.mock("@/features/languages/hooks/useUserLanguages", () => ({
  useUserLanguages: () => mockUseUserLanguages(),
}));

import { supabase } from "@/core/supabase/client";
import { useIdioms } from "../useIdioms";

const mockRpc = supabase.rpc as unknown as jest.Mock;

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

const language = (languageCode: string) => ({ languageCode });

describe("useIdioms", () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockRpc.mockResolvedValue({ data: [], error: null });
    mockUseUserLanguages.mockReturnValue({
      languages: [language("es"), language("fr")],
      isLoading: false,
      isError: false,
    });
  });

  it("calls get_idiom_feed with the ordered language scope and UI language", async () => {
    const { result } = renderHook(() => useIdioms(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockRpc).toHaveBeenCalledWith("get_idiom_feed", {
      p_language_codes: ["es", "fr"],
      p_ui_language: "en",
    });
  });

  it("passes an empty language array when no languages are configured", async () => {
    mockUseUserLanguages.mockReturnValue({
      languages: [],
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useIdioms(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockRpc).toHaveBeenCalledWith("get_idiom_feed", {
      p_language_codes: [],
      p_ui_language: "en",
    });
  });

  it("waits while language state is loading", () => {
    mockUseUserLanguages.mockReturnValue({
      languages: [language("es")],
      isLoading: true,
      isError: false,
    });

    const { result } = renderHook(() => useIdioms(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("maps RPC rows, including nested tags, translations, and equivalents", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          id: "idiom-1",
          expression: "pan comido",
          language_code: "es",
          idiomatic_meaning: "algo fácil",
          likes_count: 3,
          explanation: null,
          examples: ["Es pan comido."],
          source: "ai_mined",
          status: "published",
          created_at: "2026-01-01T00:00:00Z",
          tags: [{ key: "ease", facet: "meaning", label: "Ease" }],
          translations: [
            {
              id: "tr-1",
              idiomId: "idiom-1",
              languageCode: "en",
              literalTranslation: "eaten bread",
              idiomaticMeaning: "a piece of cake",
              explanation: null,
              source: "ai_mined",
            },
          ],
          equivalents: [
            {
              edgeId: "edge-1",
              equivalentId: "idiom-2",
              expression: "a piece of cake",
              languageCode: "en",
              idiomaticMeaning: "very easy",
              similarityScore: "0.90",
              verified: true,
            },
          ],
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useIdioms(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0]).toMatchObject({
      id: "idiom-1",
      expression: "pan comido",
      languageCode: "es",
      idiomaticMeaning: "algo fácil",
      likesCount: 3,
      examples: ["Es pan comido."],
      tags: [{ key: "ease", facet: "meaning", label: "Ease" }],
      source: "ai_mined",
      status: "published",
    });
    expect(result.current.data?.[0].translations).toEqual([
      {
        id: "tr-1",
        idiomId: "idiom-1",
        languageCode: "en",
        literalTranslation: "eaten bread",
        idiomaticMeaning: "a piece of cake",
        explanation: undefined,
        source: "ai_mined",
      },
    ]);
    // numeric similarity_score arrives as a string and is coerced to a number.
    expect(result.current.data?.[0].equivalents[0]).toMatchObject({
      edgeId: "edge-1",
      equivalentId: "idiom-2",
      similarityScore: 0.9,
      verified: true,
    });
  });

  it("preserves the order returned by the RPC", async () => {
    mockUseUserLanguages.mockReturnValue({
      languages: [language("fr"), language("es")],
      isLoading: false,
      isError: false,
    });
    mockRpc.mockResolvedValue({
      data: [
        {
          id: "fr-1",
          expression: "c'est du gâteau",
          language_code: "fr",
          idiomatic_meaning: "facile",
          likes_count: 0,
          explanation: null,
          examples: null,
          source: "ai_mined",
          status: "published",
          created_at: "2026-01-01T00:00:00Z",
          tags: [],
          translations: [],
          equivalents: [],
        },
        {
          id: "es-1",
          expression: "pan comido",
          language_code: "es",
          idiomatic_meaning: "fácil",
          likes_count: 0,
          explanation: null,
          examples: null,
          source: "ai_mined",
          status: "published",
          created_at: "2026-01-01T00:00:00Z",
          tags: [],
          translations: [],
          equivalents: [],
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useIdioms(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.map((idiom) => idiom.id)).toEqual([
      "fr-1",
      "es-1",
    ]);
  });
});
