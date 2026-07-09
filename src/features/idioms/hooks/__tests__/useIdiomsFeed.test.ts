import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
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
import { FEED_PAGE_SIZE, useIdiomsFeed } from "../useIdiomsFeed";

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

const makeRow = (id: string) => ({
  id,
  expression: id,
  language_code: "es",
  idiomatic_meaning: "x",
  likes_count: 0,
  explanation: null,
  examples: null,
  source: "ai_mined",
  status: "published",
  created_at: "2026-01-01T00:00:00Z",
  tags: [],
  translations: [],
  equivalents: [],
});

// A full page of distinct rows so getNextPageParam keeps paging.
const fullPage = (offset: number) =>
  Array.from({ length: FEED_PAGE_SIZE }, (_, i) => makeRow(`id-${offset + i}`));

describe("useIdiomsFeed", () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockUseUserLanguages.mockReturnValue({
      languages: [language("es"), language("fr")],
      isLoading: false,
      isError: false,
    });
  });

  it("requests the first page with limit and offset 0", async () => {
    mockRpc.mockResolvedValue({ data: [makeRow("a")], error: null });

    const { result } = await renderHook(() => useIdiomsFeed(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockRpc).toHaveBeenCalledWith("get_idiom_feed", {
      p_language_codes: ["es", "fr"],
      p_ui_language: "en",
      p_limit: FEED_PAGE_SIZE,
      p_offset: 0,
    });
    // Short first page → no further pages.
    expect(result.current.hasNextPage).toBe(false);
  });

  it("fetches the next page at the next offset and flattens pages", async () => {
    mockRpc
      .mockResolvedValueOnce({ data: fullPage(0), error: null })
      .mockResolvedValueOnce({ data: [makeRow("id-10")], error: null });

    const { result } = await renderHook(() => useIdiomsFeed(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // A full first page means more may exist.
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.idioms).toHaveLength(FEED_PAGE_SIZE);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() =>
      expect(result.current.idioms).toHaveLength(FEED_PAGE_SIZE + 1),
    );
    expect(mockRpc).toHaveBeenNthCalledWith(2, "get_idiom_feed", {
      p_language_codes: ["es", "fr"],
      p_ui_language: "en",
      p_limit: FEED_PAGE_SIZE,
      p_offset: FEED_PAGE_SIZE,
    });
    // Short second page → paging stops.
    expect(result.current.hasNextPage).toBe(false);
  });

  it("waits while language state is loading", async () => {
    mockUseUserLanguages.mockReturnValue({
      languages: [language("es")],
      isLoading: true,
      isError: false,
    });

    const { result } = await renderHook(() => useIdiomsFeed(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
