 import React from 'react'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/utils'
import { SectionHeader } from '@/components/shared/SectionHeader'

// ─────────────────────────────────────────────────────────────
// src/components/sections/IndustryWeServe.tsx
// ─────────────────────────────────────────────────────────────
import type { Industry } from '@/types'
 
interface IndustriesProps { industries: Industry[] }
 
export function IndustryWeServe({ industries }: IndustriesProps) {
  const { ref, inView } = useInView()
 
  return (
    <section ref={ref} className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Industries"
          title="Industries We Serve"
          subtitle="We have deep domain expertise across multiple industries, enabling us to build solutions that truly fit your sector."
          inView={inView}
        />
 
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
          {industries.map((ind, i) => (
            <div key={ind.id}
              className={cn(
                'group p-6 rounded-xl2 border border-gray-100 hover:border-transparent',
                'hover:shadow-card-hover cursor-pointer transition-all duration-300 text-center',
                inView ? `animate-fade-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0'
              )}
              style={{ '--hover-color': ind.color } as React.CSSProperties}>
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-4 transition-all duration-300"
                style={{ background: ind.color + '15' }}>
                {ind.icon_url ? (
                  <img src={ind.icon_url} alt={ind.name} className="w-7 h-7 object-contain" />
                ) : (
                  <div className="w-7 h-7 rounded" style={{ background: ind.color }} />
                )}
              </div>
              <h3 className="font-display font-semibold text-gray-900 mb-2 text-sm group-hover:text-brand-600 transition-colors">
                {ind.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                {ind.short_description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
 