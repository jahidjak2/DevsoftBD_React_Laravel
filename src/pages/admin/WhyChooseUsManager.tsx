// src/pages/admin/WhyChooseUsManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, X, HelpCircle, GripVertical } from 'lucide-react'
import {
  PageHeader, FormField, FormInput, FormTextarea,
  SaveButton, ConfirmDialog, AdminTable, RowActions,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

const LUCIDE_ICONS = [
  'Shield','Zap','Code2','HeadphonesIcon','DollarSign','Globe','Users','Award',
  'Clock','CheckCircle','TrendingUp','Star','Heart','Lightbulb','Target','Rocket',
]

export default function WhyChooseUsManager() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-why-choose-us'],
    queryFn: () => adminApi.get('/why-choose-us').then(r => r.data.data),
  })

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      icon: 'Shield', icon_color: '#3B82F6', title: '', description: '',
      stat_value: '', stat_label: '', sort_order: 0, is_active: true,
    },
  })

  const saveMutation = useMutation({
    mutationFn: (d: any) =>
      editing ? adminApi.put(`/why-choose-us/${editing.id}`, d) : adminApi.post('/why-choose-us', d),
    onSuccess: () => {
      toast.success(editing ? 'Reason updated.' : 'Reason added.')
      qc.invalidateQueries({ queryKey: ['admin-why-choose-us'] })
      reset(); setShowForm(false); setEditing(null)
    },
    onError: () => toast.error('Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/why-choose-us/${id}`),
    onSuccess: () => {
      toast.success('Deleted.')
      qc.invalidateQueries({ queryKey: ['admin-why-choose-us'] })
      setDeleteId(null)
    },
  })

  function startEdit(item: any) {
    setEditing(item)
    reset({
      icon: item.icon || 'Shield', icon_color: item.icon_color || '#3B82F6',
      title: item.title, description: item.description,
      stat_value: item.stat_value || '', stat_label: item.stat_label || '',
      sort_order: item.sort_order || 0, is_active: item.is_active ?? true,
    })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const iconColor = watch('icon_color')

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Why Choose Us"
        subtitle="Reasons and stats shown in the homepage section"
        action={
          <button onClick={() => { setEditing(null); reset(); setShowForm(true) }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> Add Reason
          </button>
        }
      />

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data as any[] || []).map((item: any) => (
            <div key={item.id} className={cn(
              'bg-white rounded-xl border p-5 shadow-sm relative group',
              !item.is_active && 'opacity-60'
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: (item.icon_color || '#3B82F6') + '20' }}>
                  <HelpCircle className="h-5 w-5" style={{ color: item.icon_color || '#3B82F6' }} />
                </div>
                {item.stat_value && (
                  <div className="text-right">
                    <div className="font-display font-bold text-xl" style={{ color: item.icon_color || '#3B82F6' }}>
                      {item.stat_value}
                    </div>
                    {item.stat_label && <div className="text-xs text-gray-400">{item.stat_label}</div>}
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{item.description}</p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => startEdit(item)}
                  className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-brand-600 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => setDeleteId(item.id)}
                  className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400 hover:text-red-600 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              {!item.is_active && (
                <span className="absolute bottom-3 right-3 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Hidden</span>
              )}
            </div>
          ))}

          {!isLoading && (data as any[] || []).length === 0 && (
            <div className="col-span-3 bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center">
              <p className="text-gray-400">No reasons added yet. Add your first.</p>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto bg-white h-full w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Reason' : 'Add Reason'}</h2>
              <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Icon" hint="Lucide icon name">
                    <select {...register('icon')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-brand-400">
                      {LUCIDE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Icon Color">
                    <div className="flex gap-2">
                      <input type="color" {...register('icon_color')} className="h-10 w-12 rounded-lg border p-1 cursor-pointer" />
                      <FormInput {...register('icon_color')} placeholder="#3B82F6" />
                    </div>
                  </FormField>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconColor + '20' }}>
                    <HelpCircle className="h-5 w-5" style={{ color: iconColor }} />
                  </div>
                  <span className="text-xs text-gray-500">Icon preview</span>
                </div>

                <FormField label="Title" required>
                  <FormInput {...register('title')} placeholder="Proven Track Record" />
                </FormField>
                <FormField label="Description" required>
                  <FormTextarea {...register('description')} rows={3} placeholder="Explain why this matters to clients…" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Stat Value" hint="e.g. 99% or 200+">
                    <FormInput {...register('stat_value')} placeholder="99%" />
                  </FormField>
                  <FormField label="Stat Label" hint="e.g. Client Satisfaction">
                    <FormInput {...register('stat_label')} placeholder="Client Satisfaction" />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Sort Order">
                    <FormInput {...register('sort_order')} type="number" />
                  </FormField>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded accent-brand-600" />
                  <span className="text-sm text-gray-700">Active (visible on site)</span>
                </label>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeForm} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                  <SaveButton loading={saveMutation.isPending} label={editing ? 'Update' : 'Add Reason'} />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}