// src/hooks/useHomepage.ts
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/lib/api'
import type { HomepageData } from '@/types'
 
export function useHomepage() {
  return useQuery<HomepageData>({
    queryKey: ['homepage'],
    queryFn:  () => publicApi.get('/homepage').then(r => r.data),
    staleTime: 1000 * 60 * 10, // 10 min — homepage is static-ish
  })
}