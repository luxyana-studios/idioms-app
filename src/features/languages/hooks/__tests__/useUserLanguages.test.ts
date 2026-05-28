import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("@/core/supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

const mockUseAuth = jest.fn();
jest.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

import { supabase } from "@/core/supabase/client";
import { useUserLanguages } from "../useUserLanguages";

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

const makeWrapper = () => {
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
};

describe("useUserLanguages", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockUseAuth.mockReturnValue({ user: { id: "u-1" }, initialized: true });
  });

  it("is disabled until auth is initialized", () => {
    mockUseAuth.mockReturnValue({ user: null, initialized: false });

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("is disabled when there is no signed-in user", () => {
    mockUseAuth.mockReturnValue({ user: null, initialized: true });

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("maps rows to camelCase UserLanguage, ordered as returned", async () => {
    const rows = [
      { language_code: "es", color: "#C96F4A", flag: "🇪🇸", position: 0 },
      { language_code: "fr", color: "#3B5BA5", flag: "🇫🇷", position: 1 },
    ];
    mockFrom.mockReturnValueOnce(makeSelectChain({ data: rows, error: null }));

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      { languageCode: "es", color: "#C96F4A", flag: "🇪🇸", position: 0 },
      { languageCode: "fr", color: "#3B5BA5", flag: "🇫🇷", position: 1 },
    ]);
  });

  it("returns an empty array when the user has configured nothing", async () => {
    mockFrom.mockReturnValueOnce(makeSelectChain({ data: [], error: null }));

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("propagates database errors", async () => {
    const dbError = new Error("DB error");
    mockFrom.mockReturnValueOnce(
      makeSelectChain({ data: null, error: dbError }),
    );

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(dbError);
  });
});
