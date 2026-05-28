
// src/components/shared/TagBadge.tsx
import { cn } from '@/lib/utils'
import type { Tag } from '@/types'
 
interface Props { tag: Tag; size?: 'sm' | 'md' }
 
export function TagBadge({ tag, size = 'sm' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'
      )}
      style={{ background: tag.color + '15', color: tag.color }}>
      {tag.name}
    </span>
  )
}