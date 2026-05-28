// src/pages/public/ProjectDetail.tsx
import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, ExternalLink, Github, BookOpen, Calendar, Clock, Users, Globe, ChevronRight } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { useState } from 'react'
import { useProject, useIncrementView } from '@/hooks/all_hooks'
import { TagBadge } from '@/components/shared/SharedComponents'
import { SkeletonText } from '@/components/shared/SharedComponents'
import { ProjectCard } from './Projects'
import { cn } from '@/lib/utils'

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, isError } = useProject(slug!)
  const incrementView = useIncrementView(slug!)
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const project = data?.data

  // Increment view count once
  useEffect(() => {
    if (project) incrementView.mutate()
  }, [project?.id])

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
        <Link to="/projects" className="btn-primary mt-4">Back to Projects</Link>
      </div>
    </div>
  )

  if (isLoading || !project) return <ProjectDetailSkeleton />

  const lightboxSlides = project.images.map(img => ({ src: img.image_url }))

  return (
    <>
      <Helmet>
        <title>{project.meta_title || `${project.title} | DevSoft BD`}</title>
        <meta name="description" content={project.meta_description || project.short_description} />
        {project.thumbnail_url && <meta property="og:image" content={project.thumbnail_url} />}
      </Helmet>

      {/* ① HERO BANNER */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.title}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy-800 to-brand-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container pb-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Link to="/projects" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Projects
              </Link>
              <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              {project.category_tags[0] && (
                <span className="text-gray-400">{project.category_tags[0].name}</span>
              )}
            </nav>

            <h1 className="hero-headline text-white mb-4 max-w-3xl">{project.title}</h1>
            <p className="text-gray-300 max-w-2xl text-lg leading-relaxed">
              {project.short_description}
            </p>
          </div>
        </div>
      </section>

      {/* ② ACTION BAR — sticky */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container py-3 flex items-center gap-3 flex-wrap">
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer"
              className="btn-primary text-sm py-2">
              <ExternalLink className="h-3.5 w-3.5" /> View Live Site
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer"
              className="btn-secondary text-sm py-2">
              <Github className="h-3.5 w-3.5" /> Source Code
            </a>
          )}
          {project.case_study_url && (
            <a href={project.case_study_url} target="_blank" rel="noopener noreferrer"
              className="btn-ghost text-sm py-2">
              <BookOpen className="h-3.5 w-3.5" /> Case Study
            </a>
          )}
          <div className="ml-auto flex flex-wrap gap-1.5">
            {project.category_tags.map(t => <TagBadge key={t.id} tag={t} />)}
          </div>
        </div>
      </div>

      {/* ③ MAIN CONTENT */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">

            {/* Left — 2 cols */}
            <div className="lg:col-span-2 space-y-14">

              {/* Overview */}
              {project.description && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Project Overview</h2>
                  <div className="prose-devsoft" dangerouslySetInnerHTML={{ __html: project.description }} />
                </div>
              )}

              {/* Challenge / Solution / Outcome */}
              {(project.challenge || project.solution || project.outcome) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {project.challenge && (
                    <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                      <h3 className="font-semibold text-red-800 mb-3 text-sm uppercase tracking-wide">The Challenge</h3>
                      <p className="text-red-700 text-sm leading-relaxed">{project.challenge}</p>
                    </div>
                  )}
                  {project.solution && (
                    <div className="bg-brand-50 rounded-xl p-6 border border-brand-100">
                      <h3 className="font-semibold text-brand-800 mb-3 text-sm uppercase tracking-wide">Our Solution</h3>
                      <p className="text-brand-700 text-sm leading-relaxed">{project.solution}</p>
                    </div>
                  )}
                  {project.outcome && (
                    <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                      <h3 className="font-semibold text-green-800 mb-3 text-sm uppercase tracking-wide">The Outcome</h3>
                      <p className="text-green-700 text-sm leading-relaxed">{project.outcome}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ④ IMAGE GALLERY */}
              {project.images.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                    Screenshots & Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setLightboxIndex(idx)}
                        className="aspect-project rounded-xl overflow-hidden hover:opacity-90 transition-opacity ring-0 hover:ring-2 ring-brand-400 group">
                        <img
                          src={img.thumb_url || img.image_url}
                          alt={img.caption || project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                  {img.caption && (
                    <p className="text-xs text-gray-400 text-center mt-2">Click any image to enlarge</p>
                  )}
                </div>
              )}

              {/* Tech stack */}
              {project.tech_tags.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Tech Stack</h2>
                  <div className="flex flex-wrap gap-3">
                    {project.tech_tags.map(tag => (
                      <span
                        key={tag.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50"
                        style={{ borderColor: tag.color + '60', color: tag.color }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Team */}
              {project.team_members.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Team on This Project</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.team_members.map(m => (
                      <div key={m.id} className="card p-4 flex items-center gap-3">
                        {m.avatar_url ? (
                          <img src={m.avatar_url} alt={m.name}
                            className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm flex-shrink-0">
                            {m.name?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{m.name}</p>
                          <p className="text-xs text-gray-500 truncate">{m.role_on_project}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ⑤ SIDEBAR */}
            <aside className="space-y-6 lg:sticky lg:top-36 h-fit">

              {/* Project details card */}
              <div className="card p-6">
                <h3 className="font-display font-semibold text-gray-900 mb-5 pb-4 border-b border-gray-100">
                  Project Details
                </h3>
                <dl className="space-y-4">
                  {[
                    { icon: Globe,    label: 'Client',    value: project.client_name },
                    { icon: Globe,    label: 'Country',   value: project.client_country },
                    { icon: Calendar, label: 'Completed', value: project.completion_date },
                    { icon: Clock,    label: 'Duration',  value: project.duration },
                    { icon: Users,    label: 'Team Size', value: project.team_size ? `${project.team_size} developers` : null },
                  ].filter(r => r.value).map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
                        <dd className="text-sm font-medium text-gray-900">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Industry tags */}
              {project.industry_tags.length > 0 && (
                <div className="card p-6">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Industry</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.industry_tags.map(t => (
                      <span key={t.id} className="badge text-xs px-3 py-1.5 bg-gray-100 text-gray-700">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Client logo */}
              {project.client_logo_url && (
                <div className="card p-6 text-center">
                  <p className="text-xs text-gray-400 mb-3 uppercase tracking-widest">Client</p>
                  <img src={project.client_logo_url} alt={project.client_name || 'Client'}
                    className="max-h-12 mx-auto object-contain" />
                </div>
              )}

              {/* Live site CTA */}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                  className="btn-primary w-full justify-center py-3.5">
                  <ExternalLink className="h-4 w-4" /> Visit Live Site
                </a>
              )}
            </aside>
          </div>

          {/* ⑥ RELATED PROJECTS */}
          {project.related_projects.length > 0 && (
            <div className="mt-20 pt-14 border-t border-gray-100">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-10">Related Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {project.related_projects.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={lightboxSlides}
      />
    </>
  )
}

function ProjectDetailSkeleton() {
  return (
    <div>
      <div className="h-[55vh] skeleton" />
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
          <div className="lg:col-span-2 space-y-6">
            <div className="skeleton h-8 w-1/3 rounded" />
            <SkeletonText lines={6} />
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="skeleton aspect-project rounded-xl" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-48 rounded-xl" />
            <div className="skeleton h-24 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}