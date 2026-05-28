 
// ─────────────────────────────────────────────────────────────
// src/components/sections/ClientFeedback.tsx
// ─────────────────────────────────────────────────────────────
import { Star } from 'lucide-react'
import type { Testimonial } from '@/types'
 
interface FeedbackProps { testimonials: Testimonial[] }
 
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={cn('h-4 w-4', n <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')} />
      ))}
    </div>
  )
}
 
export function ClientFeedback({ testimonials }: FeedbackProps) {
  const { ref, inView } = useInView()
 
  return (
    <section ref={ref} className="section bg-navy-800 overflow-hidden">
      <div className="container">
        <SectionHeader
          eyebrow="Client Stories"
          title="What Our Clients Say"
          subtitle="We measure our success by the impact we create for our clients."
          inView={inView}
          dark
        />
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {testimonials.slice(0, 6).map((t, i) => (
            <div key={t.id}
              className={cn(
                'bg-white/5 border border-white/10 rounded-xl2 p-6 hover:bg-white/8 transition-colors',
                inView ? `animate-fade-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0'
              )}>
              <StarRating rating={t.rating} />
 
              <blockquote className="mt-4 text-gray-300 text-sm leading-relaxed line-clamp-4">
                "{t.review_text}"
              </blockquote>
 
              <div className="flex items-center gap-3 mt-6">
                {t.client_avatar_url ? (
                  <img src={t.client_avatar_url} alt={t.client_name}
                    className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                    {t.client_name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-white text-sm font-semibold">{t.client_name}</div>
                  <div className="text-gray-500 text-xs">{t.client_designation}</div>
                </div>
                {t.source_url && (
                  <a href={t.source_url} target="_blank" rel="noopener noreferrer"
                    className="ml-auto text-xs text-gray-500 hover:text-gray-400 capitalize">
                    {t.source}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}