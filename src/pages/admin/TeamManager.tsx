// src/pages/admin/TaskBoard.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import {
  Plus, X, Clock, MessageSquare, AlertTriangle,
  ChevronRight, Send, Timer, Edit2, Trash2, Loader2,
} from 'lucide-react'
import {
  FormField, FormInput, FormTextarea, FormSelect,
  SaveButton, PriorityBadge, StatusBadge, ConfirmDialog,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { key: 'todo',        label: 'To Do',      color: 'bg-gray-100 text-gray-700',    border: 'border-t-gray-300'   },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700',   border: 'border-t-blue-400'   },
  { key: 'in_review',   label: 'In Review',   color: 'bg-purple-100 text-purple-700',border: 'border-t-purple-400'},
  { key: 'done',        label: 'Done',        color: 'bg-green-100 text-green-700', border: 'border-t-green-400'  },
]

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-gray-400', medium: 'bg-blue-500', high: 'bg-orange-500', critical: 'bg-red-500',
}

export default function TaskBoard() {
  const [projectId, setProjectId]     = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTaskStatus, setNewTaskStatus] = useState('todo')
  const [comment, setComment]         = useState('')
  const [timeHours, setTimeHours]     = useState('')
  const [timeDate, setTimeDate]       = useState(new Date().toISOString().substring(0, 10))
  const [timeNote, setTimeNote]       = useState('')
  const [deleteId, setDeleteId]       = useState<number | null>(null)
  const [dragging, setDragging]       = useState<number | null>(null)
  const qc = useQueryClient()

  // Load projects for filter
  const { data: projects } = useQuery({
    queryKey: ['admin-projects-for-tasks'],
    queryFn: () => adminApi.get('/internal-projects', { params: { status: 'active' } }).then(r => r.data.data?.data || []),
  })

  // Load employees for assignee dropdown
  const { data: employees } = useQuery({
    queryKey: ['admin-employees-list'],
    queryFn: () => adminApi.get('/employees', { params: { active: true } }).then(r => r.data.data?.data || []),
  })

  // Load tasks grouped by status
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['admin-tasks', projectId],
    queryFn: () => adminApi.get('/tasks', {
      params: projectId ? { project_id: projectId } : {},
    }).then(r => r.data.data),
    refetchInterval: 15000,
  })

  // Load task detail
  const { data: taskDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-task-detail', selectedTask?.id],
    queryFn: () => adminApi.get(`/tasks/${selectedTask.id}`).then(r => r.data.data),
    enabled: !!selectedTask?.id,
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      internal_project_id: projectId, title: '', description: '',
      assigned_to: '', priority: 'medium', due_date: '',
      estimated_hours: '', status: 'todo',
    },
  })

  const createMutation = useMutation({
    mutationFn: (d: any) => adminApi.post('/tasks', { ...d, internal_project_id: projectId || d.internal_project_id, status: newTaskStatus }),
    onSuccess: () => {
      toast.success('Task created.')
      qc.invalidateQueries({ queryKey: ['admin-tasks'] })
      reset(); setShowNewTask(false)
    },
    onError: () => toast.error('Failed to create task.'),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.patch(`/tasks/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tasks'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/tasks/${id}`),
    onSuccess: () => {
      toast.success('Task deleted.')
      qc.invalidateQueries({ queryKey: ['admin-tasks'] })
      setDeleteId(null)
      if (selectedTask?.id === deleteId) setSelectedTask(null)
    },
  })

  const commentMutation = useMutation({
    mutationFn: ({ taskId, text }: { taskId: number; text: string }) =>
      adminApi.post(`/tasks/${taskId}/comments`, { comment: text }),
    onSuccess: () => {
      toast.success('Comment added.')
      qc.invalidateQueries({ queryKey: ['admin-task-detail', selectedTask?.id] })
      setComment('')
    },
  })

  const timeLogMutation = useMutation({
    mutationFn: ({ taskId, hours, date, note, employee_id }: any) =>
      adminApi.post(`/tasks/${taskId}/time-logs`, { hours: parseFloat(hours), date, note, employee_id }),
    onSuccess: () => {
      toast.success('Time logged.')
      qc.invalidateQueries({ queryKey: ['admin-task-detail', selectedTask?.id] })
      setTimeHours(''); setTimeNote('')
    },
    onError: () => toast.error('Failed to log time.'),
  })

  // Drag-and-drop handlers
  function handleDragStart(taskId: number) { setDragging(taskId) }
  function handleDragOver(e: React.DragEvent) { e.preventDefault() }
  function handleDrop(e: React.DragEvent, colKey: string) {
    e.preventDefault()
    if (dragging) {
      updateStatusMutation.mutate({ id: dragging, status: colKey })
      setDragging(null)
    }
  }

  const isOverdue = (task: any) =>
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  return (
    <div className="space-y-5 flex flex-col" style={{ height: 'calc(100vh - 9rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Task Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kanban view — drag cards to move between columns</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Project filter */}
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400 transition-colors w-56">
            <option value="">All Active Projects</option>
            {((projects as any[]) || []).map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => { setNewTaskStatus('todo'); setShowNewTask(true) }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 flex-1 overflow-x-auto overflow-y-hidden pb-2">
        {COLUMNS.map(col => {
          const tasks = tasksData?.[col.key] || []
          return (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.key)}
              className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 min-w-[280px] w-72 flex-shrink-0 overflow-hidden">

              {/* Column header */}
              <div className={cn('px-4 py-3 border-b-2 border-t-4 bg-white', col.border)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', col.color)}>
                      {col.label}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{tasks.length}</span>
                  </div>
                  <button
                    onClick={() => { setNewTaskStatus(col.key); setShowNewTask(true) }}
                    className="p-1 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {isLoading
                  ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
                  : tasks.map((task: any) => {
                    const overdue = isOverdue(task)
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          'bg-white rounded-xl p-3.5 border cursor-pointer select-none transition-all hover:shadow-sm active:opacity-70',
                          selectedTask?.id === task.id ? 'border-brand-400 shadow-sm' : 'border-gray-100 hover:border-gray-200',
                          overdue && 'border-l-2 border-l-red-400'
                        )}>
                        {/* Priority + tags row */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', PRIORITY_DOT[task.priority])} title={task.priority} />
                          {task.tags?.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{tag}</span>
                          ))}
                          {overdue && (
                            <span className="ml-auto flex items-center gap-1 text-[10px] text-red-600 font-semibold">
                              <AlertTriangle className="h-3 w-3" /> Overdue
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2.5">{task.title}</p>

                        {/* Footer */}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {task.due_date && (
                            <span className={cn('flex items-center gap-1', overdue && 'text-red-500')}>
                              <Clock className="h-3 w-3" />
                              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {task.comment_count > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> {task.comment_count}
                            </span>
                          )}
                          {task.estimated_hours && (
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" /> {task.estimated_hours}h
                            </span>
                          )}
                          {task.assigned_to_name && (
                            <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-[9px] font-bold">
                                {task.assigned_to_name.substring(0, 1)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Move buttons (visible on hover) */}
                        {col.key !== 'done' && (
                          <div className="flex gap-1 mt-2.5 pt-2 border-t border-gray-50">
                            {COLUMNS.filter(c => c.key !== col.key).slice(0, 3).map(c => (
                              <button
                                key={c.key}
                                onClick={e => { e.stopPropagation(); updateStatusMutation.mutate({ id: task.id, status: c.key }) }}
                                className="text-[10px] text-gray-400 hover:text-brand-600 transition-colors flex items-center gap-0.5">
                                <ChevronRight className="h-3 w-3" />{c.label}
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

      {/* Task detail drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="relative ml-auto bg-white h-full w-full max-w-xl flex flex-col shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTask.status} />
                <PriorityBadge priority={selectedTask.priority} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDeleteId(selectedTask.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => setSelectedTask(null)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
                </div>
              ) : taskDetail ? (
                <>
                  {/* Title */}
                  <div>
                    <h2 className="font-display text-lg font-bold text-gray-900 mb-1">{taskDetail.title}</h2>
                    {taskDetail.project_name && (
                      <p className="text-xs text-gray-400">Project: <span className="font-medium text-gray-600">{taskDetail.project_name} ({taskDetail.project_code})</span></p>
                    )}
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Assigned To', value: taskDetail.assigned_to_name || 'Unassigned' },
                      { label: 'Due Date',    value: taskDetail.due_date || '—' },
                      { label: 'Estimated',   value: taskDetail.estimated_hours ? `${taskDetail.estimated_hours}h` : '—' },
                      { label: 'Logged',      value: taskDetail.logged_hours ? `${taskDetail.logged_hours}h` : '0h' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Move status */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Move to column</p>
                    <div className="flex gap-2 flex-wrap">
                      {COLUMNS.filter(c => c.key !== taskDetail.status).map(c => (
                        <button
                          key={c.key}
                          onClick={() => {
                            updateStatusMutation.mutate({ id: taskDetail.id, status: c.key })
                            setSelectedTask((prev: any) => ({ ...prev, status: c.key }))
                          }}
                          className={cn('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors', c.color, 'hover:opacity-80')}>
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  {taskDetail.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{taskDetail.description}</p>
                    </div>
                  )}

                  {/* Log time */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Log Time</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Hours</label>
                        <input
                          type="number" min="0.25" max="24" step="0.25"
                          value={timeHours} onChange={e => setTimeHours(e.target.value)}
                          placeholder="e.g. 2.5"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date</label>
                        <input type="date" value={timeDate} onChange={e => setTimeDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 mb-1 block">Employee</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-400"
                        id="time-log-employee">
                        <option value="">Select employee</option>
                        {((employees as any[]) || []).map((e: any) => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                    <input value={timeNote} onChange={e => setTimeNote(e.target.value)}
                      placeholder="Brief note (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 mb-3" />
                    <button
                      onClick={() => {
                        const empEl = document.getElementById('time-log-employee') as HTMLSelectElement
                        if (!timeHours || !empEl?.value) { toast.error('Enter hours and select employee.'); return }
                        timeLogMutation.mutate({ taskId: taskDetail.id, hours: timeHours, date: timeDate, note: timeNote, employee_id: empEl.value })
                      }}
                      disabled={timeLogMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                      {timeLogMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Timer className="h-4 w-4" />}
                      Log Time
                    </button>

                    {/* Time log history */}
                    {taskDetail.time_logs?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                        {taskDetail.time_logs.map((log: any) => (
                          <div key={log.id} className="flex items-center justify-between text-xs text-gray-500">
                            <span>{log.employee} — {log.date}</span>
                            <span className="font-semibold text-gray-700">{log.hours}h</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                      Comments ({taskDetail.comments?.length || 0})
                    </p>
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                      {taskDetail.comments?.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No comments yet.</p>
                      ) : taskDetail.comments?.map((c: any) => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold flex-shrink-0">
                            {c.user_name?.substring(0, 1)}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-700">{c.user_name}</span>
                              <span className="text-[10px] text-gray-400">{c.created_at}</span>
                            </div>
                            <p className="text-sm text-gray-700">{c.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); comment.trim() && commentMutation.mutate({ taskId: taskDetail.id, text: comment }) }}}
                        rows={2}
                        placeholder="Add a comment… (Enter to send)"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 resize-none" />
                      <button
                        onClick={() => comment.trim() && commentMutation.mutate({ taskId: taskDetail.id, text: comment })}
                        disabled={!comment.trim() || commentMutation.isPending}
                        className="w-9 h-9 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0 self-end">
                        {commentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* New task form */}
      {showNewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNewTask(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-gray-900">New Task — {COLUMNS.find(c => c.key === newTaskStatus)?.label}</h3>
              <button onClick={() => setShowNewTask(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
              {!projectId && (
                <FormField label="Project" required>
                  <FormSelect {...register('internal_project_id')}>
                    <option value="">Select project</option>
                    {((projects as any[]) || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </FormSelect>
                </FormField>
              )}
              <FormField label="Task Title" required>
                <FormInput {...register('title')} placeholder="Describe what needs to be done…" autoFocus />
              </FormField>
              <FormField label="Description">
                <FormTextarea {...register('description')} rows={2} placeholder="More details (optional)…" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Assign To">
                  <FormSelect {...register('assigned_to')}>
                    <option value="">Unassigned</option>
                    {((employees as any[]) || []).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </FormSelect>
                </FormField>
                <FormField label="Priority">
                  <FormSelect {...register('priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </FormSelect>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Due Date">
                  <FormInput {...register('due_date')} type="date" />
                </FormField>
                <FormField label="Estimated Hours">
                  <FormInput {...register('estimated_hours')} type="number" step="0.5" placeholder="8" />
                </FormField>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewTask(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <SaveButton loading={createMutation.isPending} label="Create Task" />
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this task?"
        message="All comments and time logs for this task will also be deleted."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}