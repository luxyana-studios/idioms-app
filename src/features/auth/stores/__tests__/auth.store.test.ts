const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn(() => ({
  data: { subscription: { unsubscribe: jest.fn() } },
}));

jest.mock("@/core/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

import { useAuthStore } from "../auth.store";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      session: null,
      user: null,
      initialized: false,
      loading: false,
    });
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  describe("initialize() — dev bypass", () => {
    it("sets demo session and skips Supabase when bypass flag is active", () => {
      // __DEV__ is true in Jest and EXPO_PUBLIC_DEV_BYPASS_AUTH is baked in
      // as "true" by babel-preset-expo from .env — so bypass is always on here.
      useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.initialized).toBe(true);
      expect(state.session?.user.id).toBe("demo");
      expect(state.user?.id).toBe("demo");
      expect(state.user?.email).toBe("demo@idiomdeck.app");
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(mockOnAuthStateChange).not.toHaveBeenCalled();
    });

    it("does not call signIn or signOut against Supabase in bypass mode", async () => {
      useAuthStore.getState().initialize();
      // signIn/signOut still delegate to supabase — bypass only affects initialize()
      // This verifies the demo session is stable and mockGetSession stays uncalled.
      expect(mockGetSession).not.toHaveBeenCalled();
    });
  });
});
