// src/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { publicApi, adminApi } from '@/lib/api'
import type { ProjectFilters, PaginatedProjects, ProjectDetail } from '@/types'
 
export function useProjects(filters?: ProjectFilters) {
  return useQuery<PaginatedProjects>({
    queryKey: ['projects', filters],
    queryFn:  () => publicApi.get('/projects', { params: filters }).then(r => r.data),
  })
}
 
export function useFeaturedProjects() {
  return useQuery({
    queryKey: ['projects', 'featured'],
    queryFn:  () => publicApi.get('/projects/featured').then(r => r.data.data),
    staleTime: 1000 * 60 * 10,
  })
}
 
export function useProject(slug: string) {
  return useQuery<{ data: ProjectDetail }>({
    queryKey: ['project', slug],
    queryFn:  () => publicApi.get(`/projects/${slug}`).then(r => r.data),
    enabled:  !!slug,
  })
}
 
export function useIncrementView(slug: string) {
  return useMutation({
    mutationFn: () => publicApi.post(`/projects/${slug}/view`),
  })
}
 
// Admin mutations
export function useAdminProjects(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['admin-projects', params],
    queryFn:  () => adminApi.get('/projects', { params }).then(r => r.data),
  })
}
 
export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => adminApi.post('/projects', data).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-projects'] }),
  })
}
 
export function useUpdateProject(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => adminApi.put(`/projects/${id}`, data).then(r => r.data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
      qc.invalidateQueries({ queryKey: ['project'] })
    },
  })
}
 
export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.delete(`/projects/${id}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-projects'] }),
  })
}