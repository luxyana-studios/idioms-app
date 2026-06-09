import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";

jest.mock("@/core/supabase/client", () => ({
  supabase: { rpc: jest.fn() },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: "en" } }),
}));

import { supabase } from "@/core/supabase/client";
import { useSurpriseIdiom } from "../useSurpriseIdiom";

const mockRpc = supabase.rpc as jest.Mock;

const makeIdiomRow = (id: string) => ({
  id,
  expression: "kick the bucket",
  language_code: "en",
  idiomatic_meaning: "to die",
  likes_count: 5,
  explanation: null,
  examples: null,
  source: "common",
  status: "published",
  idiom_tags: [],
});

const makeRpcChain = (rows: unknown[]) => {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn(() => Promise.resolve({ data: rows, error: null }));
  return chain;
};

const makeRpcChainError = (error: unknown) => {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn(() => Promise.resolve({ data: null, error }));
  return chain;
};

let queryClient: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  jest.clearAllMocks();
  // Deterministic shuffle: Math.random() → 0.9999 makes j = i in Fisher-Yates,
  // so no elements are swapped and insertion order is preserved.
  jest.spyOn(Math, "random").mockReturnValue(0.9999);
});

afterEach(() => {
  queryClient.clear();
  jest.restoreAllMocks();
});

describe("useSurpriseIdiom", () => {
  it("fetches a batch on mount and shows the first idiom", async () => {
    mockRpc.mockReturnValue(
      makeRpcChain([makeIdiomRow("id-1"), makeIdiomRow("id-2")]),
    );

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });

    await waitFor(() => expect(result.current.idiom?.id).toBe("id-1"));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(mockRpc).toHaveBeenCalledWith("get_random_idioms", {
      batch_size: 20,
      exclude_ids: [],
    });
  });

  it("advances cursor in memory without a network call", async () => {
    mockRpc.mockReturnValue(
      makeRpcChain([
        makeIdiomRow("id-1"),
        makeIdiomRow("id-2"),
        makeIdiomRow("id-3"),
      ]),
    );

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });
    await waitFor(() => expect(result.current.idiom?.id).toBe("id-1"));

    const callsBefore = mockRpc.mock.calls.length;

    await act(async () => {
      result.current.rollAgain();
    });

    expect(result.current.idiom?.id).toBe("id-2");
    expect(mockRpc.mock.calls.length).toBe(callsBefore); // no new network call
  });

  it("reshuffles in memory when the deck is exhausted — no DB call", async () => {
    mockRpc.mockReturnValue(makeRpcChain([makeIdiomRow("id-1")]));

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });
    await waitFor(() => expect(result.current.idiom?.id).toBe("id-1"));

    const callsBefore = mockRpc.mock.calls.length;

    await act(async () => {
      result.current.rollAgain(); // deck exhausted → reshuffle in memory
    });

    // Still shows an idiom from the local deck; no new network call.
    expect(result.current.idiom?.id).toBe("id-1");
    expect(mockRpc.mock.calls.length).toBe(callsBefore);
  });

  it("surfaces error state when the fetch fails", async () => {
    mockRpc.mockReturnValue(makeRpcChainError({ message: "db error" }));

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.idiom).toBeNull();
  });
});
