// src/pages/public/Index.tsx
import { useOutletContext } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import type { HomepageData } from '@/types'
import Hero from '@/components/sections/Hero'
import { ServicesSection } from '@/components/sections/Services'
import { FeaturedProjects } from '@/components/sections/FeaturedProjects'
import { TrustedCompanies } from '@/components/sections/TrustedCompanies'
import { ClientFeedback } from '@/components/sections/ClientFeedback'
import { IndustryWeServe } from '@/components/sections/IndustryWeServe'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { GetInTouch } from '@/components/sections/GetInTouch'

export default function Index() {
  const { homepage } = useOutletContext<{ homepage: HomepageData }>()
  const s = homepage?.settings

  return (
    <>
      <Helmet>
        <title>{s?.site_name || 'DevSoft BD'} — {s?.site_tagline || 'Professional Software Development'}</title>
        <meta name="description" content={s?.meta_description} />
        {s?.og_image && <meta property="og:image" content={s.og_image} />}
      </Helmet>
      {homepage?.hero            && <Hero hero={homepage.hero} />}
      {homepage?.services?.length   > 0 && <ServicesSection services={homepage.services} />}
      {homepage?.featured_projects?.length > 0 && <FeaturedProjects projects={homepage.featured_projects} />}
      {homepage?.trusted_companies?.length > 0 && <TrustedCompanies companies={homepage.trusted_companies} />}
      {homepage?.testimonials?.length > 0 && <ClientFeedback testimonials={homepage.testimonials} />}
      {homepage?.industries?.length   > 0 && <IndustryWeServe industries={homepage.industries} />}
      {homepage?.why_choose_us?.length > 0 && <WhyChooseUs reasons={homepage.why_choose_us} />}
      <GetInTouch />
    </>
  )
}