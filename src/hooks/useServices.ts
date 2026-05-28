// src/hooks/useServices.ts
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn:  () => publicApi.get('/services').then(r => r.data.data),
    staleTime: 1000 * 60 * 10,
  })
}
 
export function useService(slug: string) {
  return useQuery({
    queryKey: ['service', slug],
    queryFn:  () => publicApi.get(`/services/${slug}`).then(r => r.data.data),
    enabled:  !!slug,
  })
}
 