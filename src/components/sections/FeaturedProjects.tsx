
// ─────────────────────────────────────────────────────────────
// src/components/sections/FeaturedProjects.tsx
// ─────────────────────────────────────────────────────────────
import { ArrowRight, Code2, ExternalLink, Link } from 'lucide-react'
import type { Project } from '@/types'
import { SectionHeader } from '../shared/SectionHeader'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/utils'
 
interface FeaturedProjectsProps { projects: Project[] }
 
export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const { ref, inView } = useInView()
 
  return (
    <section ref={ref} className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Our Portfolio"
          title="Work That Speaks for Itself"
          subtitle="Explore a selection of our most impactful projects delivered for clients worldwide."
          inView={inView}
        />
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
          {projects.map((project, i) => (
            <article key={project.id}
              className={cn(
                'card group overflow-hidden',
                inView ? `animate-fade-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0'
              )}>
              {/* Thumbnail */}
              <div className="relative overflow-hidden aspect-project bg-gray-100">
                {project.thumbnail_url ? (
                  <img src={project.thumbnail_url} alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                    <Code2 className="h-12 w-12 text-brand-400" />
                  </div>
                )}
 
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-navy-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" /> Live Site
                    </a>
                  )}
                  <Link to={`/projects/${project.slug}`}
                    className="flex items-center gap-1.5 bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-brand-700 transition-colors">
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
 
              {/* Body */}
              <div className="p-6">
                {/* Category tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.category_tags.slice(0, 2).map(tag => (
                    <span key={tag.id} className="badge text-xs px-2.5 py-1"
                      style={{ background: tag.color + '15', color: tag.color }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
 
                <h3 className="font-display font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                  {project.short_description}
                </p>
 
                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tech_tags.slice(0, 4).map(tag => (
                    <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      {tag.name}
                    </span>
                  ))}
                </div>
 
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {project.completion_date && (
                    <span className="text-xs text-gray-400">{project.completion_date}</span>
                  )}
                  <Link to={`/projects/${project.slug}`}
                    className="ml-auto flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                    View More <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
 
        <div className="text-center mt-12">
          <Link to="/projects" className="btn-secondary">
            View All Projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}