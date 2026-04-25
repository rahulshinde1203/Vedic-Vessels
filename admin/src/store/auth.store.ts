import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AdminUser {
  id:    number;
  phone: string;
  role:  string;
}

interface AdminAuthStore {
  admin: AdminUser | null;
  token: string   | null;
  login:  (admin: AdminUser, token: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminAuthStore>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      login:  (admin, token) => set({ admin, token }),
      logout: () => set({ admin: null, token: null }),
    }),
    {
      name:    'vv-admin-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
