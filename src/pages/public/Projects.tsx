// src/pages/public/Projects.tsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, ExternalLink, ArrowRight, Filter, X } from 'lucide-react'
import { useProjects } from '@/hooks/all_hooks'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { SkeletonCard } from '@/components/shared/SharedComponents'
import { Pagination } from '@/components/shared/SharedComponents'
import { EmptyState } from '@/components/shared/SharedComponents'
import { TagBadge } from '@/components/shared/SharedComponents'
import type { Project, Tag } from '@/types'

// ── Tags query for filter bar ─────────────────────────────
function useTags() {
  return useQuery({
    queryKey: ['public-tags'],
    queryFn: () => publicApi.get('/projects/featured').then(() =>
      // Tags come from homepage; we'll derive from projects
      Promise.resolve([] as Tag[])
    ),
    staleTime: Infinity,
  })
}

// ── Project Card ──────────────────────────────────────────
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card group overflow-hidden h-full flex flex-col">
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-project bg-gray-100 flex-shrink-0">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
            <span className="text-brand-400 text-4xl font-display font-bold">
              {project.title.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-navy-900/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Live Site
            </a>
          )}
          <Link
            to={`/projects/${project.slug}`}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-brand-700 transition-colors">
            View More <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        {/* Category tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.category_tags.slice(0, 2).map(tag => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>

        <h3 className="font-display font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
          {project.short_description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech_tags.slice(0, 4).map(tag => (
            <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {tag.name}
            </span>
          ))}
          {project.tech_tags.length > 4 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
              +{project.tech_tags.length - 4}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {project.completion_date && (
            <span className="text-xs text-gray-400">{project.completion_date}</span>
          )}
          <Link
            to={`/projects/${project.slug}`}
            className="ml-auto flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            View More <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

// ── Filter bar ────────────────────────────────────────────
const CATEGORY_FILTERS = [
  { label: 'All',            slug: '' },
  { label: 'Web App',        slug: 'web-application' },
  { label: 'Mobile App',     slug: 'mobile-app' },
  { label: 'E-Commerce',     slug: 'e-commerce' },
  { label: 'ERP System',     slug: 'erp-system' },
  { label: 'SaaS',           slug: 'saas' },
]

// ── Main page ─────────────────────────────────────────────
export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const category = searchParams.get('category') || ''
  const tech     = searchParams.get('tech')     || ''
  const page     = parseInt(searchParams.get('page') || '1')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const filters = {
    ...(category        && { category }),
    ...(tech            && { tech }),
    ...(debouncedSearch && { search: debouncedSearch }),
    page,
  }

  const { data, isLoading } = useProjects(filters)

  function setFilter(key: string, value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    })
  }

  const hasFilters = category || tech || debouncedSearch

  return (
    <>
      <Helmet>
        <title>Our Projects — DevSoft BD</title>
        <meta name="description" content="Explore our portfolio of 200+ successful projects across web, mobile, and enterprise software." />
      </Helmet>

      {/* Hero banner */}
      <section className="bg-navy-800 py-20">
        <div className="container text-center">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">Our Portfolio</p>
          <h1 className="section-headline text-white mb-4">Projects That Make a Difference</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            200+ successful deliveries across 15+ countries. Browse our work by technology, category, or industry.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Category pills */}
            <div className="flex gap-2 flex-wrap flex-1">
              {CATEGORY_FILTERS.map(f => (
                <button
                  key={f.slug}
                  onClick={() => setFilter('category', f.slug)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                    category === f.slug
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-brand-400 bg-gray-50"
              />
              {search && (
                <button onClick={() => { setSearch(''); setDebouncedSearch('') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Clear all */}
            {hasFilters && (
              <button
                onClick={() => { setSearchParams({}); setSearch('') }}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors whitespace-nowrap">
                <X className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="section">
        <div className="container">
          {/* Result count */}
          {data && !isLoading && (
            <p className="text-sm text-gray-500 mb-8">
              Showing <strong>{data.data.length}</strong> of <strong>{data.meta.total}</strong> projects
            </p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : data?.data.length === 0 ? (
            <EmptyState
              icon={<Filter className="h-7 w-7" />}
              title="No projects found"
              subtitle="Try adjusting your filters or search term."
              action={
                <button onClick={() => { setSearchParams({}); setSearch('') }}
                  className="btn-secondary text-sm">
                  Clear all filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data?.data.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {data && (
            <Pagination
              currentPage={data.meta.current_page}
              lastPage={data.meta.last_page}
              onPageChange={p => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n })}
            />
          )}
        </div>
      </section>
    </>
  )
}