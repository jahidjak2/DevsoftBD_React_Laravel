
// ─────────────────────────────────────────────────────────────
// src/components/sections/Services.tsx
// ─────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useInView } from '@/hooks/all_hooks'
import { cn } from '@/lib/utils'
import type { ServiceItem } from '@/types'
 
const ICON_COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-cyan-500 to-cyan-600',
  'from-red-500 to-red-600',
  'from-indigo-500 to-indigo-600',
]
 
interface ServicesProps { services: ServiceItem[] }
 
export function ServicesSection({ services }: ServicesProps) {
  const { ref, inView } = useInView()
 
  return (
    <section ref={ref} className="section bg-gray-50">
      <div className="container">
        <SectionHeader
          eyebrow="What We Do"
          title="Services Built for Modern Business"
          subtitle="From concept to deployment, we deliver end-to-end software solutions that drive real business impact."
          inView={inView}
        />
 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {services.map((service, i) => (
            <Link key={service.id} to={`/services/${service.slug}`}
              className={cn(
                'card p-6 group cursor-pointer',
                inView ? `animate-fade-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0'
              )}>
              {/* Icon */}
              <div className={cn(
                'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-5',
                ICON_COLORS[i % ICON_COLORS.length]
              )}>
                <span className="text-white text-xl">
                  {service.icon ? (
                    <span className="font-mono text-sm">{service.icon.substring(0, 2)}</span>
                  ) : '⚡'}
                </span>
              </div>
 
              <h3 className="font-display font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                {service.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                {service.short_description}
              </p>
 
              <div className="flex items-center gap-1 mt-4 text-brand-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
 
        <div className="text-center mt-12">
          <Link to="/services" className="btn-secondary">
            View All Services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}