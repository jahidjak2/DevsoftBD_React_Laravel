
// ─────────────────────────────────────────────────────────────
// src/pages/public/ServiceDetail.tsx
// ─────────────────────────────────────────────────────────────
import { useParams } from 'react-router-dom'
import { useService } from '@/hooks/all_hooks'
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
 
export function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: service, isLoading } = useService(slug!)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
 
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!service) return <div className="container py-20 text-center"><h2 className="text-xl font-bold">Service not found</h2><Link to="/services" className="btn-primary mt-4">Back to Services</Link></div>
 
  return (
    <>
      <Helmet>
        <title>{service.meta_title || `${service.title} | DevSoft BD`}</title>
        <meta name="description" content={service.meta_description || service.short_description} />
      </Helmet>
 
      {/* Hero */}
      <section className="bg-navy-800 py-24">
        <div className="container max-w-3xl text-center">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">{service.category}</p>
          <h1 className="section-headline text-white mb-4">{service.title}</h1>
          <p className="text-gray-400 text-lg">{service.short_description}</p>
          {service.cta_link && (
            <Link to={service.cta_link} className="btn-primary mt-8 inline-flex">{service.cta_text || 'Get Started'}</Link>
          )}
        </div>
      </section>
 
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {service.description && (
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">About This Service</h2>
                <div className="prose-devsoft" dangerouslySetInnerHTML={{ __html: service.description }} />
              </div>
            )}
 
            {/* Features */}
            {service.features?.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.features.map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
 
            {/* Process */}
            {service.process_steps?.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">How We Work</h2>
                <div className="space-y-6">
                  {service.process_steps.map((step: any) => (
                    <div key={step.step} className="flex gap-5">
                      <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="pt-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
 
            {/* FAQ */}
            {service.faq?.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {service.faq.map((item: any, i: number) => (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                        {openFaq === i ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                      </button>
                      {openFaq === i && (
                        <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
 
          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-36 h-fit">
            {service.technologies?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-widest">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {service.technologies.map((t: string) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="card p-6 bg-brand-600 border-brand-700 text-center">
              <h3 className="font-display font-bold text-white mb-2">Ready to Start?</h3>
              <p className="text-brand-100 text-sm mb-5">Tell us about your project and we'll get back within 24 hours.</p>
              <Link to="/contact" className="bg-white text-brand-700 font-semibold px-6 py-2.5 rounded-full hover:bg-brand-50 transition-colors text-sm inline-block">
                Get a Free Quote
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
export default ServiceDetail