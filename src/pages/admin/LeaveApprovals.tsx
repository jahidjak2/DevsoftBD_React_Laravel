// src/pages/admin/LeaveApprovals.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import {
  CalendarOff, CheckCircle, XCircle, Clock, User,
  Calendar, ChevronLeft, ChevronRight, Info, X,
} from 'lucide-react'
import { PageHeader, StatusBadge } from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

const STATUS_TABS = ['pending', 'approved', 'rejected', 'all']

function RejectModal({ open, onConfirm, onCancel, loading }: any) {
  const [note, setNote] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="font-display font-bold text-gray-900 mb-4">Reject Leave Request</h3>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for rejection <span className="text-red-500">*</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="Explain why the leave is being rejected…"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (!note.trim()) { toast.error('Rejection reason is required.'); return } onConfirm(note) }}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? 'Rejecting…' : <><XCircle className="h-4 w-4" /> Reject</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LeaveApprovals() {
  const [statusFilter, setStatusFilter] = useState('pending')
  const [rejectId, setRejectId]         = useState<number | null>(null)
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null)
  const [calYear, setCalYear]           = useState(new Date().getFullYear())
  const [calMonth, setCalMonth]         = useState(new Date().getMonth())
  const [view, setView]                 = useState<'list' | 'calendar'>('list')
  const qc = useQueryClient()

  // Leave requests
  const { data, isLoading } = useQuery({
    queryKey: ['admin-leaves', statusFilter],
    queryFn: () => adminApi.get('/leaves', {
      params: statusFilter !== 'all' ? { status: statusFilter } : {},
    }).then(r => r.data),
    refetchInterval: 30000,
  })

  // Calendar data
  const calStart = new Date(calYear, calMonth, 1).toISOString().substring(0, 10)
  const calEnd   = new Date(calYear, calMonth + 1, 0).toISOString().substring(0, 10)
  const { data: calData } = useQuery({
    queryKey: ['admin-leaves-calendar', calYear, calMonth],
    queryFn: () => adminApi.get('/leaves/calendar', { params: { start: calStart, end: calEnd } }).then(r => r.data.data),
    enabled: view === 'calendar',
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.patch(`/leaves/${id}/approve`),
    onSuccess: () => {
      toast.success('Leave approved.')
      qc.invalidateQueries({ queryKey: ['admin-leaves'] })
      qc.invalidateQueries({ queryKey: ['admin-leaves-calendar'] })
      setSelectedLeave(null)
    },
    onError: () => toast.error('Approval failed.'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      adminApi.patch(`/leaves/${id}/reject`, { note }),
    onSuccess: () => {
      toast.success('Leave rejected.')
      qc.invalidateQueries({ queryKey: ['admin-leaves'] })
      setRejectId(null)
      setSelectedLeave(null)
    },
    onError: () => toast.error('Rejection failed.'),
  })

  const leaves       = data?.data?.data || []
  const pendingCount = leaves.filter((l: any) => l.status === 'pending').length

  // Calendar helpers
  const DAYS_IN_MONTH = new Date(calYear, calMonth + 1, 0).getDate()
  const FIRST_DAY     = new Date(calYear, calMonth, 1).getDay()
  const MONTH_NAME    = new Date(calYear, calMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }
  function nextMonth() { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }

  function getLeavesForDay(day: number) {
    const date = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return (calData as any[] || []).filter((l: any) => l.start <= date && l.end >= date)
  }

  const statusColors: Record<string, string> = {
    pending:  'border-l-amber-400 bg-amber-50/30',
    approved: 'border-l-green-400 bg-green-50/30',
    rejected: 'border-l-red-400 bg-red-50/30',
    cancelled:'border-l-gray-300',
  }

  return (
    <div className="max-w-7xl space-y-6">
      <PageHeader
        title="Leave Management"
        subtitle={statusFilter === 'pending' && pendingCount > 0
          ? `${pendingCount} request${pendingCount !== 1 ? 's' : ''} awaiting approval`
          : 'Manage employee leave requests'}
        action={
          <div className="flex gap-2">
            <button onClick={() => setView('list')}
              className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                view === 'list' ? 'bg-brand-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50')}>
              List
            </button>
            <button onClick={() => setView('calendar')}
              className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                view === 'calendar' ? 'bg-brand-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50')}>
              Calendar
            </button>
          </div>
        }
      />

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all relative',
              statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {s === 'pending' ? 'Pending' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'pending' && pendingCount > 0 && statusFilter !== 'pending' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        /* ── LIST VIEW ─────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Requests list */}
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)
            ) : leaves.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 py-20 text-center">
                <CalendarOff className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No {statusFilter !== 'all' ? statusFilter : ''} leave requests</p>
              </div>
            ) : leaves.map((leave: any) => (
              <div
                key={leave.id}
                onClick={() => setSelectedLeave(leave)}
                className={cn(
                  'bg-white rounded-xl border border-l-4 p-5 shadow-sm cursor-pointer hover:shadow-md transition-all',
                  statusColors[leave.status] || 'border-l-gray-300',
                  selectedLeave?.id === leave.id && 'ring-2 ring-brand-400'
                )}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                    {leave.employee?.user?.name?.substring(0, 2).toUpperCase() || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-gray-900">{leave.employee?.user?.name}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {leave.leave_type?.name}
                      </span>
                      <StatusBadge status={leave.status} />
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {leave.start_date} → {leave.end_date}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-gray-800">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {leave.days_count} day{leave.days_count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2">{leave.reason}</p>

                    {leave.admin_note && (
                      <div className="mt-2 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span className="italic">{leave.admin_note}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick actions */}
                  {leave.status === 'pending' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); approveMutation.mutate(leave.id) }}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setRejectId(leave.id) }}
                        className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-1">
            {selectedLeave ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-semibold text-gray-900">Request Detail</h3>
                  <button onClick={() => setSelectedLeave(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                      {selectedLeave.employee?.user?.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedLeave.employee?.user?.name}</p>
                      <p className="text-xs text-gray-500">{selectedLeave.employee?.designation}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { label: 'Leave Type',   value: selectedLeave.leave_type?.name },
                      { label: 'Duration',     value: `${selectedLeave.days_count} day${selectedLeave.days_count !== 1 ? 's' : ''}` },
                      { label: 'Start Date',   value: selectedLeave.start_date },
                      { label: 'End Date',     value: selectedLeave.end_date },
                      { label: 'Status',       value: <StatusBadge status={selectedLeave.status} /> },
                      { label: 'Submitted',    value: selectedLeave.created_at ? new Date(selectedLeave.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                      ...(selectedLeave.responded_at ? [{ label: 'Responded', value: new Date(selectedLeave.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-400">{label}</span>
                        <span className="text-sm font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Reason</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedLeave.reason}</p>
                  </div>

                  {selectedLeave.admin_note && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1.5">Admin Note</p>
                      <p className="text-sm text-amber-900">{selectedLeave.admin_note}</p>
                    </div>
                  )}

                  {selectedLeave.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => approveMutation.mutate(selectedLeave.id)}
                        disabled={approveMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => setRejectId(selectedLeave.id)}
                        className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 h-48 flex flex-col items-center justify-center text-center">
                <CalendarOff className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Select a request to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── CALENDAR VIEW ─────────────────────────────────── */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="font-display font-semibold text-gray-900 text-lg">{MONTH_NAME}</h3>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="px-3 py-2.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: FIRST_DAY }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-gray-50 h-28 bg-gray-50/40" />
            ))}

            {/* Day cells */}
            {Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).map(day => {
              const dayLeaves = getLeavesForDay(day)
              const isToday = new Date().getDate() === day && new Date().getMonth() === calMonth && new Date().getFullYear() === calYear
              const isWeekend = [0, 6].includes(new Date(calYear, calMonth, day).getDay())

              return (
                <div key={day}
                  className={cn(
                    'border-r border-b border-gray-100 h-28 p-2 overflow-hidden',
                    isWeekend && 'bg-gray-50/60',
                    (day + FIRST_DAY - 1) % 7 === 6 && 'border-r-0'
                  )}>
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1.5',
                    isToday ? 'bg-brand-600 text-white' : 'text-gray-700'
                  )}>
                    {day}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayLeaves.slice(0, 3).map((leave: any, idx: number) => (
                      <div key={idx}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate"
                        style={{ background: (leave.color || '#3B82F6') + '25', color: leave.color || '#2563EB' }}>
                        {leave.employee_name?.split(' ')[0]}
                      </div>
                    ))}
                    {dayLeaves.length > 3 && (
                      <p className="text-[10px] text-gray-400">+{dayLeaves.length - 3} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          {(calData as any[] || []).length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-3">
              {Array.from(new Set((calData as any[]).map((l: any) => l.leave_type))).map((type: any) => {
                const leave = (calData as any[]).find((l: any) => l.leave_type === type)
                return (
                  <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className="w-3 h-3 rounded-full" style={{ background: leave?.color || '#3B82F6' }} />
                    {type}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Reject modal */}
      <RejectModal
        open={rejectId !== null}
        onConfirm={(note: string) => rejectId && rejectMutation.mutate({ id: rejectId, note })}
        onCancel={() => setRejectId(null)}
        loading={rejectMutation.isPending}
      />
    </div>
  )
}