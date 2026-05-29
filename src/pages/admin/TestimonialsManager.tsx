// src/pages/admin/TestimonialsManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, Star, CheckCircle, X, ThumbsUp } from 'lucide-react'
import {
  PageHeader, FormField, FormInput, FormTextarea, FormSelect,
  SaveButton, ConfirmDialog, AdminTable, RowActions, StatusBadge,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

export default function TestimonialsManager() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [filter, setFilter]     = useState<'all' | 'pending' | 'approved'>('all')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-testimonials', filter],
    queryFn: () => adminApi.get('/testimonials', {
      params: filter !== 'all' ? { approved: filter === 'approved' } : {},
    }).then(r => r.data),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { client_name: '', client_designation: '', client_company: '', rating: 5, review_text: '', source: 'direct', source_url: '', is_approved: false, is_featured: false, sort_order: 0 },
  })

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editing ? adminApi.put(`/testimonials/${editing.id}`, data) : adminApi.post('/testimonials', data),
    onSuccess: () => {
      toast.success(editing ? 'Testimonial updated.' : 'Testimonial added.')
      qc.invalidateQueries({ queryKey: ['admin-testimonials'] })
      reset(); setShowForm(false); setEditing(null)
    },
    onError: () => toast.error('Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/testimonials/${id}`),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries({ queryKey: ['admin-testimonials'] }); setDeleteId(null) },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.patch(`/testimonials/${id}/approve`),
    onSuccess: () => { toast.success('Updated.'); qc.invalidateQueries({ queryKey: ['admin-testimonials'] }) },
  })

  function startEdit(t: any) {
    setEditing(t)
    reset({ client_name: t.client_name, client_designation: t.client_designation || '', client_company: t.client_company || '', rating: t.rating || 5, review_text: t.review_text, source: t.source || 'direct', source_url: t.source_url || '', is_approved: t.is_approved, is_featured: t.is_featured, sort_order: t.sort_order || 0 })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const testimonials = data?.data?.data || data?.data || []

  return (
    <div className="max-w-7xl space-y-6">
      <PageHeader title="Testimonials" subtitle="Manage client reviews and feedback"
        action={<button onClick={() => { setEditing(null); reset(); setShowForm(true) }} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"><Plus className="h-4 w-4" /> Add Review</button>} />

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all', filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {f}
          </button>
        ))}
      </div>

      <AdminTable headers={['Client', 'Rating', 'Source', 'Status', 'Featured', 'Actions']} loading={isLoading} emptyMessage="No testimonials yet.">
        {testimonials.map((t: any) => (
          <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                {t.client_avatar_url ? <img src={t.client_avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">{t.client_name?.substring(0,2).toUpperCase()}</div>}
                <div>
                  <p className="font-medium text-sm text-gray-900">{t.client_name}</p>
                  <p className="text-xs text-gray-400">{t.client_designation}</p>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 max-w-xs">"{t.review_text}"</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => <Star key={n} className={cn('h-3.5 w-3.5', n <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-100')} />)}
              </div>
            </td>
            <td className="px-5 py-4"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">{t.source}</span></td>
            <td className="px-5 py-4">
              <button onClick={() => approveMutation.mutate(t.id)} title="Toggle approval"
                className={cn('text-xs px-2.5 py-1 rounded-full font-medium transition-colors', t.is_approved ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200')}>
                {t.is_approved ? '✓ Approved' : '⏳ Pending'}
              </button>
            </td>
            <td className="px-5 py-4">
              <Star className={cn('h-4 w-4', t.is_featured ? 'fill-amber-400 text-amber-400' : 'text-gray-200')} />
            </td>
            <td className="px-5 py-4"><RowActions onEdit={() => startEdit(t)} onDelete={() => setDeleteId(t.id)} /></td>
          </tr>
        ))}
      </AdminTable>

      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto bg-white h-full w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
                <FormField label="Client Name" required><FormInput {...register('client_name')} placeholder="John Smith" /></FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Designation"><FormInput {...register('client_designation')} placeholder="CEO, Acme Corp" /></FormField>
                  <FormField label="Company"><FormInput {...register('client_company')} placeholder="Acme Corp" /></FormField>
                </div>
                <FormField label="Rating">
                  <FormSelect {...register('rating', { valueAsNumber: true })}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
                  </FormSelect>
                </FormField>
                <FormField label="Review Text" required><FormTextarea {...register('review_text')} rows={4} placeholder="The client's testimonial…" /></FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Source">
                    <FormSelect {...register('source')}>
                      {['direct','google','clutch','upwork','fiverr','linkedin','other'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </FormSelect>
                  </FormField>
                  <FormField label="Source URL"><FormInput {...register('source_url')} placeholder="https://…" /></FormField>
                </div>
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('is_approved')} className="w-4 h-4 rounded accent-brand-600" /><span className="text-sm text-gray-700">Approved</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded accent-brand-600" /><span className="text-sm text-gray-700">Featured</span></label>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeForm} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                  <SaveButton loading={saveMutation.isPending} label={editing ? 'Update' : 'Add Review'} />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={deleteId !== null} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} loading={deleteMutation.isPending} />
    </div>
  )
}