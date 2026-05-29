// src/pages/admin/HeroManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, Zap, Edit2, Trash2, X } from 'lucide-react'
import {
  PageHeader, FormField, FormInput, FormTextarea, FormSelect,
  SaveButton, ConfirmDialog,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

export default function HeroManager() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-heroes'],
    queryFn: () => adminApi.get('/hero').then(r => r.data.data),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      headline: '', subheadline: '', cta_primary_text: 'View Our Work',
      cta_primary_link: '/projects', cta_secondary_text: 'Schedule a Call',
      cta_secondary_link: '/contact', background_type: 'gradient', badge_text: '',
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editing ? adminApi.put(`/hero/${editing.id}`, data) : adminApi.post('/hero', data),
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
    onSuccess: () => {
      toast.success('Deleted.')
      qc.invalidateQueries({ queryKey: ['admin-heroes'] })
      setDeleteId(null)
    },
  })

  function startEdit(hero: any) {
    setEditing(hero)
    reset({
      headline: hero.headline || '', subheadline: hero.subheadline || '',
      cta_primary_text: hero.cta_primary_text || '', cta_primary_link: hero.cta_primary_link || '',
      cta_secondary_text: hero.cta_secondary_text || '', cta_secondary_link: hero.cta_secondary_link || '',
      background_type: hero.background_type || 'gradient', badge_text: hero.badge_text || '',
    })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); reset() }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Hero Sections"
        subtitle="Manage homepage hero banners. Only one hero can be active at a time."
        action={
          <button onClick={() => { setEditing(null); reset(); setShowForm(true) }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> New Hero
          </button>
        }
      />

      {/* Hero list */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)
          : (data as any[] || []).map((hero: any) => (
            <div key={hero.id} className={cn(
              'bg-white rounded-xl border p-5 flex items-start gap-4 shadow-sm transition-colors',
              hero.is_active ? 'border-green-300 bg-green-50/30' : 'border-gray-100'
            )}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {hero.is_active
                    ? <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Zap className="h-3 w-3 fill-current" /> Active</span>
                    : <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Inactive</span>
                  }
                  <span className="text-xs text-gray-400 capitalize border border-gray-200 px-2 py-0.5 rounded-full">{hero.background_type}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1"
                  dangerouslySetInnerHTML={{ __html: hero.headline || 'No headline' }} />
                <p className="text-xs text-gray-500 line-clamp-2">{hero.subheadline}</p>
                {hero.stats?.length > 0 && (
                  <div className="flex gap-4 mt-2">
                    {hero.stats.map((s: any, i: number) => (
                      <span key={i} className="text-xs text-gray-400"><strong className="text-gray-700">{s.value}</strong> {s.label}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!hero.is_active && (
                  <button onClick={() => activateMutation.mutate(hero.id)}
                    className="flex items-center gap-1.5 text-xs text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                    disabled={activateMutation.isPending}>
                    <Zap className="h-3.5 w-3.5" /> Activate
                  </button>
                )}
                <button onClick={() => startEdit(hero)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteId(hero.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        }

        {!isLoading && (data as any[] || []).length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <Zap className="h-8 w-8 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hero sections yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first homepage banner.</p>
          </div>
        )}
      </div>

      {/* Form panel */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-gray-900">{editing ? 'Edit Hero Section' : 'Create Hero Section'}</h3>
            <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-5">
            <FormField label="Headline" required
              hint="HTML supported — wrap words in <span class='text-blue-400'>text</span> for color effects">
              <FormTextarea {...register('headline')} rows={2}
                placeholder="Building <span class='text-blue-400'>Digital Solutions</span> That Drive Growth" />
            </FormField>

            <FormField label="Subheadline"
              hint="Supporting paragraph shown below the headline">
              <FormTextarea {...register('subheadline')} rows={2}
                placeholder="DevSoft BD delivers cutting-edge software solutions tailored to your business needs." />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Primary Button Text">
                <FormInput {...register('cta_primary_text')} placeholder="View Our Work" />
              </FormField>
              <FormField label="Primary Button Link">
                <FormInput {...register('cta_primary_link')} placeholder="/projects" />
              </FormField>
              <FormField label="Secondary Button Text">
                <FormInput {...register('cta_secondary_text')} placeholder="Schedule a Call" />
              </FormField>
              <FormField label="Secondary Button Link">
                <FormInput {...register('cta_secondary_link')} placeholder="/contact" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Background Type">
                <FormSelect {...register('background_type')}>
                  <option value="gradient">Gradient (no image needed)</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </FormSelect>
              </FormField>
              <FormField label="Badge Text" hint="Small pill shown above headline — e.g. 🏆 Top-rated Agency">
                <FormInput {...register('badge_text')} placeholder="🏆 Top-rated Software Agency in Bangladesh" />
              </FormField>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={closeForm}
                className="px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <SaveButton loading={saveMutation.isPending} label={editing ? 'Update Hero' : 'Create Hero'} />
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete hero section?"
        message="This hero section will be permanently removed."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}