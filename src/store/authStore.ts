 
// ─────────────────────────────────────────────────────────────
// src/store/authStore.ts  — Admin auth (Zustand + persist)
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AdminUser } from '@/types'
 
interface AuthState {
  token: string | null
  user: AdminUser | null
  setAuth: (token: string, user: AdminUser) => void
  logout: () => void
  isAuthenticated: boolean
}
 
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user:  null,
      get isAuthenticated() { return !!get().token },
      setAuth: (token, user) => set({ token, user }),
      logout:  () => set({ token: null, user: null }),
    }),
    {
      name:    'devsoft-admin-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
 