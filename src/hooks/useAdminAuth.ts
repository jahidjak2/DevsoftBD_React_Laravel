import { useMutation } from '@tanstack/react-query';

// src/hooks/useAdminAuth.ts
export function useAdminLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      import('@/lib/api').then(({ authApi }) =>
        authApi.post('/admin/login', data).then(r => r.data)
      ),
  })
}
 
export function useEmployeeLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      import('@/lib/api').then(({ authApi }) =>
        authApi.post('/employee/login', data).then(r => r.data)
      ),
  })
}