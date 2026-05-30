// src/components/sections/Hero.tsx
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Star } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'
import type { Hero as HeroType } from '@/types'
 
interface Props { hero: HeroType }
 
export default function Hero({ hero }: Props) {
  const { ref, inView } = useInView({ threshold: 0.1 })
 
  return (
    <section ref={ref} className="relative min-h-[92vh] flex items-center overflow-hidden hero-gradient">
      {/* Background image */}
      {hero.background_type === 'image' && hero.background_image_url && (
        <>
          <div className="absolute inset-0">
            <img src={hero.background_image_url} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 via-navy-900/70 to-transparent" />
        </>
      )}
 
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-30" />
      </div>
 
      <div className="container relative z-10 py-24">
        <div className="max-w-4xl">
          {/* Badge */}
          {hero.badge_text && (
            <div className={cn(
              'inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-medium',
              'bg-brand-50 border border-brand-200 text-brand-700',
              'animate-fade-in',
              hero.background_type === 'image' && 'bg-white/10 border-white/20 text-white'
            )}>
              <Star className="h-3.5 w-3.5 fill-current" />
              {hero.badge_text}
            </div>
          )}
 
          {/* Headline */}
          <h1 className={cn(
            'hero-headline mb-6',
            inView ? 'animate-fade-up' : 'opacity-0',
            hero.background_type === 'image' ? 'text-white' : 'text-gray-900'
          )}
            dangerouslySetInnerHTML={{ __html: hero.headline }}
          />
 
          {/* Subheadline */}
          {hero.subheadline && (
            <p className={cn(
              'text-lg md:text-xl leading-relaxed mb-10 max-w-2xl',
              inView ? 'animate-fade-up stagger-2' : 'opacity-0',
              hero.background_type === 'image' ? 'text-gray-300' : 'text-gray-600'
            )}>
              {hero.subheadline}
            </p>
          )}
 
          {/* CTAs */}
          <div className={cn(
            'flex flex-wrap gap-4 mb-16',
            inView ? 'animate-fade-up stagger-3' : 'opacity-0'
          )}>
            {hero.cta_primary_link && (
              <Link to={hero.cta_primary_link} className="btn-primary text-base px-8 py-4">
                {hero.cta_primary_text || 'Get Started'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {hero.cta_secondary_link && (
              <Link to={hero.cta_secondary_link}
                className={cn(
                  'btn-secondary text-base px-8 py-4',
                  hero.background_type === 'image' && 'border-white/40 text-white hover:bg-white hover:text-gray-900'
                )}>
                <Play className="h-4 w-4 fill-current" />
                {hero.cta_secondary_text || 'Learn More'}
              </Link>
            )}
          </div>
 
          {/* Stats */}
          {hero.stats && hero.stats.length > 0 && (
            <div className={cn(
              'grid grid-cols-3 gap-8 max-w-lg',
              inView ? 'animate-fade-up stagger-4' : 'opacity-0'
            )}>
              {hero.stats.map((stat, i) => (
                <div key={i} className={cn(
                  'text-left',
                  hero.background_type === 'image' ? '' : ''
                )}>
                  <div className={cn(
                    'font-display text-3xl md:text-4xl font-800 leading-none mb-1',
                    hero.background_type === 'image' ? 'text-white' : 'text-brand-600'
                  )}>
                    {stat.value}
                  </div>
                  <div className={cn(
                    'text-xs font-medium uppercase tracking-wide',
                    hero.background_type === 'image' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
 
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-gray-400 to-transparent" />
      </div>
    </section>
  )
}
 