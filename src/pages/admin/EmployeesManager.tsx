// src/pages/admin/EmployeesManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, X, UserCheck, Edit2, Trash2, Eye } from 'lucide-react'
import {
  PageHeader, FormField, FormInput, FormSelect,
  SaveButton, ConfirmDialog, SearchInput,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

const TYPE_FILTERS = ['all', 'full_time', 'part_time', 'contract', 'intern']

export default function EmployeesManager() {
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<any | null>(null)
  const [viewing, setViewing]     = useState<any | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const qc = useQueryClient()

  const { data: departments } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => adminApi.get('/departments').then(r => r.data.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees', { search, typeFilter }],
    queryFn: () => adminApi.get('/employees', {
      params: {
        ...(search && { search }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      },
    }).then(r => r.data),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '', email: '', password: '', role: 'employee',
      designation: '', employment_type: 'full_time',
      department_id: '', join_date: '', phone: '',
      emergency_contact_name: '', emergency_contact_phone: '',
      bio: '',
    },
  })

  const saveMutation = useMutation({
    mutationFn: (d: any) =>
      editing ? adminApi.put(`/employees/${editing.id}`, d) : adminApi.post('/employees', d),
    onSuccess: () => {
      toast.success(editing ? 'Employee updated.' : 'Employee created.')
      qc.invalidateQueries({ queryKey: ['admin-employees'] })
      reset(); setShowForm(false); setEditing(null)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/employees/${id}`),
    onSuccess: () => {
      toast.success('Employee deactivated.')
      qc.invalidateQueries({ queryKey: ['admin-employees'] })
      setDeleteId(null)
    },
  })

  function startEdit(emp: any) {
    setEditing(emp)
    reset({
      name: emp.name || '', email: emp.email || '', password: '',
      role: emp.role || 'employee', designation: emp.designation || '',
      employment_type: emp.employment_type || 'full_time',
      department_id: emp.department_id || '', join_date: emp.join_date || '',
      phone: emp.phone || '', emergency_contact_name: emp.emergency_contact_name || '',
      emergency_contact_phone: emp.emergency_contact_phone || '', bio: emp.bio || '',
    })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const employees = data?.data?.data || []
  const meta      = data?.data?.meta

  const typeLabel: Record<string, string> = {
    full_time: 'Full Time', part_time: 'Part Time',
    contract: 'Contract', intern: 'Intern',
  }

  return (
    <div className="max-w-7xl space-y-6">
      <PageHeader
        title="Employees"
        subtitle={`${meta?.total || 0} total employees`}
        action={
          <button onClick={() => { setEditing(null); reset(); setShowForm(true) }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> Add Employee
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {TYPE_FILTERS.map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                typeFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {f === 'all' ? 'All' : typeLabel[f]}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, code, or role…" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Employee', 'Code', 'Department', 'Designation', 'Type', 'Join Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <UserCheck className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No employees found.</p>
                </td></tr>
              ) : employees.map((emp: any) => (
                <tr key={emp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-brand-100 flex items-center justify-center">
                        {emp.avatar_url
                          ? <img src={emp.avatar_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-brand-600 text-xs font-bold">{emp.name?.substring(0, 2).toUpperCase()}</span>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{emp.name}</p>
                        <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{emp.employee_code}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{emp.department || <span className="text-gray-300">—</span>}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{emp.designation}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full capitalize">
                      {typeLabel[emp.employment_type] || emp.employment_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{emp.join_date}</td>
                  <td className="px-5 py-4">
                    <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium',
                      emp.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setViewing(emp)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => startEdit(emp)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(emp.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Deactivate">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-500">Showing {employees.length} of {meta.total}</p>
          </div>
        )}
      </div>

      {/* Add / Edit drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto bg-white h-full w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">
                {editing ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Account Info</p>
                <FormField label="Full Name" required>
                  <FormInput {...register('name')} placeholder="Jane Smith" />
                </FormField>
                <FormField label="Email" required>
                  <FormInput {...register('email')} type="email" placeholder="jane@devsoftbd.com" />
                </FormField>
                {!editing && (
                  <FormField label="Password" required>
                    <FormInput {...register('password')} type="password" placeholder="Minimum 8 characters" />
                  </FormField>
                )}
                <FormField label="Role">
                  <FormSelect {...register('role')}>
                    <option value="employee">Employee</option>
                    <option value="intern">Intern</option>
                    <option value="manager">Manager</option>
                  </FormSelect>
                </FormField>

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pt-2">Employment Details</p>
                <FormField label="Designation" required>
                  <FormInput {...register('designation')} placeholder="Senior Laravel Developer" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Department">
                    <FormSelect {...register('department_id')}>
                      <option value="">Select department</option>
                      {(departments as any[] || []).map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </FormSelect>
                  </FormField>
                  <FormField label="Employment Type">
                    <FormSelect {...register('employment_type')}>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </FormSelect>
                  </FormField>
                </div>
                <FormField label="Join Date" required>
                  <FormInput {...register('join_date')} type="date" />
                </FormField>

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pt-2">Contact Info</p>
                <FormField label="Phone">
                  <FormInput {...register('phone')} placeholder="+8801XXXXXXXXX" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Emergency Contact Name">
                    <FormInput {...register('emergency_contact_name')} placeholder="Parent / Spouse" />
                  </FormField>
                  <FormField label="Emergency Contact Phone">
                    <FormInput {...register('emergency_contact_phone')} placeholder="+8801XXXXXXXXX" />
                  </FormField>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeForm}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <SaveButton loading={saveMutation.isPending} label={editing ? 'Update Employee' : 'Add Employee'} />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View detail panel */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewing(null)} />
          <div className="relative ml-auto bg-white h-full w-full max-w-md flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">Employee Profile</h2>
              <button onClick={() => setViewing(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xl font-bold flex-shrink-0">
                  {viewing.avatar_url
                    ? <img src={viewing.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    : viewing.name?.substring(0, 2).toUpperCase()
                  }
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-900 text-lg">{viewing.name}</h3>
                  <p className="text-sm text-brand-600">{viewing.designation}</p>
                  <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">{viewing.employee_code}</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Email',           value: viewing.email },
                  { label: 'Phone',           value: viewing.phone           || '—' },
                  { label: 'Department',      value: viewing.department       || '—' },
                  { label: 'Employment Type', value: typeLabel[viewing.employment_type] || viewing.employment_type },
                  { label: 'Join Date',       value: viewing.join_date        || '—' },
                  { label: 'Status',          value: viewing.is_active ? 'Active' : 'Inactive' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide flex-shrink-0">{label}</span>
                    <span className="text-sm text-gray-800 text-right">{value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <button onClick={() => { setViewing(null); startEdit(viewing) }}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                  <Edit2 className="h-4 w-4" /> Edit Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Deactivate this employee?"
        message="Their account will be deactivated. All data is preserved and can be restored."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}