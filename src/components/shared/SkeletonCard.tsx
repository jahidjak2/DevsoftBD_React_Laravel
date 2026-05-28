 
// src/components/shared/SkeletonCard.tsx
import { cn } from '@/lib/utils'
 
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className="skeleton aspect-project" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-5 w-14 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}
 
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn('skeleton h-4 rounded', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}
 