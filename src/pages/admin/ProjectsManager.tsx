// src/pages/admin/ProjectsManager.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Star, StarOff, ExternalLink, Plus } from 'lucide-react'
import {
  PageHeader, AdminTable, RowActions, StatusBadge,
  SearchInput, ConfirmDialog,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

const STATUS_FILTERS = ['all', 'draft', 'published', 'featured']

export default function ProjectsManager() {
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('all')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects', { search, status }],
    queryFn: () => adminApi.get('/projects', {
      params: {
        ...(search && { search }),
        ...(status !== 'all' && { status }),
      },
    }).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/projects/${id}`),
    onSuccess: () => {
      toast.success('Project deleted.')
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
      setDeleteId(null)
    },
    onError: () => toast.error('Delete failed.'),
  })

  const featureMutation = useMutation({
    mutationFn: (id: number) => adminApi.patch(`/projects/${id}/feature`),
    onSuccess: () => {
      toast.success('Updated.')
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
    },
  })

  const projects = data?.data || []

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Projects"
        subtitle={`${data?.meta?.total || 0} total projects`}
        action={
          <Link to="/admin/projects/new" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> New Project
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                status === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}>
              {s}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search projects…" />
      </div>

      {/* Table */}
      <AdminTable
        headers={['Project', 'Status', 'Tags', 'Featured', 'Live', 'Date', 'Actions']}
        loading={isLoading}
        emptyMessage="No projects found. Create your first one!">
        {projects.map((project: any) => (
          <tr key={project.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
            {/* Thumbnail + title */}
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {project.thumbnail?.url ? (
                    <img src={project.thumbnail.url} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{project.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{project.short_description}</p>
                </div>
              </div>
            </td>

            {/* Status */}
            <td className="px-5 py-4"><StatusBadge status={project.status} /></td>

            {/* Tags */}
            <td className="px-5 py-4">
              <div className="flex flex-wrap gap-1">
                {project.tags?.slice(0, 3).map((t: any) => (
                  <span key={t.id} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: t.color + '15', color: t.color }}>
                    {t.name}
                  </span>
                ))}
                {project.tags?.length > 3 && (
                  <span className="text-xs text-gray-400">+{project.tags.length - 3}</span>
                )}
              </div>
            </td>

            {/* Featured toggle */}
            <td className="px-5 py-4">
              <button
                onClick={() => featureMutation.mutate(project.id)}
                title={project.is_featured ? 'Remove from featured' : 'Add to featured'}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  project.is_featured ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'
                )}>
                {project.is_featured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
              </button>
            </td>

            {/* Live link */}
            <td className="px-5 py-4">
              {project.live_url ? (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700">
                  <ExternalLink className="h-3.5 w-3.5" /> Live
                </a>
              ) : (
                <span className="text-xs text-gray-300">—</span>
              )}
            </td>

            {/* Date */}
            <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
              {project.created_at
                ? new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'}
            </td>

            {/* Actions */}
            <td className="px-5 py-4">
              <RowActions
                onEdit={() => window.location.href = `/admin/projects/${project.id}/edit`}
                onView={() => window.open(`/projects/${project.slug}`, '_blank')}
                onDelete={() => setDeleteId(project.id)}
              />
            </td>
          </tr>
        ))}
      </AdminTable>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this project?"
        message="The project and all its images will be permanently removed from your portfolio."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}