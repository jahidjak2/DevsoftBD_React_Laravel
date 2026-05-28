// src/components/shared/SectionHeader.tsx
import { cn } from '@/lib/utils'
 
interface Props {
  eyebrow?: string
  title: string
  subtitle?: string
  inView?: boolean
  dark?: boolean
  center?: boolean
}
 
export function SectionHeader({ eyebrow, title, subtitle, inView = true, dark = false, center = true }: Props) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <p className={cn(
          'text-xs font-semibold uppercase tracking-widest mb-3',
          dark ? 'text-brand-400' : 'text-brand-600',
          inView ? 'animate-fade-up' : 'opacity-0'
        )}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn(
        'section-headline mb-4',
        dark ? 'text-white' : 'text-gray-900',
        inView ? 'animate-fade-up stagger-1' : 'opacity-0'
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'text-base md:text-lg leading-relaxed',
          dark ? 'text-gray-400' : 'text-gray-500',
          inView ? 'animate-fade-up stagger-2' : 'opacity-0'
        )}>
          {subtitle}
        </p>
      )}
    </div>
  )
}