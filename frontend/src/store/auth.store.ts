import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  id:    number;
  phone: string;
  role:  string;
}

interface AuthStore {
  user:    AuthUser | null;
  token:   string  | null;
  login:   (user: AuthUser, token: string) => void;
  logout:  () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:    null,
      token:   null,
      login:   (user, token) => set({ user, token }),
      logout:  () => set({ user: null, token: null }),
    }),
    {
      name:    'vedic-vessels-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const selectIsAuthenticated = (state: AuthStore): boolean =>
  state.token !== null && state.user !== null;
