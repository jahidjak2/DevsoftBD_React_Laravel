// src/pages/employee/MyTasks.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '@/lib/api'
import { toast } from 'sonner'
import {
  ListTodo, Clock, AlertTriangle, CheckCircle, Circle,
  MessageSquare, Timer, X, Send, Loader2, ChevronRight,
  LayoutGrid, List,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_COLUMNS = [
  { key: 'todo',        label: 'To Do',      color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400'   },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'   },
  { key: 'in_review',   label: 'In Review',   color: 'bg-purple-100 text-purple-700',dot: 'bg-purple-500'},
  { key: 'done',        label: 'Done',        color: 'bg-green-100 text-green-700', dot: 'bg-green-500'  },
]

const PRIORITY_COLORS: Record<string, string> = {
  low:      'bg-gray-100 text-gray-500',
  medium:   'bg-blue-100 text-blue-600',
  high:     'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-700',
}

export default function MyTasks() {
  const [view, setView]             = useState<'kanban' | 'list'>('list')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [comment, setComment]       = useState('')
  const [timeHours, setTimeHours]   = useState('')
  const [timeDate, setTimeDate]     = useState(new Date().toISOString().substring(0, 10))
  const [timeNote, setTimeNote]     = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['employee-tasks', statusFilter],
    queryFn: () => employeeApi.get('/tasks', {
      params: statusFilter !== 'all' ? { status: statusFilter } : {},
    }).then(r => r.data.data),
    refetchInterval: 30000,
  })

  const { data: taskDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['employee-task-detail', selectedTask?.id],
    queryFn: () => employeeApi.get(`/tasks/${selectedTask.id}`).then(r => r.data.data),
    enabled: !!selectedTask?.id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      employeeApi.patch(`/tasks/${id}/status`, { status }),
    onSuccess: (_, vars) => {
      toast.success(`Moved to ${vars.status.replace('_', ' ')}.`)
      qc.invalidateQueries({ queryKey: ['employee-tasks'] })
      if (selectedTask?.id === vars.id) {
        setSelectedTask((prev: any) => ({ ...prev, status: vars.status }))
      }
    },
    onError: () => toast.error('Status update failed.'),
  })

  const commentMutation = useMutation({
    mutationFn: ({ taskId, text }: { taskId: number; text: string }) =>
      employeeApi.post(`/tasks/${taskId}/comments`, { comment: text }),
    onSuccess: () => {
      toast.success('Comment added.')
      qc.invalidateQueries({ queryKey: ['employee-task-detail', selectedTask?.id] })
      setComment('')
    },
    onError: () => toast.error('Failed to add comment.'),
  })

  const timeLogMutation = useMutation({
    mutationFn: ({ taskId, hours, date, note }: any) =>
      employeeApi.post(`/tasks/${taskId}/time-logs`, { hours: parseFloat(hours), date, note }),
    onSuccess: () => {
      toast.success('Time logged successfully.')
      qc.invalidateQueries({ queryKey: ['employee-task-detail', selectedTask?.id] })
      setTimeHours(''); setTimeNote('')
    },
    onError: () => toast.error('Failed to log time.'),
  })

  const tasks = (data as any[]) || []
  const isOverdue = (task: any) =>
    task.due_date && new Date(task.due_date) < new Date() && !['done', 'cancelled'].includes(task.status)

  const tasksByStatus: Record<string, any[]> = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key)
    return acc
  }, {} as any)

  const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    todo:        ['in_progress'],
    in_progress: ['in_review', 'done'],
    in_review:   ['in_progress', 'done'],
    done:        [],
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
            {tasks.filter(t => isOverdue(t)).length > 0 && (
              <span className="ml-2 text-red-500 font-medium">
                · {tasks.filter(t => isOverdue(t)).length} overdue
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setView('list')}
              className={cn('p-1.5 rounded-lg transition-colors', view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setView('kanban')}
              className={cn('p-1.5 rounded-lg transition-colors', view === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status filter (list view) */}
      {view === 'list' && (
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {['all', ...STATUS_COLUMNS.map(c => c.key)].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {s === 'in_progress' ? 'In Progress' : s === 'in_review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <CheckCircle className="h-10 w-10 text-green-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">All clear!</p>
          <p className="text-sm text-gray-400 mt-1">No tasks assigned to you right now.</p>
        </div>
      ) : view === 'list' ? (
        /* ── LIST VIEW ──────────────────────────────────── */
        <div className="space-y-2">
          {tasks.map((task: any) => {
            const overdue  = isOverdue(task)
            const colStyle = STATUS_COLUMNS.find(c => c.key === task.status)
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={cn(
                  'bg-white rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-all',
                  overdue ? 'border-l-4 border-l-red-400' : 'border-gray-100',
                  selectedTask?.id === task.id && 'ring-2 ring-brand-400'
                )}>
                <div className="flex items-start gap-3">
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', colStyle?.dot || 'bg-gray-300')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1 flex-1">{task.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', PRIORITY_COLORS[task.priority])}>
                          {task.priority}
                        </span>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', colStyle?.color)}>
                          {colStyle?.label || task.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 flex-wrap">
                      {task.project_name && (
                        <span className="font-medium text-gray-500">{task.project_name}</span>
                      )}
                      {task.milestone && <span>{task.milestone}</span>}
                      {task.due_date && (
                        <span className={cn('flex items-center gap-1', overdue ? 'text-red-500 font-semibold' : '')}>
                          <Clock className="h-3 w-3" />
                          {overdue ? `${Math.abs(Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000))}d overdue` : task.due_date}
                        </span>
                      )}
                      {task.comment_count > 0 && (
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{task.comment_count}</span>
                      )}
                      {task.estimated_hours && (
                        <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{task.logged_hours || 0}/{task.estimated_hours}h</span>
                      )}
                    </div>
                    {/* Quick move buttons */}
                    {ALLOWED_TRANSITIONS[task.status]?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {ALLOWED_TRANSITIONS[task.status].map(nextStatus => {
                          const col = STATUS_COLUMNS.find(c => c.key === nextStatus)
                          return (
                            <button
                              key={nextStatus}
                              onClick={e => { e.stopPropagation(); updateStatusMutation.mutate({ id: task.id, status: nextStatus }) }}
                              disabled={updateStatusMutation.isPending}
                              className={cn('text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors hover:opacity-80', col?.color)}>
                              → {col?.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── KANBAN VIEW ────────────────────────────────── */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-x-auto">
          {STATUS_COLUMNS.map(col => {
            const colTasks = tasksByStatus[col.key] || []
            return (
              <div key={col.key} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-64">
                <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between">
                  <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', col.color)}>{col.label}</span>
                  <span className="text-xs text-gray-400">{colTasks.length}</span>
                </div>
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {colTasks.map((task: any) => {
                    const overdue = isOverdue(task)
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          'bg-white rounded-xl p-3 border cursor-pointer hover:shadow-sm transition-all',
                          overdue ? 'border-l-2 border-l-red-400 border-gray-100' : 'border-gray-100 hover:border-brand-200',
                          selectedTask?.id === task.id && 'border-brand-400'
                        )}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', col.dot)} />
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', PRIORITY_COLORS[task.priority])}>
                            {task.priority}
                          </span>
                          {overdue && <AlertTriangle className="h-3 w-3 text-red-500 ml-auto" />}
                        </div>
                        <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-2">{task.title}</p>
                        {task.due_date && (
                          <p className={cn('text-[10px] flex items-center gap-1', overdue ? 'text-red-500' : 'text-gray-400')}>
                            <Clock className="h-2.5 w-2.5" />{task.due_date}
                          </p>
                        )}
                      </div>
                    )
                  })}
                  {colTasks.length === 0 && (
                    <div className="py-6 text-center text-xs text-gray-300">Empty</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Task detail drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="relative ml-auto bg-white h-full w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium',
                  STATUS_COLUMNS.find(c => c.key === selectedTask.status)?.color || 'bg-gray-100 text-gray-600')}>
                  {STATUS_COLUMNS.find(c => c.key === selectedTask.status)?.label || selectedTask.status}
                </span>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', PRIORITY_COLORS[selectedTask.priority])}>
                  {selectedTask.priority}
                </span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
                </div>
              ) : taskDetail ? (
                <>
                  <h2 className="font-display text-lg font-bold text-gray-900">{taskDetail.title}</h2>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Project',   value: taskDetail.project_name || '—' },
                      { label: 'Milestone', value: taskDetail.milestone    || '—' },
                      { label: 'Due Date',  value: taskDetail.due_date     || '—' },
                      { label: 'Progress',  value: `${taskDetail.logged_hours || 0} / ${taskDetail.estimated_hours || '?'}h` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  {taskDetail.description && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{taskDetail.description}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {taskDetail.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {taskDetail.tags.map((tag: string) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-mono">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Move task */}
                  {ALLOWED_TRANSITIONS[taskDetail.status]?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Move Task</p>
                      <div className="flex gap-2">
                        {ALLOWED_TRANSITIONS[taskDetail.status].map(nextStatus => {
                          const col = STATUS_COLUMNS.find(c => c.key === nextStatus)
                          return (
                            <button
                              key={nextStatus}
                              onClick={() => updateStatusMutation.mutate({ id: taskDetail.id, status: nextStatus })}
                              disabled={updateStatusMutation.isPending}
                              className={cn('flex-1 text-xs py-2.5 rounded-xl font-semibold transition-colors hover:opacity-80 disabled:opacity-50', col?.color)}>
                              → {col?.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Log time */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Log My Time</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Hours worked</label>
                        <input
                          type="number" min="0.25" max="24" step="0.25"
                          value={timeHours} onChange={e => setTimeHours(e.target.value)}
                          placeholder="e.g. 2.5"
                          className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg text-sm focus:outline-none focus:border-brand-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date</label>
                        <input type="date" value={timeDate} onChange={e => setTimeDate(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg text-sm focus:outline-none focus:border-brand-400" />
                      </div>
                    </div>
                    <input value={timeNote} onChange={e => setTimeNote(e.target.value)}
                      placeholder="What did you work on? (optional)"
                      className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg text-sm focus:outline-none focus:border-brand-400 mb-3" />
                    <button
                      onClick={() => {
                        if (!timeHours || parseFloat(timeHours) <= 0) { toast.error('Enter valid hours.'); return }
                        timeLogMutation.mutate({ taskId: taskDetail.id, hours: timeHours, date: timeDate, note: timeNote })
                      }}
                      disabled={!timeHours || timeLogMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                      {timeLogMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Timer className="h-4 w-4" />}
                      Log Time
                    </button>

                    {/* My time logs */}
                    {taskDetail.time_logs?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200 space-y-1.5">
                        <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-widest">My Logs</p>
                        {taskDetail.time_logs.map((log: any) => (
                          <div key={log.id} className="flex items-center justify-between text-xs text-gray-600">
                            <span>{log.date} {log.note && `— ${log.note}`}</span>
                            <span className="font-bold text-gray-800">{log.hours}h</span>
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
                    <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
                      {taskDetail.comments?.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-3">No comments yet.</p>
                      ) : taskDetail.comments?.map((c: any) => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold flex-shrink-0">
                            {c.user?.substring(0, 1) || '?'}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-700">{c.user}</span>
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
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                            e.preventDefault()
                            commentMutation.mutate({ taskId: taskDetail.id, text: comment })
                          }
                        }}
                        rows={2}
                        placeholder="Add a comment… (Enter to send)"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 resize-none"
                      />
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
    </div>
  )
}