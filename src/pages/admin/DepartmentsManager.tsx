// src/pages/admin/DepartmentsManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, X, Building2, Users } from 'lucide-react'
import {
  PageHeader, FormField, FormInput, FormTextarea, FormSelect,
  SaveButton, ConfirmDialog, AdminTable, RowActions,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

export default function DepartmentsManager() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => adminApi.get('/departments').then(r => r.data.data),
  })

  const { data: employees } = useQuery({
    queryKey: ['admin-employees-list'],
    queryFn: () => adminApi.get('/employees', { params: { active: true } }).then(r => r.data.data?.data || []),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '', description: '', head_employee_id: '', is_active: true,
    },
  })

  const saveMutation = useMutation({
    mutationFn: (d: any) =>
      editing
        ? adminApi.put(`/departments/${editing.id}`, d)
        : adminApi.post('/departments', d),
    onSuccess: () => {
      toast.success(editing ? 'Department updated.' : 'Department created.')
      qc.invalidateQueries({ queryKey: ['admin-departments'] })
      reset(); setShowForm(false); setEditing(null)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/departments/${id}`),
    onSuccess: () => {
      toast.success('Department deleted.')
      qc.invalidateQueries({ queryKey: ['admin-departments'] })
      setDeleteId(null)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Delete failed.'),
  })

  function startEdit(dept: any) {
    setEditing(dept)
    reset({
      name: dept.name || '',
      description: dept.description || '',
      head_employee_id: dept.head_employee_id || '',
      is_active: dept.is_active ?? true,
    })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const departments = (data as any[]) || []

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} department${departments.length !== 1 ? 's' : ''}`}
        action={
          <button
            onClick={() => { setEditing(null); reset(); setShowForm(true) }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> Add Department
          </button>
        }
      />

      {/* Department cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <Building2 className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No departments yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first department to organise your team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept: any) => (
            <div
              key={dept.id}
              className={cn(
                'bg-white rounded-xl border p-5 shadow-sm group relative transition-all hover:shadow-md',
                dept.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'
              )}>
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-gray-900 truncate">{dept.name}</h3>
                  {!dept.is_active && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </div>
              </div>

              {/* Description */}
              {dept.description && (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{dept.description}</p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span><strong className="text-gray-900">{dept.employees_count ?? 0}</strong> employee{dept.employees_count !== 1 ? 's' : ''}</span>
                </div>
                {dept.head && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto min-w-0">
                    <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-[9px] font-bold flex-shrink-0">
                      {dept.head.substring(0, 1)}
                    </div>
                    <span className="truncate">{dept.head}</span>
                  </div>
                )}
              </div>

              {/* Hover actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => startEdit(dept)}
                  className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-brand-600 transition-colors"
                  title="Edit">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteId(dept.id)}
                  className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table fallback for many departments */}
      {departments.length > 6 && (
        <AdminTable
          headers={['Department', 'Head', 'Employees', 'Status', 'Actions']}
          loading={false}>
          {departments.map((dept: any) => (
            <tr key={dept.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4">
                <p className="font-medium text-sm text-gray-900">{dept.name}</p>
                {dept.description && <p className="text-xs text-gray-400 line-clamp-1">{dept.description}</p>}
              </td>
              <td className="px-5 py-4 text-sm text-gray-600">{dept.head || '—'}</td>
              <td className="px-5 py-4">
                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  {dept.employees_count ?? 0}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium',
                  dept.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {dept.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-5 py-4">
                <RowActions onEdit={() => startEdit(dept)} onDelete={() => setDeleteId(dept.id)} />
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {/* Add / Edit drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto bg-white h-full w-full max-w-md flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">
                {editing ? 'Edit Department' : 'New Department'}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-5">
                <FormField label="Department Name" required>
                  <FormInput
                    {...register('name')}
                    placeholder="e.g. Engineering, Design, HR"
                  />
                </FormField>

                <FormField label="Description" hint="Optional — brief description of this department's role">
                  <FormTextarea
                    {...register('description')}
                    rows={3}
                    placeholder="Responsible for all software development and technical operations…"
                  />
                </FormField>

                <FormField label="Department Head" hint="Optional — assign a senior employee as head">
                  <FormSelect {...register('head_employee_id')}>
                    <option value="">No head assigned</option>
                    {((employees as any[]) || []).map((e: any) => (
                      <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>
                    ))}
                  </FormSelect>
                </FormField>

                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded accent-brand-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Active department</span>
                    <p className="text-xs text-gray-400">Inactive departments are hidden from dropdowns</p>
                  </div>
                </label>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={closeForm}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <SaveButton loading={saveMutation.isPending} label={editing ? 'Update Department' : 'Create Department'} />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this department?"
        message="You can only delete departments with no active employees. Reassign employees first."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}