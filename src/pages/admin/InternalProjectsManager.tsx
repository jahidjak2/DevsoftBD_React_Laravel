// src/pages/admin/InternalProjectsManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import {
  Plus, X, Briefcase, Users, Calendar, ChevronRight,
  Target, Clock, DollarSign, Edit2, Trash2, UserPlus, Flag,
} from 'lucide-react'
import {
  PageHeader, FormField, FormInput, FormTextarea, FormSelect,
  SaveButton, ConfirmDialog, StatusBadge, PriorityBadge, SearchInput,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

const STATUS_FILTERS = ['all', 'planning', 'active', 'on_hold', 'completed', 'cancelled']

const STATUS_COLORS: Record<string, string> = {
  planning:  'bg-purple-50 border-purple-100',
  active:    'bg-green-50 border-green-100',
  on_hold:   'bg-amber-50 border-amber-100',
  completed: 'bg-gray-50 border-gray-100',
  cancelled: 'bg-red-50 border-red-100',
}

export default function InternalProjectsManager() {
  const [status, setStatus]       = useState('all')
  const [search, setSearch]       = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<any | null>(null)
  const [selected, setSelected]   = useState<any | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberEmpId, setMemberEmpId]     = useState('')
  const [memberRole, setMemberRole]       = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-internal-projects', { status, search }],
    queryFn: () => adminApi.get('/internal-projects', {
      params: {
        ...(status !== 'all' && { status }),
        ...(search && { search }),
      },
    }).then(r => r.data),
  })

  const { data: selectedDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-internal-project-detail', selected?.id],
    queryFn: () => adminApi.get(`/internal-projects/${selected.id}`).then(r => r.data.data),
    enabled: !!selected?.id,
  })

  const { data: employees } = useQuery({
    queryKey: ['admin-employees-list'],
    queryFn: () => adminApi.get('/employees', { params: { active: true } }).then(r => r.data.data?.data || []),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '', description: '', client_name: '', client_contact: '',
      manager_id: '', start_date: '', deadline: '',
      status: 'planning', priority: 'medium',
      budget: '', currency: 'BDT', technologies: '',
      notes: '', is_billable: true,
    },
  })

  const saveMutation = useMutation({
    mutationFn: (d: any) => {
      const payload = {
        ...d,
        technologies: d.technologies
          ? d.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [],
      }
      return editing
        ? adminApi.put(`/internal-projects/${editing.id}`, payload)
        : adminApi.post('/internal-projects', payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Project updated.' : 'Project created.')
      qc.invalidateQueries({ queryKey: ['admin-internal-projects'] })
      reset(); setShowForm(false); setEditing(null)
    },
    onError: () => toast.error('Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/internal-projects/${id}`),
    onSuccess: () => {
      toast.success('Project deleted.')
      qc.invalidateQueries({ queryKey: ['admin-internal-projects'] })
      setDeleteId(null)
      if (selected?.id === deleteId) setSelected(null)
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: ({ projectId, employeeId, role }: any) =>
      adminApi.post(`/internal-projects/${projectId}/members`, { employee_id: employeeId, role }),
    onSuccess: () => {
      toast.success('Member added.')
      qc.invalidateQueries({ queryKey: ['admin-internal-project-detail', selected?.id] })
      setShowAddMember(false); setMemberEmpId(''); setMemberRole('')
    },
    onError: () => toast.error('Failed to add member.'),
  })

  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId, empId }: any) =>
      adminApi.delete(`/internal-projects/${projectId}/members/${empId}`),
    onSuccess: () => {
      toast.success('Member removed.')
      qc.invalidateQueries({ queryKey: ['admin-internal-project-detail', selected?.id] })
    },
  })

  function startEdit(proj: any) {
    setEditing(proj)
    reset({
      name: proj.name || '', description: proj.description || '',
      client_name: proj.client_name || '', client_contact: proj.client_contact || '',
      manager_id: proj.manager_id || '',
      start_date: proj.start_date || '', deadline: proj.deadline || '',
      status: proj.status || 'planning', priority: proj.priority || 'medium',
      budget: proj.budget || '', currency: proj.currency || 'BDT',
      technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '',
      notes: proj.notes || '', is_billable: proj.is_billable ?? true,
    })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const projects = data?.data?.data || []

  const daysLeft = (deadline: string | null) => {
    if (!deadline) return null
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
    return diff
  }

  return (
    <div className="max-w-7xl space-y-6 flex flex-col" style={{ height: 'calc(100vh - 9rem)' }}>
      <PageHeader
        title="Internal Projects"
        subtitle={`${data?.data?.meta?.total || 0} projects`}
        action={
          <button onClick={() => { setEditing(null); reset(); setShowForm(true) }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> New Project
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                status === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {s === 'on_hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search projects…" />
      </div>

      {/* Two-pane layout */}
      <div className="flex flex-1 gap-4 overflow-hidden">

        {/* Project list */}
        <div className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)
            ) : projects.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center">
                <Briefcase className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No projects found.</p>
              </div>
            ) : projects.map((proj: any) => {
              const dl = daysLeft(proj.deadline)
              const isOverdue = dl !== null && dl < 0 && proj.status !== 'completed'
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelected(proj)}
                  className={cn(
                    'bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm',
                    selected?.id === proj.id ? 'border-brand-400 shadow-sm' : 'border-gray-100',
                    STATUS_COLORS[proj.status] || ''
                  )}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-1">{proj.name}</p>
                      <span className="font-mono text-[10px] text-gray-400">{proj.code}</span>
                    </div>
                    <PriorityBadge priority={proj.priority} />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={proj.status} />
                    {proj.deadline && (
                      <span className={cn('flex items-center gap-1 text-[11px] font-medium',
                        isOverdue ? 'text-red-600' : dl !== null && dl <= 7 ? 'text-amber-600' : 'text-gray-400')}>
                        <Calendar className="h-3 w-3" />
                        {isOverdue ? `${Math.abs(dl!)}d overdue` : dl !== null ? `${dl}d left` : proj.deadline}
                      </span>
                    )}
                    {proj.members?.length > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
                        <Users className="h-3 w-3" />{proj.members.length}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail pane */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-y-auto">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Briefcase className="h-12 w-12 text-gray-200 mb-4" />
              <p className="font-medium text-gray-500">Select a project to view details</p>
              <p className="text-sm text-gray-400 mt-1">Click any project on the left</p>
            </div>
          ) : detailLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
            </div>
          ) : selectedDetail ? (
            <div className="p-6 space-y-8">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{selectedDetail.code}</span>
                    <StatusBadge status={selectedDetail.status} />
                    <PriorityBadge priority={selectedDetail.priority} />
                  </div>
                  <h2 className="font-display text-xl font-bold text-gray-900">{selectedDetail.name}</h2>
                  {selectedDetail.client_name && (
                    <p className="text-sm text-gray-500 mt-1">Client: <strong>{selectedDetail.client_name}</strong></p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(selectedDetail)}
                    className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteId(selectedDetail.id)}
                    className="flex items-center gap-1.5 text-xs border border-red-200 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Calendar, label: 'Start Date',  value: selectedDetail.start_date || '—' },
                  { icon: Flag,     label: 'Deadline',    value: selectedDetail.deadline    || '—' },
                  { icon: DollarSign, label: 'Budget',    value: selectedDetail.budget ? `${selectedDetail.currency} ${Number(selectedDetail.budget).toLocaleString()}` : '—' },
                  { icon: Users,    label: 'Team Size',   value: `${selectedDetail.members?.length || 0} members` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {selectedDetail.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedDetail.description}</p>
                </div>
              )}

              {/* Technologies */}
              {selectedDetail.technologies?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.technologies.map((t: string) => (
                      <span key={t} className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Team members */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Team Members</h3>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center gap-1.5 text-xs text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
                    <UserPlus className="h-3.5 w-3.5" /> Add Member
                  </button>
                </div>

                {showAddMember && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
                        <select value={memberEmpId} onChange={e => setMemberEmpId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-400">
                          <option value="">Select employee</option>
                          {((employees as any[]) || []).map((e: any) => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Role on Project</label>
                        <input value={memberRole} onChange={e => setMemberRole(e.target.value)}
                          placeholder="Lead Dev, Designer…"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddMember(false)}
                        className="px-3 py-1.5 border border-gray-200 text-xs rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={() => memberEmpId && addMemberMutation.mutate({ projectId: selectedDetail.id, employeeId: memberEmpId, role: memberRole })}
                        disabled={!memberEmpId || addMemberMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-xs font-medium rounded-lg transition-colors">
                        {addMemberMutation.isPending ? 'Adding…' : 'Add Member'}
                      </button>
                    </div>
                  </div>
                )}

                {selectedDetail.members?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No members assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDetail.members?.map((member: any) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold flex-shrink-0">
                          {member.user?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{member.user?.name}</p>
                          <p className="text-xs text-gray-500">{member.pivot?.role || member.designation}</p>
                        </div>
                        <button
                          onClick={() => removeMemberMutation.mutate({ projectId: selectedDetail.id, empId: member.id })}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Milestones */}
              {selectedDetail.milestones?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Milestones</h3>
                  <div className="space-y-2">
                    {selectedDetail.milestones.map((ms: any) => (
                      <div key={ms.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                        <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                          ms.completed_at ? 'bg-green-500 border-green-500' : 'border-gray-300')}>
                          {ms.completed_at && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium', ms.completed_at ? 'text-gray-400 line-through' : 'text-gray-900')}>{ms.title}</p>
                          <p className="text-xs text-gray-400">Due: {ms.due_date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedDetail.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Notes</h3>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-900">
                    {selectedDetail.notes}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Form drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto bg-white h-full w-full max-w-xl flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Project' : 'New Internal Project'}</h2>
              <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
                <FormField label="Project Name" required>
                  <FormInput {...register('name')} placeholder="E-Commerce Platform for Acme Corp" />
                </FormField>
                <FormField label="Description">
                  <FormTextarea {...register('description')} rows={3} placeholder="Brief description of project scope and goals…" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Client Name">
                    <FormInput {...register('client_name')} placeholder="Acme Corp" />
                  </FormField>
                  <FormField label="Client Contact">
                    <FormInput {...register('client_contact')} placeholder="john@acme.com" />
                  </FormField>
                </div>
                <FormField label="Project Manager">
                  <FormSelect {...register('manager_id')}>
                    <option value="">Select manager</option>
                    {((employees as any[]) || []).map((e: any) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </FormSelect>
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Status">
                    <FormSelect {...register('status')}>
                      {['planning','active','on_hold','completed','cancelled'].map(s => (
                        <option key={s} value={s}>{s === 'on_hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </FormSelect>
                  </FormField>
                  <FormField label="Priority">
                    <FormSelect {...register('priority')}>
                      {['low','medium','high','critical'].map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </FormSelect>
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Start Date" required>
                    <FormInput {...register('start_date')} type="date" />
                  </FormField>
                  <FormField label="Deadline">
                    <FormInput {...register('deadline')} type="date" />
                  </FormField>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* <FormField label="Budget" className="col-span-2">
                    <FormInput {...register('budget')} type="number" placeholder="50000" />
                  </FormField> */}
                  <div className="col-span-2">
                    <FormField label="Budget">
                      <FormInput {...register('budget')} type="number" placeholder="50000" />
                    </FormField>
                  </div>
                  <FormField label="Currency">
                    <FormSelect {...register('currency')}>
                      {['BDT','USD','EUR','GBP','AED'].map(c => <option key={c} value={c}>{c}</option>)}
                    </FormSelect>
                  </FormField>
                </div>
                <FormField label="Technologies" hint="Comma-separated: Laravel, React, MySQL">
                  <FormInput {...register('technologies')} placeholder="Laravel, React, MySQL, Docker" />
                </FormField>
                <FormField label="Notes">
                  <FormTextarea {...register('notes')} rows={2} placeholder="Internal notes, special requirements…" />
                </FormField>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('is_billable')} className="w-4 h-4 rounded accent-brand-600" />
                  <span className="text-sm text-gray-700">Billable project</span>
                </label>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeForm} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <SaveButton loading={saveMutation.isPending} label={editing ? 'Update Project' : 'Create Project'} />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this project?"
        message="The project, all tasks, and time logs will be permanently removed."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}