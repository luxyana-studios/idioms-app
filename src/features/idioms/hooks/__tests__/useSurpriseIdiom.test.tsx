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

const makeRpcChain = (result: { data: unknown; error: unknown }) => {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn(() => chain);
  chain.maybeSingle = jest.fn(() => Promise.resolve(result));
  return chain;
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useSurpriseIdiom", () => {
  it("fetches a random idiom on mount", async () => {
    mockRpc.mockReturnValue(
      makeRpcChain({ data: makeIdiomRow("id-1"), error: null }),
    );

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.idiom?.id).toBe("id-1");
    expect(result.current.isError).toBe(false);
  });

  it("passes recent IDs as exclude_ids on subsequent rolls", async () => {
    mockRpc.mockReturnValue(
      makeRpcChain({ data: makeIdiomRow("id-1"), error: null }),
    );

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });
    await waitFor(() => expect(result.current.idiom?.id).toBe("id-1"));

    mockRpc.mockReturnValue(
      makeRpcChain({ data: makeIdiomRow("id-2"), error: null }),
    );

    await act(async () => {
      result.current.rollAgain();
    });
    await waitFor(() => expect(result.current.idiom?.id).toBe("id-2"));

    expect(mockRpc).toHaveBeenLastCalledWith(
      "get_random_idiom",
      expect.objectContaining({
        exclude_ids: expect.arrayContaining(["id-1"]),
      }),
    );
  });

  it("falls back to no exclusions when first fetch returns null", async () => {
    mockRpc
      .mockReturnValueOnce(makeRpcChain({ data: null, error: null }))
      .mockReturnValueOnce(
        makeRpcChain({ data: makeIdiomRow("id-fallback"), error: null }),
      );

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });
    await waitFor(() => expect(result.current.idiom?.id).toBe("id-fallback"));

    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockRpc).toHaveBeenNthCalledWith(2, "get_random_idiom", {
      exclude_ids: [],
    });
  });

  it("surfaces error state when both fetches fail", async () => {
    mockRpc
      .mockReturnValueOnce(makeRpcChain({ data: null, error: null }))
      .mockReturnValueOnce(
        makeRpcChain({ data: null, error: { message: "db error" } }),
      );

    const { result } = renderHook(() => useSurpriseIdiom(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.idiom).toBeNull();
  });
});
