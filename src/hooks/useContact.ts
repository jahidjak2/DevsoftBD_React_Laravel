// src/hooks/useContact.ts
import { publicApi } from '@/lib/api'
import type { ContactFormData } from '@/types'
import { useMutation } from '@tanstack/react-query'
 
export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: ContactFormData) =>
      publicApi.post('/contact', data).then(r => r.data),
  })
}