// src/pages/admin/ServicesManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, Edit2, Trash2, Star, X, Layers } from 'lucide-react'
import {
  PageHeader, FormField, FormInput, FormTextarea, FormSelect,
  SaveButton, ConfirmDialog, AdminTable, RowActions, StatusBadge, SearchInput,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

export default function ServicesManager() {
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<any | null>(null)
  const [search, setSearch]       = useState('')
  const qc = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['admin-service-categories'],
    queryFn: () => adminApi.get('/service-categories').then(r => r.data.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-services', search],
    queryFn: () => adminApi.get('/services', { params: search ? { search } : {} }).then(r => r.data),
  })

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: '', category_id: '', icon: '', short_description: '',
      description: '', cta_text: '', cta_link: '', is_featured: false,
      is_active: true, sort_order: 0,
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editing ? adminApi.put(`/services/${editing.id}`, data) : adminApi.post('/services', data),
    onSuccess: () => {
      toast.success(editing ? 'Service updated.' : 'Service created.')
      qc.invalidateQueries({ queryKey: ['admin-services'] })
      reset(); setShowForm(false); setEditing(null)
    },
    onError: () => toast.error('Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/services/${id}`),
    onSuccess: () => {
      toast.success('Service deleted.')
      qc.invalidateQueries({ queryKey: ['admin-services'] })
      setDeleteId(null)
    },
  })

  function startEdit(s: any) {
    setEditing(s)
    reset({
      title: s.title || '', category_id: s.category_id || '',
      icon: s.icon || '', short_description: s.short_description || '',
      description: s.description || '', cta_text: s.cta_text || '',
      cta_link: s.cta_link || '', is_featured: s.is_featured || false,
      is_active: s.is_active ?? true, sort_order: s.sort_order || 0,
    })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const services = data?.data?.data || data?.data || []

  return (
    <div className="max-w-7xl space-y-6">
      <PageHeader
        title="Services"
        subtitle="Manage all services displayed on your website"
        action={
          <button onClick={() => { setEditing(null); reset(); setShowForm(true) }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> Add Service
          </button>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Search services…" />

      <AdminTable
        headers={['Service', 'Category', 'Featured', 'Status', 'Actions']}
        loading={isLoading}
        emptyMessage="No services yet. Add your first service.">
        {services.map((s: any) => (
          <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Layers className="h-4 w-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{s.short_description}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                {(categories as any[] || []).find((c: any) => c.id === s.category_id)?.name || '—'}
              </span>
            </td>
            <td className="px-5 py-4">
              {s.is_featured
                ? <Star className="h-4 w-4 text-amber-400 fill-current" />
                : <Star className="h-4 w-4 text-gray-200" />}
            </td>
            <td className="px-5 py-4">
              <StatusBadge status={s.is_active ? 'active' : 'inactive'} />
            </td>
            <td className="px-5 py-4">
              <RowActions
                onEdit={() => startEdit(s)}
                onDelete={() => setDeleteId(s.id)}
              />
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Slide-over form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto bg-white h-full w-full max-w-xl flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
                <FormField label="Title" required>
                  <FormInput {...register('title')} placeholder="Web Design & Development" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Category">
                    <FormSelect {...register('category_id')}>
                      <option value="">No category</option>
                      {(categories as any[] || []).map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </FormSelect>
                  </FormField>
                  <FormField label="Icon" hint="Lucide icon name e.g. Globe">
                    <FormInput {...register('icon')} placeholder="Globe" />
                  </FormField>
                </div>
                <FormField label="Short Description" hint="Shown on cards — max 150 chars">
                  <FormTextarea {...register('short_description')} rows={2} placeholder="Brief description for the service card." />
                </FormField>
                <FormField label="Full Description" hint="Rich HTML for the service detail page">
                  <FormTextarea {...register('description')} rows={6} placeholder="Detailed description of the service…" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="CTA Button Text">
                    <FormInput {...register('cta_text')} placeholder="Get a Quote" />
                  </FormField>
                  <FormField label="CTA Button Link">
                    <FormInput {...register('cta_link')} placeholder="/contact" />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Sort Order">
                    <FormInput {...register('sort_order')} type="number" placeholder="0" />
                  </FormField>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded accent-brand-600" />
                    <span className="text-sm text-gray-700">Featured on homepage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded accent-brand-600" />
                    <span className="text-sm text-gray-700">Active (visible)</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeForm}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <SaveButton loading={saveMutation.isPending} label={editing ? 'Update Service' : 'Add Service'} />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this service?"
        message="The service will be removed from your website."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}