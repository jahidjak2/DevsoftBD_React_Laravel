import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react'

import { adminApi } from '@/lib/api'
import { cn } from '@/lib/utils'

import {
  PageHeader,
  SearchInput,
  FormField,
  FormInput,
  FormSelect,
  SaveButton,
  ConfirmDialog,
} from '@/components/admin/AdminShared'
// ══════════════════════════════════════════════════════════════
// src/pages/admin/EmployeesManager.tsx
// ══════════════════════════════════════════════════════════════
export function EmployeesManager() {
  const [search, setSearch]     = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<any | null>(null)
  const qc = useQueryClient()
 
  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees', { search }],
    queryFn: () => adminApi.get('/employees', { params: search ? { search } : {} }).then(r => r.data),
  })
 
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', email: '', password: '', role: 'employee', designation: '', employment_type: 'full_time', join_date: '', phone: '', department_id: '' },
  })
 
  const { data: departments } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => adminApi.get('/departments').then(r => r.data.data),
  })
 
  const saveMutation = useMutation({
    mutationFn: (data: any) => editing
      ? adminApi.put(`/employees/${editing.id}`, data)
      : adminApi.post('/employees', data),
    onSuccess: () => {
      toast.success(editing ? 'Employee updated.' : 'Employee created.')
      qc.invalidateQueries({ queryKey: ['admin-employees'] })
      setShowForm(false); setEditing(null); reset()
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Save failed.'),
  })
 
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/employees/${id}`),
    onSuccess: () => { toast.success('Employee deactivated.'); qc.invalidateQueries({ queryKey: ['admin-employees'] }); setDeleteId(null) },
  })
 
  const employees = data?.data?.data || []
 
  return (
    <div className="max-w-7xl space-y-6">
      <PageHeader title="Employees" subtitle={`${data?.data?.meta?.total || 0} total employees`}
        action={<button onClick={() => { setEditing(null); reset(); setShowForm(true) }} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"><Plus className="h-4 w-4" /> Add Employee</button>} />
 
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, code, or designation…" />
 
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50/60">
              {['Employee', 'Code', 'Department', 'Type', 'Join Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={7} className="py-16 text-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr> :
                employees.map((emp: any) => (
                  <tr key={emp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold flex-shrink-0">
                          {emp.avatar_url ? <img src={emp.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" /> : emp.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-600">{emp.employee_code}</td>
                    <td className="px-5 py-4 text-gray-600 text-sm">{emp.department || '—'}</td>
                    <td className="px-5 py-4"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">{emp.employment_type?.replace('_', ' ')}</span></td>
                    <td className="px-5 py-4 text-xs text-gray-500">{emp.join_date}</td>
                    <td className="px-5 py-4"><span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', emp.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>{emp.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => { setEditing(emp); setShowForm(true) }} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteId(emp.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
 
      {/* Add/Edit form drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative ml-auto bg-white h-full w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
                <FormField label="Full Name" required><FormInput {...register('name')} placeholder="John Developer" /></FormField>
                <FormField label="Email" required><FormInput {...register('email')} type="email" placeholder="john@devsoftbd.com" /></FormField>
                {!editing && <FormField label="Password" required><FormInput {...register('password')} type="password" placeholder="Min 8 characters" /></FormField>}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Role">
                    <FormSelect {...register('role')}><option value="employee">Employee</option><option value="intern">Intern</option><option value="manager">Manager</option></FormSelect>
                  </FormField>
                  <FormField label="Type">
                    <FormSelect {...register('employment_type')}><option value="full_time">Full Time</option><option value="part_time">Part Time</option><option value="contract">Contract</option><option value="intern">Intern</option></FormSelect>
                  </FormField>
                </div>
                <FormField label="Designation" required><FormInput {...register('designation')} placeholder="Senior Laravel Developer" /></FormField>
                <FormField label="Department">
                  <FormSelect {...register('department_id')}>
                    <option value="">Select department</option>
                    {(departments || []).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </FormSelect>
                </FormField>
                <FormField label="Join Date" required><FormInput {...register('join_date')} type="date" /></FormField>
                <FormField label="Phone"><FormInput {...register('phone')} placeholder="+8801XXXXXXXXX" /></FormField>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                  <SaveButton loading={saveMutation.isPending} label={editing ? 'Update' : 'Add Employee'} />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={deleteId !== null} title="Deactivate employee?" message="The employee account will be deactivated. Their data is preserved." onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} loading={deleteMutation.isPending} />
    </div>
  )
}
export { EmployeesManager as default }
 