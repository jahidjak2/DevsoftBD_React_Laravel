// src/pages/admin/InquiriesManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Mail, Phone, Building2, Download, CheckCircle, Archive, Flag, RefreshCw, X, MessageSquare } from 'lucide-react'
import { PageHeader, StatusBadge, SearchInput } from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

const STATUS_TABS = ['all', 'new', 'read', 'replied', 'spam', 'archived']

export default function InquiriesManager() {
  const [status, setStatus]       = useState('all')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<any | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inquiries', { status, search }],
    queryFn: () => adminApi.get('/inquiries', {
      params: {
        ...(status !== 'all' && { status }),
        ...(search && { search }),
      },
    }).then(r => r.data),
    refetchInterval: 30000,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status, admin_note }: { id: number; status: string; admin_note?: string }) =>
      adminApi.patch(`/inquiries/${id}/status`, { status, admin_note }),
    onSuccess: (_, vars) => {
      toast.success(`Marked as ${vars.status}.`)
      qc.invalidateQueries({ queryKey: ['admin-inquiries'] })
      if (selected?.id === vars.id) setSelected((prev: any) => prev ? { ...prev, status: vars.status } : null)
    },
    onError: () => toast.error('Update failed.'),
  })

  const inquiries = data?.data || []

  const newCount = inquiries.filter((i: any) => i.status === 'new').length

  function handleExport() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  window.open(
    `${apiUrl}/api/v1/admin/inquiries/export`,
    '_blank'
  )
}

  return (
    <div className="max-w-7xl h-[calc(100vh-9rem)] flex flex-col">
      <PageHeader
        title="Inquiries"
        subtitle={`Contact form submissions${newCount > 0 ? ` — ${newCount} new` : ''}`}
        action={
          <button onClick={handleExport}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {STATUS_TABS.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                  status === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}>
                {s}
                {s === 'new' && newCount > 0 && (
                  <span className="ml-1.5 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {newCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" />
        </div>

        {/* Two-pane layout */}
        <div className="flex flex-1 overflow-hidden gap-4">
          {/* List pane */}
          <div className="w-80 flex-shrink-0 flex flex-col overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="px-4 py-3.5 border-b border-gray-50 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full" />
                      <div className="flex-1">
                        <div className="h-3.5 bg-gray-100 rounded w-28 mb-1.5" />
                        <div className="h-3 bg-gray-100 rounded w-40" />
                      </div>
                    </div>
                  </div>
                ))
              ) : inquiries.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">
                  <MessageSquare className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                  No inquiries found.
                </div>
              ) : (
                inquiries.map((inq: any) => (
                  <button
                    key={inq.id}
                    onClick={() => setSelected(inq)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                      selected?.id === inq.id && 'bg-brand-50 border-brand-100',
                      inq.status === 'new' && 'bg-blue-50/60'
                    )}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        inq.status === 'new' ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-600'
                      )}>
                        {inq.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm line-clamp-1', inq.status === 'new' ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>
                          {inq.name}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1">{inq.subject || inq.email}</p>
                      </div>
                      <StatusBadge status={inq.status} />
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 pl-11">{inq.message}</p>
                    <p className="text-xs text-gray-300 mt-1.5 pl-11">
                      {new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail pane */}
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-y-auto">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Mail className="h-12 w-12 text-gray-200 mb-4" />
                <p className="font-medium text-gray-500">Select an inquiry to view details</p>
                <p className="text-sm text-gray-400 mt-1">Click any item on the left</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg flex-shrink-0">
                      {selected.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-gray-900 text-lg">{selected.name}</h2>
                      <a href={`mailto:${selected.email}`} className="text-sm text-brand-600 hover:text-brand-700">{selected.email}</a>
                      {selected.phone && (
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{selected.phone}</p>
                      )}
                      {selected.company && (
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{selected.company}</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Status',   value: <StatusBadge status={selected.status} /> },
                    { label: 'Service',  value: selected.service_interest || '—' },
                    { label: 'Budget',   value: selected.budget_range     || '—' },
                    { label: 'Received', value: new Date(selected.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">{label}</p>
                      <div className="text-sm font-medium text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Subject + message */}
                {selected.subject && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Subject</p>
                    <p className="text-sm font-medium text-gray-900">{selected.subject}</p>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Message</p>
                  <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your Inquiry'}`}
                    onClick={() => updateStatus.mutate({ id: selected.id, status: 'replied' })}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <Mail className="h-4 w-4" /> Reply via Email
                  </a>
                  {selected.status !== 'read' && selected.status !== 'replied' && (
                    <button onClick={() => updateStatus.mutate({ id: selected.id, status: 'read' })}
                      className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <CheckCircle className="h-4 w-4" /> Mark Read
                    </button>
                  )}
                  {selected.status !== 'replied' && (
                    <button onClick={() => updateStatus.mutate({ id: selected.id, status: 'replied' })}
                      className="flex items-center gap-2 border border-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
                      <CheckCircle className="h-4 w-4 text-green-600" /> Mark Replied
                    </button>
                  )}
                  {selected.status !== 'archived' && (
                    <button onClick={() => updateStatus.mutate({ id: selected.id, status: 'archived' })}
                      className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <Archive className="h-4 w-4" /> Archive
                    </button>
                  )}
                  {selected.status !== 'spam' && (
                    <button onClick={() => updateStatus.mutate({ id: selected.id, status: 'spam' })}
                      className="flex items-center gap-2 border border-red-200 text-red-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                      <Flag className="h-4 w-4" /> Spam
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}