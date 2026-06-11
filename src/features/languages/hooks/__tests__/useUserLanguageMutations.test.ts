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
import {
  useAddUserLanguage,
  useRemoveUserLanguage,
  useReorderUserLanguages,
  useUpdateUserLanguage,
} from "../useUserLanguageMutations";
import { type CatalogRow, userLanguagesKey } from "../useUserLanguages";

const mockFrom = supabase.from as jest.Mock;

// update().eq().eq() chain that resolves to { error: null }, capturing the
// position written for each call so reorder assertions can inspect them.
const makeUpdateChain = (sink: Array<Record<string, unknown>>) => ({
  update: jest.fn((patch: Record<string, unknown>) => {
    sink.push(patch);
    return { eq: () => ({ eq: () => Promise.resolve({ error: null }) }) };
  }),
});

// A cached catalog row (the user_language_catalog view shape). Defaults to a
// configured global default; override `isConfigured`/`inGlobal` for the
// available/user-only buckets.
const row = (overrides: Partial<CatalogRow>): CatalogRow => ({
  languageCode: "es",
  color: "#C96F4A",
  flag: "🇪🇸",
  position: 0,
  isConfigured: true,
  inGlobal: true,
  isActive: true,
  ...overrides,
});

const makeWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
};

// Wrapper that exposes its query client and seeds the cached catalog, so
// optimistic-update tests can inspect the cache before/after a mutation.
const makeSeededWrapper = (initial: CatalogRow[]) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData<CatalogRow[]>(userLanguagesKey("u-1"), initial);
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  const rows = () =>
    queryClient.getQueryData<CatalogRow[]>(userLanguagesKey("u-1"));
  const configuredCodes = () =>
    rows()
      ?.filter((r) => r.isConfigured)
      .map((r) => r.languageCode);
  return { queryClient, wrapper, rows, configuredCodes };
};

