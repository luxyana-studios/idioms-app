import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: "en" } }),
}));

jest.mock("@/core/supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

const mockUseUserLanguages = jest.fn();
jest.mock("@/features/languages/hooks/useUserLanguages", () => ({
  useUserLanguages: () => mockUseUserLanguages(),
}));

import { supabase } from "@/core/supabase/client";
import { useIdioms } from "../useIdioms";

const mockFrom = supabase.from as jest.Mock;

function makeChain(result: { data: unknown; error: unknown }) {
  const promise = Promise.resolve(result) as Promise<typeof result> & {
    select: jest.Mock;
    in: jest.Mock;
    order: jest.Mock;
  };
  promise.select = jest.fn(() => promise);
  promise.in = jest.fn(() => promise);
  promise.order = jest.fn(() => promise);
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

const language = (languageCode: string) => ({ languageCode });

describe("useIdioms", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockUseUserLanguages.mockReturnValue({
      languages: [language("es"), language("fr")],
      isLoading: false,
      isError: false,
    });
  });

  it("scopes idiom fetches to effective language codes", async () => {
    const chain = makeChain({ data: [], error: null });
    mockFrom.mockReturnValueOnce(chain);

    const { result } = renderHook(() => useIdioms(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(chain.in).toHaveBeenCalledWith("language_code", ["es", "fr"]);
  });

  it("does not apply a language filter when no effective languages exist", async () => {
    mockUseUserLanguages.mockReturnValue({
      languages: [],
      isLoading: false,
      isError: false,
    });
    const chain = makeChain({ data: [], error: null });
    mockFrom.mockReturnValueOnce(chain);

    const { result } = renderHook(() => useIdioms(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(chain.in).not.toHaveBeenCalled();
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
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("maps idiom rows to app types", async () => {
    const rows = [
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
        idiom_tags: [
          {
            tags: {
              key: "ease",
              facet: "meaning",
              tag_translations: [{ language_code: "en", label: "Ease" }],
            },
          },
        ],
      },
    ];
    mockFrom.mockReturnValueOnce(makeChain({ data: rows, error: null }));

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
  });

  it("sorts mapped idioms by effective language order", async () => {
    mockUseUserLanguages.mockReturnValue({
      languages: [language("fr"), language("es")],
      isLoading: false,
      isError: false,
    });
    mockFrom.mockReturnValueOnce(
      makeChain({
        data: [
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
            idiom_tags: [],
          },
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
            idiom_tags: [],
          },
        ],
        error: null,
      }),
    );

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
