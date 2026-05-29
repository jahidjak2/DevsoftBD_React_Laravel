// src/pages/admin/TeamManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, Edit2, Trash2, X, Users2 } from 'lucide-react'
import {
  PageHeader, FormField, FormInput, FormTextarea, SaveButton,
  ConfirmDialog, AdminTable, RowActions, ImageDropzone,
} from '@/components/admin/AdminShared'

export default function TeamManager() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: () => adminApi.get('/team').then(r => r.data.data),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', designation: '', department: '', bio: '', email: '', linkedin_url: '', github_url: '', twitter_url: '', is_public: true, sort_order: 0 },
  })

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editing ? adminApi.put(`/team/${editing.id}`, data) : adminApi.post('/team', data),
    onSuccess: () => {
      toast.success(editing ? 'Member updated.' : 'Member added.')
      qc.invalidateQueries({ queryKey: ['admin-team'] })
      reset(); setShowForm(false); setEditing(null); setPhotoUrl(null)
    },
    onError: () => toast.error('Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/team/${id}`),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries({ queryKey: ['admin-team'] }); setDeleteId(null) },
  })

  async function uploadPhoto(file: File) {
    if (!editing) { toast.error('Save the member first, then upload photo.'); return }
    setUploading(true)
    const form = new FormData(); form.append('image', file)
    try {
      const res = await adminApi.post(`/team/${editing.id}/photo`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setPhotoUrl(res.data.media.url); toast.success('Photo updated.')
      qc.invalidateQueries({ queryKey: ['admin-team'] })
    } catch { toast.error('Upload failed.') }
    finally { setUploading(false) }
  }

  function startEdit(m: any) {
    setEditing(m); setPhotoUrl(m.photo_url || null)
    reset({ name: m.name, designation: m.designation, department: m.department || '', bio: m.bio || '', email: m.email || '', linkedin_url: m.linkedin_url || '', github_url: m.github_url || '', twitter_url: m.twitter_url || '', is_public: m.is_public ?? true, sort_order: m.sort_order || 0 })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); reset(); setPhotoUrl(null) }

  return (
    <div className="max-w-7xl space-y-6">
      <PageHeader title="Team Members" subtitle="Manage your public team page"
        action={<button onClick={() => { setEditing(null); reset(); setShowForm(true) }} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"><Plus className="h-4 w-4" /> Add Member</button>} />

      <AdminTable headers={['Member', 'Designation', 'Department', 'Visible', 'Actions']} loading={isLoading} emptyMessage="No team members yet.">
        {(data as any[] || []).map((m: any) => (
          <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                {m.photo_url ? <img src={m.photo_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold flex-shrink-0">{m.name?.substring(0, 2).toUpperCase()}</div>}
                <p className="font-medium text-sm text-gray-900">{m.name}</p>
              </div>
            </td>
            <td className="px-5 py-4 text-sm text-gray-600">{m.designation}</td>
            <td className="px-5 py-4 text-xs text-gray-500">{m.department || '—'}</td>
            <td className="px-5 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{m.is_public ? 'Visible' : 'Hidden'}</span></td>
            <td className="px-5 py-4"><RowActions onEdit={() => startEdit(m)} onDelete={() => setDeleteId(m.id)} /></td>
          </tr>
        ))}
      </AdminTable>

      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto bg-white h-full w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
                <FormField label="Photo" hint={editing ? 'Click to upload a new photo' : 'Save first, then upload photo'}>
                  <ImageDropzone currentUrl={photoUrl} onUpload={uploadPhoto} loading={uploading} label="Upload Photo" aspectClass="h-36 w-36 rounded-full" />
                </FormField>
                <FormField label="Full Name" required><FormInput {...register('name')} placeholder="Jane Smith" /></FormField>
                <FormField label="Designation" required><FormInput {...register('designation')} placeholder="Senior React Developer" /></FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Department"><FormInput {...register('department')} placeholder="Engineering" /></FormField>
                  <FormField label="Sort Order"><FormInput {...register('sort_order')} type="number" /></FormField>
                </div>
                <FormField label="Bio"><FormTextarea {...register('bio')} rows={3} placeholder="Short biography…" /></FormField>
                <FormField label="Email"><FormInput {...register('email')} type="email" placeholder="jane@devsoftbd.com" /></FormField>
                <div className="grid grid-cols-1 gap-3">
                  <FormField label="LinkedIn URL"><FormInput {...register('linkedin_url')} placeholder="https://linkedin.com/in/…" /></FormField>
                  <FormField label="GitHub URL"><FormInput {...register('github_url')} placeholder="https://github.com/…" /></FormField>
                  <FormField label="Twitter URL"><FormInput {...register('twitter_url')} placeholder="https://twitter.com/…" /></FormField>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('is_public')} className="w-4 h-4 rounded accent-brand-600" />
                  <span className="text-sm text-gray-700">Show on public team page</span>
                </label>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeForm} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                  <SaveButton loading={saveMutation.isPending} label={editing ? 'Update' : 'Add Member'} />
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