describe("user language mutations", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockUseAuth.mockReturnValue({ user: { id: "u-1" }, initialized: true });
  });

  it("upserts when adding a language", async () => {
    const upsert = jest.fn(() => Promise.resolve({ error: null }));
    mockFrom.mockReturnValue({ upsert });

    const { result } = renderHook(() => useAddUserLanguage(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate({ languageCode: "es", color: "#C96F4A", flag: "🇪🇸" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFrom).toHaveBeenCalledWith("user_languages");
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "u-1",
        language_code: "es",
        color: "#C96F4A",
        flag: "🇪🇸",
        position: 0,
      },
      { onConflict: "user_id,language_code" },
    );
  });

  it("scopes updates to the user and language", async () => {
    const eq2 = jest.fn(() => Promise.resolve({ error: null }));
    const eq1 = jest.fn(() => ({ eq: eq2 }));
    const update = jest.fn(() => ({ eq: eq1 }));
    mockFrom.mockReturnValue({ update });

    const { result } = renderHook(() => useUpdateUserLanguage(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate({ languageCode: "fr", patch: { color: "#3B5BA5" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(update).toHaveBeenCalledWith({ color: "#3B5BA5" });
    expect(eq1).toHaveBeenCalledWith("user_id", "u-1");
    expect(eq2).toHaveBeenCalledWith("language_code", "fr");
  });

  it("scopes deletes to the user and language", async () => {
    const eq2 = jest.fn(() => Promise.resolve({ error: null }));
    const eq1 = jest.fn(() => ({ eq: eq2 }));
    const del = jest.fn(() => ({ eq: eq1 }));
    mockFrom.mockReturnValue({ delete: del });

    const { result } = renderHook(() => useRemoveUserLanguage(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate("fr");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(eq1).toHaveBeenCalledWith("user_id", "u-1");
    expect(eq2).toHaveBeenCalledWith("language_code", "fr");
  });

  it("fails when the user is signed out", async () => {
    mockUseAuth.mockReturnValue({ user: null, initialized: true });
    mockFrom.mockReturnValue({ upsert: jest.fn() });

    const { result } = renderHook(() => useAddUserLanguage(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate({ languageCode: "es", color: "#C96F4A", flag: "🇪🇸" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toMatch(/signed in/i);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("useReorderUserLanguages", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockUseAuth.mockReturnValue({ user: { id: "u-1" }, initialized: true });
  });

  it("writes each language's new index as its position", async () => {
    const positions: Array<Record<string, unknown>> = [];
    mockFrom.mockReturnValue(makeUpdateChain(positions));

    const { result } = renderHook(() => useReorderUserLanguages(), {
      wrapper: makeWrapper(),
    });

    result.current.mutate(["fr", "es", "de"]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(positions).toEqual([
      { position: 0 },
      { position: 1 },
      { position: 2 },
    ]);
  });

  it("optimistically repositions the configured rows in place", async () => {
    const positions: Array<Record<string, unknown>> = [];
    mockFrom.mockReturnValue(makeUpdateChain(positions));

    const { wrapper, rows } = makeSeededWrapper([
      row({ languageCode: "es", position: 0 }),
      row({ languageCode: "fr", position: 1 }),
    ]);

    const { result } = renderHook(() => useReorderUserLanguages(), { wrapper });

    result.current.mutate(["fr", "es"]);

    // Positions flip immediately; the selector sorts by position downstream,
    // so the cache array itself stays in place (available rows aren't dropped).
    await waitFor(() =>
      expect(
        Object.fromEntries(
          rows()?.map((r) => [r.languageCode, r.position]) ?? [],
        ),
      ).toEqual({ fr: 0, es: 1 }),
    );
  });
});

describe("optimistic add / update / remove", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockUseAuth.mockReturnValue({ user: { id: "u-1" }, initialized: true });
  });

  it("flips an available language to configured before the request settles", async () => {
    let resolveUpsert: (value: { error: null }) => void = () => {};
    mockFrom.mockReturnValue({
      upsert: jest.fn(
        () =>
          new Promise<{ error: null }>((resolve) => {
            resolveUpsert = resolve;
          }),
      ),
    });
    const { wrapper, rows, configuredCodes } = makeSeededWrapper([
      row({ languageCode: "es" }),
      // "fr" is an available global default, not yet configured.
      row({ languageCode: "fr", isConfigured: false, isActive: false }),
    ]);

    const { result } = renderHook(() => useAddUserLanguage(), { wrapper });
    result.current.mutate({
      languageCode: "fr",
      color: "#3B5BA5",
      flag: "🇫🇷",
      position: 1,
    });

    // The row flips configured/active immediately, while the request is pending.
    await waitFor(() => expect(configuredCodes()).toEqual(["es", "fr"]));
    const fr = rows()?.find((r) => r.languageCode === "fr");
    expect(fr).toMatchObject({ isActive: true, color: "#3B5BA5", flag: "🇫🇷" });

    resolveUpsert({ error: null });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("flips a removed global default back to available, keeping the row", async () => {
    const eq2 = jest.fn(() => Promise.resolve({ error: null }));
    mockFrom.mockReturnValue({
      delete: () => ({ eq: () => ({ eq: eq2 }) }),
    });
    const { wrapper, rows, configuredCodes } = makeSeededWrapper([
      row({ languageCode: "es" }),
      row({ languageCode: "fr" }),
    ]);

    const { result } = renderHook(() => useRemoveUserLanguage(), { wrapper });
    result.current.mutate("es");

    // "es" stays in the catalog (it's a global default) but drops out of the
    // configured set so it reappears in the available bucket.
    await waitFor(() => expect(configuredCodes()).toEqual(["fr"]));
    expect(rows()?.map((r) => r.languageCode)).toEqual(["es", "fr"]);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("merges color/flag patches into the cached row", async () => {
    mockFrom.mockReturnValue({
      update: () => ({
        eq: () => ({ eq: () => Promise.resolve({ error: null }) }),
      }),
    });
    const { wrapper, rows } = makeSeededWrapper([
      row({ languageCode: "es", color: "#C96F4A" }),
    ]);

    const { result } = renderHook(() => useUpdateUserLanguage(), { wrapper });
    result.current.mutate({ languageCode: "es", patch: { color: "#3B5BA5" } });

    await waitFor(() => expect(rows()?.[0]?.color).toBe("#3B5BA5"));
  });

  it("rolls the cache back when the request fails", async () => {
    mockFrom.mockReturnValue({
      delete: () => ({
        eq: () => ({ eq: () => Promise.resolve({ error: new Error("boom") }) }),
      }),
    });
    const { wrapper, configuredCodes } = makeSeededWrapper([
      row({ languageCode: "es" }),
      row({ languageCode: "fr" }),
    ]);

    const { result } = renderHook(() => useRemoveUserLanguage(), { wrapper });
    result.current.mutate("es");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(configuredCodes()).toEqual(["es", "fr"]);
  });
});
