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

// A row of the user_language_catalog view (the server-side merge of global
// defaults with the user's own config).
const catalogRow = (
  code: string,
  {
    color = "#C96F4A",
    flag = "🇪🇸",
    position = 0,
    isConfigured = false,
    inGlobal = true,
    isActive = false,
  }: {
    color?: string;
    flag?: string;
    position?: number;
    isConfigured?: boolean;
    inGlobal?: boolean;
    isActive?: boolean;
  } = {},
) => ({
  language_code: code,
  color,
  flag,
  position,
  is_configured: isConfigured,
  in_global: inGlobal,
  is_active: isActive,
});

const makeSelectChain = (result: { data: unknown; error: unknown }) => {
  const promise = Promise.resolve(result) as Promise<typeof result> & {
    select: jest.Mock;
    order: jest.Mock;
    eq: jest.Mock;
  };
  promise.select = jest.fn(() => promise);
  promise.order = jest.fn(() => promise);
  promise.eq = jest.fn(() => promise);
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

  it("fetches the global catalog when there is no signed-in user", async () => {
    mockUseAuth.mockReturnValue({ user: null, initialized: true });
    const globalRows = [
      { language_code: "en", color: "#3B5BA5", flag: "🇬🇧", position: 0 },
      { language_code: "es", color: "#C96F4A", flag: "🇪🇸", position: 1 },
    ];
    mockFrom.mockReturnValueOnce(
      makeSelectChain({ data: globalRows, error: null }),
    );

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFrom).toHaveBeenCalledWith("global_language_config");
    expect(result.current.configuredLanguages).toEqual([]);
    expect(
      result.current.availableLanguages.map((l) => l.languageCode),
    ).toEqual(["en", "es"]);
  });

  it("uses configured rows as the effective scope", async () => {
    const rows = [
      catalogRow("es", {
        color: "#C96F4A",
        flag: "🇪🇸",
        position: 0,
        isConfigured: true,
        isActive: true,
      }),
      catalogRow("fr", {
        color: "#3B5BA5",
        flag: "🇫🇷",
        position: 1,
        isConfigured: true,
        isActive: true,
      }),
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

  it("bootstraps to the global catalog when the user has configured nothing", async () => {
    // With zero user rows the view returns the enabled global defaults, all
    // active and none configured.
    const rows = [
      catalogRow("en", {
        color: "#3B5BA5",
        flag: "🇬🇧",
        position: 0,
        isActive: true,
      }),
      catalogRow("es", {
        color: "#C96F4A",
        flag: "🇪🇸",
        position: 1,
        isActive: true,
      }),
      catalogRow("de", {
        color: "#5E6B73",
        flag: "🇩🇪",
        position: 2,
        isActive: true,
      }),
    ];
    mockFrom.mockReturnValueOnce(makeSelectChain({ data: rows, error: null }));

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.configuredLanguages).toEqual([]);
    expect(result.current.hasUserConfiguration).toBe(false);
    expect(result.current.languages.map((lang) => lang.languageCode)).toEqual([
      "en",
      "es",
      "de",
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

  it("exposes global languages not configured by the user as available", async () => {
    const rows = [
      catalogRow("es", {
        position: 0,
        isConfigured: true,
        isActive: true,
      }),
      catalogRow("fr", { color: "#3B5BA5", flag: "🇫🇷", position: 1 }),
    ];
    mockFrom.mockReturnValueOnce(makeSelectChain({ data: rows, error: null }));

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const availableCodes = result.current.availableLanguages.map(
      (lang) => lang.languageCode,
    );
    expect(availableCodes).toContain("fr");
    expect(availableCodes).not.toContain("es");
    // fr is in the global catalog but not active while the user has config.
    expect(result.current.languages.map((lang) => lang.languageCode)).toEqual([
      "es",
    ]);
  });

  it("keeps a configured language that is no longer in the global catalog", async () => {
    const rows = [
      catalogRow("eo", {
        color: "#7A8450",
        flag: "🏳️",
        position: 0,
        isConfigured: true,
        inGlobal: false,
        isActive: true,
      }),
    ];
    mockFrom.mockReturnValueOnce(makeSelectChain({ data: rows, error: null }));

    const { result } = renderHook(() => useUserLanguages(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(
      result.current.configuredLanguages.map((l) => l.languageCode),
    ).toEqual(["eo"]);
    // Not offered as "available to add" since it is not in the global catalog.
    expect(result.current.availableLanguages).toEqual([]);
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
