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
    expect(result.current.isLoading).toBe(true);
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

  it("maps rows and uses configured rows as the effective scope", async () => {
    const rows = [
      { language_code: "es", color: "#C96F4A", flag: "🇪🇸", position: 0 },
      { language_code: "fr", color: "#3B5BA5", flag: "🇫🇷", position: 1 },
    ];
    mockFrom.mockReturnValueOnce(makeSelectChain({ data: rows, error: null }));

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.configuredLanguages).toEqual([
      { languageCode: "es", color: "#C96F4A", flag: "🇪🇸", position: 0 },
      { languageCode: "fr", color: "#3B5BA5", flag: "🇫🇷", position: 1 },
    ]);
    expect(result.current.languages).toEqual([
      {
        languageCode: "es",
        color: "#C96F4A",
        flag: "🇪🇸",
        position: 0,
        source: "user",
      },
      {
        languageCode: "fr",
        color: "#3B5BA5",
        flag: "🇫🇷",
        position: 1,
        source: "user",
      },
    ]);
    expect(result.current.hasUserConfiguration).toBe(true);
    expect(result.current.configuredByCode.get("fr")).toEqual({
      languageCode: "fr",
      color: "#3B5BA5",
      flag: "🇫🇷",
      position: 1,
    });
  });

  it("returns default effective languages when the user has configured nothing", async () => {
    mockFrom.mockReturnValueOnce(makeSelectChain({ data: [], error: null }));

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(result.current.configuredLanguages).toEqual([]);
    expect(result.current.hasUserConfiguration).toBe(false);
    expect(result.current.languages.map((lang) => lang.languageCode)).toEqual([
      "en",
      "es",
      "de",
      "fr",
      "it",
      "pt",
      "zh",
      "hi",
      "ar",
      "ja",
      "ko",
    ]);
    expect(
      result.current.languages.every((lang) => lang.source === "default"),
    ).toBe(true);
    expect(result.current.byCode.get("es")).toMatchObject({
      languageCode: "es",
      color: "#C96F4A",
      flag: "🇪🇸",
      source: "default",
    });
  });

  it("exposes default languages not configured by the user as available", async () => {
    mockFrom.mockReturnValueOnce(
      makeSelectChain({
        data: [
          { language_code: "es", color: "#C96F4A", flag: "🇪🇸", position: 0 },
        ],
        error: null,
      }),
    );

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(
      result.current.availableLanguages.map((lang) => lang.languageCode),
    ).not.toContain("es");
    expect(
      result.current.availableLanguages.map((lang) => lang.languageCode),
    ).toContain("fr");
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
