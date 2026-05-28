
// src/components/shared/EmptyState.tsx
import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'
 
interface Props {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}
 
export function EmptyState({ icon, title, subtitle, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5 text-gray-400">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 max-w-xs mb-6">{subtitle}</p>}
      {action}
    </div>
  )
}
 