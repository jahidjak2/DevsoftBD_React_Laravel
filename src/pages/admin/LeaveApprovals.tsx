 import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { adminApi } from '@/lib/api'
import { cn } from '@/lib/utils'

import { PageHeader } from '@/components/admin/AdminShared'
// ══════════════════════════════════════════════════════════════
// src/pages/admin/LeaveApprovals.tsx
// ══════════════════════════════════════════════════════════════
export function LeaveApprovals() {
  const [status, setStatus] = useState('pending')
  const qc = useQueryClient()
 
  const { data, isLoading } = useQuery({
    queryKey: ['admin-leaves', status],
    queryFn: () => adminApi.get('/leaves', { params: status !== 'all' ? { status } : {} }).then(r => r.data),
  })
 
  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => adminApi.patch(`/leaves/${id}/approve`, { note }),
    onSuccess: () => { toast.success('Leave approved.'); qc.invalidateQueries({ queryKey: ['admin-leaves'] }) },
    onError: () => toast.error('Failed.'),
  })
 
  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => adminApi.patch(`/leaves/${id}/reject`, { note }),
    onSuccess: () => { toast.success('Leave rejected.'); qc.invalidateQueries({ queryKey: ['admin-leaves'] }) },
    onError: () => toast.error('Failed.'),
  })
 
  const leaves = data?.data?.data || []
  const pendingCount = leaves.filter((l: any) => l.status === 'pending').length
 
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title="Leave Approvals" subtitle={pendingCount > 0 ? `${pendingCount} pending requests` : 'Manage employee leave requests'} />
 
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all', status === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {s}
          </button>
        ))}
      </div>
 
      <div className="space-y-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />) :
          leaves.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-sm text-gray-400">No {status} leave requests.</div>
          ) :
          leaves.map((leave: any) => (
            <div key={leave.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-5">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-sm font-bold flex-shrink-0">
                {leave.employee?.user?.name?.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <p className="font-medium text-gray-900">{leave.employee?.user?.name}</p>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{leave.leave_type?.name}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', leave.status === 'pending' ? 'bg-amber-100 text-amber-700' : leave.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                    {leave.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{leave.start_date} → {leave.end_date} <span className="text-gray-400 ml-1">({leave.days_count} day{leave.days_count !== 1 ? 's' : ''})</span></p>
                <p className="text-sm text-gray-500 line-clamp-2">{leave.reason}</p>
                {leave.admin_note && <p className="text-xs text-gray-400 mt-1 italic">Note: {leave.admin_note}</p>}
              </div>
              {leave.status === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => approveMutation.mutate({ id: leave.id })}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                    ✓ Approve
                  </button>
                  <button onClick={() => { const note = prompt('Reason for rejection:'); if (note) rejectMutation.mutate({ id: leave.id, note }) }}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  )
}
export { LeaveApprovals as default }
 