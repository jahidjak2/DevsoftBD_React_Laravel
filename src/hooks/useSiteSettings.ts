import { publicApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// src/hooks/useSiteSettings.ts
export function useSiteSettings() {
  // Settings are included in the homepage data.
  // This hook is for components that need settings standalone.
  return useQuery({
    queryKey: ['site-settings'],
    queryFn:  () => publicApi.get('/settings').then(r => r.data),
    staleTime: 1000 * 60 * 15,
  })
}
 