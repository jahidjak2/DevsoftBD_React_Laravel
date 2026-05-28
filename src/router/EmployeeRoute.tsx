
// ─────────────────────────────────────────────────────────────
// src/router/EmployeeRoute.tsx
// ─────────────────────────────────────────────────────────────
import { useEmployeeStore } from '@/store/employeeStore'
 
export default function EmployeeRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useEmployeeStore()
  if (!isAuthenticated) return <Navigate to="/employee/login" replace />
  return <>{children}</>
}
 