// src/pages/public/ServicesPage.tsx
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight } from 'lucide-react'
import { useServices } from '@/hooks/useServices'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { cn } from '@/lib/utils'
 
export default function ServicesPage() {
  const { data: categories, isLoading } = useServices()
 
  return (
    <>
      <Helmet>
        <title>Our Services — DevSoft BD</title>
        <meta name="description" content="Full-stack software development services from web and mobile to AI, ERP, and cloud solutions." />
      </Helmet>
 
      <section className="bg-navy-800 py-20">
        <div className="container text-center">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">What We Offer</p>
          <h1 className="section-headline text-white mb-4">End-to-End Software Services</h1>
          <p className="text-gray-400 max-w-xl mx-auto">From idea to launch — we cover every layer of software development.</p>
        </div>
      </section>
 
      <section className="section">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            (categories as any[])?.map((cat: any) => (
              <div key={cat.id} className="mb-16">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
                  {cat.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cat.services?.map((s: any, i: number) => (
                    <Link key={s.id} to={`/services/${s.slug}`}
                      className="card p-6 group hover:border-brand-200">
                      <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-100 transition-colors">
                        <span className="text-brand-600 text-xl">⚡</span>
                      </div>
                      <h3 className="font-display font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                        {s.short_description}
                      </p>
                      <span className="flex items-center gap-1 text-sm text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Learn more <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}