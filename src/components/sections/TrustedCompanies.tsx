 
// ─────────────────────────────────────────────────────────────
// src/components/sections/TrustedCompanies.tsx
// ─────────────────────────────────────────────────────────────
import type { TrustedCompany } from '@/types'
 
interface TrustedCompaniesProps { companies: TrustedCompany[] }
 
export function TrustedCompanies({ companies }: TrustedCompaniesProps) {
  if (!companies.length) return null
  // Double the list for seamless marquee loop
  const doubled = [...companies, ...companies]
 
  return (
    <section className="py-14 bg-gray-50 overflow-hidden">
      <div className="container mb-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
          Trusted by companies worldwide
        </p>
      </div>
      <div className="relative">
        <div className="flex items-center gap-16 marquee-track animate">
          {doubled.map((company, i) => (
            company.logo_url && (
              <a key={`${company.id}-${i}`}
                href={company.website_url || '#'}
                target={company.website_url ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="flex-shrink-0">
                <img src={company.logo_url} alt={company.name}
                  className="h-9 w-auto object-contain grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
                />
              </a>
            )
          ))}
        </div>
      </div>
    </section>
  )
}