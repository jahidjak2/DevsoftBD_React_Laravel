 import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ─────────────────────────────────────────────────────────────
// src/store/employeeStore.ts  — Employee auth
// ─────────────────────────────────────────────────────────────
import type { EmployeeUser } from '@/types'
 
interface EmployeeState {
  token: string | null
  user: EmployeeUser | null
  setAuth: (token: string, user: EmployeeUser) => void
  logout: () => void
  isAuthenticated: boolean
}
 
export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      token: null,
      user:  null,
      get isAuthenticated() { return !!get().token },
      setAuth: (token, user) => set({ token, user }),
      logout:  () => set({ token: null, user: null }),
    }),
    {
      name:    'devsoft-employee-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
 