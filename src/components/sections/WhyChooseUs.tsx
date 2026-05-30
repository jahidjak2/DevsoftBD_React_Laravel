 
// ─────────────────────────────────────────────────────────────
// src/components/sections/WhyChooseUs.tsx
// ─────────────────────────────────────────────────────────────
import useInView from '@/hooks/useInView'
import type { WhyReason } from '@/types'
import { SectionHeader } from '../shared/SectionHeader'
import { cn } from '@/lib/utils'
 
interface WhyProps { reasons: WhyReason[] }
 
export function WhyChooseUs({ reasons }: WhyProps) {
  const { ref, inView } = useInView()
 
  return (
    <section ref={ref} className="section bg-gray-50">
      <div className="container">
        <SectionHeader
          eyebrow="Why Us"
          title="Why Businesses Choose DevSoft BD"
          subtitle="More than code — we bring strategy, expertise, and accountability to every engagement."
          inView={inView}
        />
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {reasons.map((reason, i) => (
            <div key={reason.id}
              className={cn(
                'card p-6 group',
                inView ? `animate-fade-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0'
              )}>
              {/* Icon + stat side by side */}
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: (reason.icon_color || '#2563eb') + '15' }}>
                  <span style={{ color: reason.icon_color || '#2563eb' }} className="text-xl">⚡</span>
                </div>
                {reason.stat_value && (
                  <div className="text-right">
                    <div className="font-display font-800 text-2xl leading-none"
                      style={{ color: reason.icon_color || '#2563eb' }}>
                      {reason.stat_value}
                    </div>
                    {reason.stat_label && (
                      <div className="text-xs text-gray-400 mt-0.5">{reason.stat_label}</div>
                    )}
                  </div>
                )}
              </div>
              <h3 className="font-display font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                {reason.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}