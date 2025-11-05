import { create } from 'zustand';

type AuthUser = {
  username: string;
};

interface AuthState {
  user: AuthUser | null;
  isChecking: boolean;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  setIsChecking: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isChecking: true,
  error: null,
  setUser: (user) => set({ user }),
  setIsChecking: (value) => set({ isChecking: value }),
  setError: (error) => set({ error }),
}));
