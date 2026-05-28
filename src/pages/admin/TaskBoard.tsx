import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { adminApi } from '@/lib/api'
import { cn } from '@/lib/utils'

import { PageHeader, FormSelect } from '@/components/admin/AdminShared'
// ══════════════════════════════════════════════════════════════
// src/pages/admin/TaskBoard.tsx
// ══════════════════════════════════════════════════════════════
export function TaskBoard() {
  const [projectId, setProjectId] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [addingStatus, setAddingStatus] = useState<string | null>(null)
  const qc = useQueryClient()
 
  const COLUMNS = [
    { key: 'todo',        label: 'To Do',       color: 'bg-gray-100 text-gray-700' },
    { key: 'in_progress', label: 'In Progress',  color: 'bg-blue-100 text-blue-700' },
    { key: 'in_review',   label: 'In Review',    color: 'bg-purple-100 text-purple-700' },
    { key: 'done',        label: 'Done',         color: 'bg-green-100 text-green-700' },
  ]
 
  const { data: projects } = useQuery({
    queryKey: ['admin-internal-projects-list'],
    queryFn: () => adminApi.get('/internal-projects').then(r => r.data.data?.data || []),
  })
 
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['admin-tasks', projectId],
    queryFn: () => adminApi.get('/tasks', { params: projectId ? { project_id: projectId } : {} }).then(r => r.data.data),
    enabled: true,
  })
 
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminApi.patch(`/tasks/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tasks'] }),
  })
 
  const priorityColor: Record<string, string> = { low: 'bg-gray-100 text-gray-500', medium: 'bg-blue-100 text-blue-600', high: 'bg-orange-100 text-orange-600', critical: 'bg-red-100 text-red-600' }
 
  return (
    <div className="space-y-6">
      <PageHeader title="Task Board" subtitle="Kanban view of all project tasks"
        action={
          <FormSelect value={projectId} onChange={e => setProjectId(e.target.value)} className="w-56">
            <option value="">All Projects</option>
            {(projects as any[] || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </FormSelect>
        }
      />
 
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-13rem)]">
        {COLUMNS.map(col => {
          const tasks = tasksData?.[col.key] || []
          return (
            <div key={col.key} className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', col.color)}>{col.label}</span>
                  <span className="text-xs text-gray-400 font-medium">{tasks.length}</span>
                </div>
              </div>
              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />) :
                  tasks.map((task: any) => {
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && col.key !== 'done'
                    return (
                      <div key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={cn('bg-white rounded-xl p-3.5 border cursor-pointer hover:shadow-sm transition-all', isOverdue ? 'border-red-200' : 'border-gray-100 hover:border-brand-200')}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{task.title}</p>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full flex-shrink-0', priorityColor[task.priority])}>{task.priority}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {task.due_date && <span className={cn('flex items-center gap-1', isOverdue ? 'text-red-500' : 'text-gray-400')}>{isOverdue ? '⚠ ' : ''}{task.due_date}</span>}
                          {task.comment_count > 0 && <span>{task.comment_count} 💬</span>}
                          {task.assigned_to_name && (
                            <div className="ml-auto flex items-center gap-1">
                              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-[10px] font-bold">
                                {task.assigned_to_name?.substring(0, 1)}
                              </div>
                            </div>
                          )}
                        </div>
                        {col.key !== 'done' && (
                          <div className="flex gap-1 mt-2 pt-2 border-t border-gray-50">
                            {COLUMNS.filter(c => c.key !== col.key && c.key !== 'todo').slice(0, 2).map(c => (
                              <button key={c.key} onClick={e => { e.stopPropagation(); updateStatus.mutate({ id: task.id, status: c.key }) }}
                                className="text-xs text-gray-400 hover:text-brand-600 transition-colors">
                                → {c.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export { TaskBoard as default }