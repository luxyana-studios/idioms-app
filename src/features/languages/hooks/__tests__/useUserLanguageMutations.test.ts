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
  useUpdateUserLanguage,
} from "../useUserLanguageMutations";

const mockFrom = supabase.from as jest.Mock;

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
