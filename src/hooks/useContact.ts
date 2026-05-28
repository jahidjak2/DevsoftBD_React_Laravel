// src/hooks/useContact.ts
import type { ContactFormData } from '@/types'
 
export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: ContactFormData) =>
      publicApi.post('/contact', data).then(r => r.data),
  })
}