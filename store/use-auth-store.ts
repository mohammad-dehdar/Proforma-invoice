import { create } from 'zustand';

import { AuthUser, checkSession as fetchSession, login as authLogin, logout as authLogout } from '@services/auth-service';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

const defaultAuthState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
  login: async () => false,
  logout: async () => {},
  checkSession: async () => {},
  clearError: () => {}
};

// Create a stable server snapshot for SSR (cached to avoid infinite loops)
let cachedAuthServerSnapshot: AuthState | null = null;

const getAuthServerSnapshot = (): AuthState => {
  if (!cachedAuthServerSnapshot) {
    cachedAuthServerSnapshot = defaultAuthState;
  }
  return cachedAuthServerSnapshot;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  clearError: () => set({ error: null }),

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const result = await authLogin(username, password);

      if (!result.success || !result.user) {
        set({ loading: false, error: result.message || 'ورود ناموفق بود' });
        return false;
      }

      set({ user: result.user, loading: false, initialized: true, error: null });
      return true;
    } catch (error) {
      console.error('Login request failed', error);
      set({ loading: false, error: 'خطا در ارتباط با سرور' });
      return false;
    }
  },

  logout: async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      set({ user: null, initialized: true, error: null });
    }
  },

  checkSession: async () => {
    set({ loading: true });
    try {
      const result = await fetchSession();

      if (!result.authenticated) {
        set({ user: null, loading: false, initialized: true });
        return;
      }

      set({ user: result.user ?? null, loading: false, initialized: true, error: null });
    } catch (error) {
      console.error('Session check failed', error);
      set({ user: null, loading: false, initialized: true });
    }
  },
}));

// Add getServerSnapshot to the store for SSR support
// This ensures React's useSyncExternalStore has a stable cached server snapshot
// The snapshot is cached to prevent infinite loops when components subscribe
// @ts-expect-error - Zustand stores don't have getServerSnapshot in their type definition, but we add it for SSR
useAuthStore.getServerSnapshot = getAuthServerSnapshot;
