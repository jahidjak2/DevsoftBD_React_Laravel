// src/hooks/useBlog.ts
export function useBlogPosts(params?: { category?: string; page?: number }) {
  return useQuery({
    queryKey: ['blog', params],
    queryFn:  () => publicApi.get('/blog', { params }).then(r => r.data),
  })
}
 
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn:  () => publicApi.get(`/blog/${slug}`).then(r => r.data.data),
    enabled:  !!slug,
  })
}