// src/hooks/useTeam.ts
export function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn:  () => publicApi.get('/team').then(r => r.data.data),
    staleTime: 1000 * 60 * 15,
  })
}