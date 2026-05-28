 
// ══════════════════════════════════════════════════════════════
// src/pages/admin/HeroManager.tsx
// ══════════════════════════════════════════════════════════════
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, Zap, ZapOff, Trash2, Edit2 } from 'lucide-react'
import { PageHeader, FormField, FormInput, FormTextarea, FormSelect, SaveButton, ImageDropzone, ConfirmDialog } from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'
 
export function HeroManager() {
  const [editing, setEditing]   = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()
 
  const { data, isLoading } = useQuery({
    queryKey: ['admin-heroes'],
    queryFn: () => adminApi.get('/hero').then(r => r.data.data),
  })
 
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: { headline: '', subheadline: '', cta_primary_text: '', cta_primary_link: '', cta_secondary_text: '', cta_secondary_link: '', background_type: 'gradient', badge_text: '' },
  })
 
  const saveMutation = useMutation({
    mutationFn: (data: any) => editing
      ? adminApi.put(`/hero/${editing.id}`, data)
      : adminApi.post('/hero', data),
    onSuccess: () => {
      toast.success(editing ? 'Hero updated.' : 'Hero created.')
      qc.invalidateQueries({ queryKey: ['admin-heroes'] })
      reset(); setShowForm(false); setEditing(null)
    },
    onError: () => toast.error('Save failed.'),
  })
 
  const activateMutation = useMutation({
    mutationFn: (id: number) => adminApi.post(`/hero/${id}/activate`),
    onSuccess: () => { toast.success('Hero activated.'); qc.invalidateQueries({ queryKey: ['admin-heroes'] }) },
  })
 
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/hero/${id}`),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries({ queryKey: ['admin-heroes'] }); setDeleteId(null) },
  })
 
  function startEdit(hero: any) {
    setEditing(hero)
    reset({ headline: hero.headline, subheadline: hero.subheadline || '', cta_primary_text: hero.cta_primary_text || '', cta_primary_link: hero.cta_primary_link || '', cta_secondary_text: hero.cta_secondary_text || '', cta_secondary_link: hero.cta_secondary_link || '', background_type: hero.background_type || 'gradient', badge_text: hero.badge_text || '' })
    setShowForm(true)
  }
 
  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Hero Sections" subtitle="Manage your homepage hero. Only one can be active at a time."
        action={<button onClick={() => { setEditing(null); reset(); setShowForm(true) }} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"><Plus className="h-4 w-4" /> New Hero</button>} />
 
      {/* Hero list */}
      <div className="space-y-4">
        {isLoading ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />) :
          (data || []).map((hero: any) => (
            <div key={hero.id} className={cn('bg-white rounded-xl border p-5 flex items-start gap-4', hero.is_active ? 'border-green-300 bg-green-50/40' : 'border-gray-100')}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {hero.is_active && <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1"><Zap className="h-3 w-3" />Active</span>}
                  <span className="text-xs text-gray-400 capitalize">{hero.background_type}</span>
                </div>
                <p className="font-medium text-gray-900 text-sm line-clamp-1" dangerouslySetInnerHTML={{ __html: hero.headline }} />
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{hero.subheadline}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!hero.is_active && (
                  <button onClick={() => activateMutation.mutate(hero.id)}
                    className="flex items-center gap-1.5 text-xs text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                    <Zap className="h-3.5 w-3.5" /> Activate
                  </button>
                )}
                <button onClick={() => startEdit(hero)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => setDeleteId(hero.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))
        }
      </div>
 
      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-5">{editing ? 'Edit Hero' : 'New Hero Section'}</h3>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-5">
            <FormField label="Headline" required hint="HTML allowed — use <span class='gradient-text'>word</span> for color highlights">
              <FormTextarea {...register('headline')} rows={2} placeholder="Building <span class='text-blue-400'>Digital Solutions</span> That Drive Growth" />
            </FormField>
            <FormField label="Subheadline"><FormTextarea {...register('subheadline')} rows={2} placeholder="Supporting text shown below the headline." /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Primary CTA Text"><FormInput {...register('cta_primary_text')} placeholder="View Our Work" /></FormField>
              <FormField label="Primary CTA Link"><FormInput {...register('cta_primary_link')} placeholder="/projects" /></FormField>
              <FormField label="Secondary CTA Text"><FormInput {...register('cta_secondary_text')} placeholder="Schedule a Call" /></FormField>
              <FormField label="Secondary CTA Link"><FormInput {...register('cta_secondary_link')} placeholder="/contact" /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Background Type">
                <FormSelect {...register('background_type')}><option value="gradient">Gradient</option><option value="image">Image</option><option value="video">Video</option></FormSelect>
              </FormField>
              <FormField label="Badge Text" hint="Small pill above headline"><FormInput {...register('badge_text')} placeholder="🏆 Top-rated Agency" /></FormField>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset() }} className="px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <SaveButton loading={saveMutation.isPending} label={editing ? 'Update Hero' : 'Create Hero'} />
            </div>
          </form>
        </div>
      )}
      <ConfirmDialog open={deleteId !== null} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} loading={deleteMutation.isPending} />
    </div>
  )
}
export default HeroManager