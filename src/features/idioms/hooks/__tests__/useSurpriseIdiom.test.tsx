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
});

afterEach(() => {
  queryClient.clear();
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

  it("fetches a new batch when the deck is exhausted", async () => {
    mockRpc
      .mockReturnValueOnce(makeRpcChain([makeIdiomRow("id-1")]))
      .mockReturnValueOnce(makeRpcChain([makeIdiomRow("id-2")]));

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });
    await waitFor(() => expect(result.current.idiom?.id).toBe("id-1"));

    await act(async () => {
      result.current.rollAgain();
    });

    await waitFor(() => expect(result.current.idiom?.id).toBe("id-2"));
    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockRpc).toHaveBeenLastCalledWith(
      "get_random_idioms",
      expect.objectContaining({
        exclude_ids: expect.arrayContaining(["id-1"]),
      }),
    );
  });

  it("clears seen IDs and retries when batch returns empty", async () => {
    mockRpc
      .mockReturnValueOnce(makeRpcChain([]))
      .mockReturnValueOnce(makeRpcChain([makeIdiomRow("id-fresh")]));

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });
    await waitFor(() => expect(result.current.idiom?.id).toBe("id-fresh"));

    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockRpc).toHaveBeenNthCalledWith(2, "get_random_idioms", {
      batch_size: 20,
      exclude_ids: [],
    });
  });

  it("surfaces error state when both fetches fail", async () => {
    mockRpc
      .mockReturnValueOnce(makeRpcChain([]))
      .mockReturnValueOnce(makeRpcChainError({ message: "db error" }));

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.idiom).toBeNull();
  });
});
