// src/pages/employee/MyProjects.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { employeeApi } from '@/lib/api'
import {
  Briefcase, Calendar, Clock, Users, ChevronRight,
  Target, Code2, X, CheckCircle, Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  planning:  { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-l-purple-400' },
  active:    { bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-l-green-400'  },
  on_hold:   { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-l-amber-400'  },
  completed: { bg: 'bg-gray-50',    text: 'text-gray-600',   border: 'border-l-gray-300'   },
  cancelled: { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-l-red-400'    },
}

const PRIORITY_STYLES: Record<string, string> = {
  low:      'bg-gray-100 text-gray-500',
  medium:   'bg-blue-100 text-blue-600',
  high:     'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-700',
}

export default function MyProjects() {
  const [selected, setSelected] = useState<any | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['employee-projects', statusFilter],
    queryFn: () => employeeApi.get('/projects', {
      params: statusFilter !== 'all' ? { status: statusFilter } : {},
    }).then(r => r.data.data),
  })

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['employee-project-detail', selected?.id],
    queryFn: () => employeeApi.get(`/projects/${selected.id}`).then(r => r.data.data),
    enabled: !!selected?.id,
  })

  const projects = (data as any[]) || []
  const STATUS_FILTERS = ['all', 'active', 'planning', 'on_hold', 'completed']

  const daysLeft = (deadline: string | null) => {
    if (!deadline) return null
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-sm text-gray-500 mt-1">Projects you are currently assigned to.</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
              statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}>
            {s === 'on_hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <Briefcase className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No projects found</p>
          <p className="text-sm text-gray-400 mt-1">
            {statusFilter !== 'all' ? `No ${statusFilter} projects assigned.` : 'You haven\'t been assigned to any projects yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj: any) => {
            const dl = daysLeft(proj.deadline)
            const isOverdue = dl !== null && dl < 0 && proj.status !== 'completed'
            const style = STATUS_STYLES[proj.status] || STATUS_STYLES.planning
            const completedMilestones = proj.completed_milestones || 0
            const totalMilestones     = proj.milestone_count      || 0
            const milestonePercent    = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

            return (
              <div
                key={proj.id}
                onClick={() => setSelected(proj)}
                className={cn(
                  'bg-white rounded-xl border border-l-4 p-5 shadow-sm cursor-pointer hover:shadow-md transition-all',
                  style.border,
                  selected?.id === proj.id && 'ring-2 ring-brand-400'
                )}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {proj.code}
                      </span>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize', style.bg, style.text)}>
                        {proj.status === 'on_hold' ? 'On Hold' : proj.status}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-gray-900 line-clamp-1">{proj.name}</h3>
                  </div>
                  <span className={cn('text-[10px] px-2 py-1 rounded-full font-semibold capitalize flex-shrink-0', PRIORITY_STYLES[proj.priority])}>
                    {proj.priority}
                  </span>
                </div>

                {/* My role */}
                {proj.my_role && (
                  <p className="text-xs text-brand-600 font-medium mb-2">
                    My role: {proj.my_role}
                  </p>
                )}

                {/* Milestone progress */}
                {totalMilestones > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Milestones</span>
                      <span className="font-medium">{completedMilestones}/{totalMilestones}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${milestonePercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-50">
                  {proj.manager && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {proj.manager}
                    </span>
                  )}
                  {proj.deadline && (
                    <span className={cn('flex items-center gap-1 ml-auto', isOverdue ? 'text-red-500 font-semibold' : dl !== null && dl <= 7 ? 'text-amber-600' : 'text-gray-400')}>
                      <Calendar className="h-3 w-3" />
                      {isOverdue ? `${Math.abs(dl!)}d overdue` : dl !== null ? `${dl}d left` : proj.deadline}
                    </span>
                  )}
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative ml-auto bg-white h-full w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-mono text-xs text-gray-400">{selected.code}</p>
                <h2 className="font-display font-bold text-gray-900">{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
                </div>
              ) : detail ? (
                <>
                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Status',     value: detail.status?.replace('_', ' ')   },
                      { label: 'Priority',   value: detail.priority                     },
                      { label: 'Start',      value: detail.start_date  || '—'           },
                      { label: 'Deadline',   value: detail.deadline    || '—'           },
                      { label: 'Manager',    value: detail.manager     || '—'           },
                      { label: 'My Role',    value: detail.my_role     || '—'           },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  {detail.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">Description</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{detail.description}</p>
                    </div>
                  )}

                  {/* Tech stack */}
                  {detail.technologies?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-gray-400" /> Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {detail.technologies.map((t: string) => (
                          <span key={t} className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-full font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestones */}
                  {detail.milestones?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" /> Milestones
                      </h3>
                      <div className="space-y-2">
                        {detail.milestones.map((ms: any) => (
                          <div key={ms.title} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            {ms.completed_at
                              ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              : <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                            }
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-medium', ms.completed_at ? 'text-gray-400 line-through' : 'text-gray-900')}>
                                {ms.title}
                              </p>
                              <p className="text-xs text-gray-400">Due: {ms.due_date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team */}
                  {detail.team?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" /> Team
                      </h3>
                      <div className="space-y-2">
                        {detail.team.map((member: any) => (
                          <div key={member.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold flex-shrink-0">
                              {member.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-400">{member.role || member.designation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {detail.notes && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1.5">Notes</p>
                      <p className="text-sm text-amber-900">{detail.notes}</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}