import { create } from 'zustand';

interface AuthUser {
  id: string;
  username: string;
}

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  clearError: () => set({ error: null }),

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'ورود ناموفق بود' }));
        set({ loading: false, error: data.message || 'ورود ناموفق بود' });
        return false;
      }

      const data = await response.json();
      set({ user: data.user, loading: false, initialized: true, error: null });
      return true;
    } catch (error) {
      console.error('Login request failed', error);
      set({ loading: false, error: 'خطا در ارتباط با سرور' });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      set({ user: null, initialized: true, error: null });
    }
  },

  checkSession: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        set({ user: null, loading: false, initialized: true });
        return;
      }

      const data = await response.json();
      set({ user: data.user, loading: false, initialized: true, error: null });
    } catch (error) {
      console.error('Session check failed', error);
      set({ user: null, loading: false, initialized: true });
    }
  },
}));
