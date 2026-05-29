// src/pages/admin/IndustriesManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, X } from 'lucide-react'
import { PageHeader, FormField, FormInput, FormTextarea, SaveButton, ConfirmDialog, AdminTable, RowActions, ImageDropzone } from '@/components/admin/AdminShared'

export default function IndustriesManager() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [iconUrl, setIconUrl]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['admin-industries'], queryFn: () => adminApi.get('/industries').then(r => r.data.data) })
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', short_description: '', description: '', color: '#3B82F6', sort_order: 0, is_active: true } })

  const saveMutation = useMutation({
    mutationFn: (d: any) => editing ? adminApi.put(`/industries/${editing.id}`, d) : adminApi.post('/industries', d),
    onSuccess: () => { toast.success(editing ? 'Updated.' : 'Industry added.'); qc.invalidateQueries({ queryKey: ['admin-industries'] }); reset(); setShowForm(false); setEditing(null); setIconUrl(null) },
    onError: () => toast.error('Save failed.'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/industries/${id}`),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries({ queryKey: ['admin-industries'] }); setDeleteId(null) },
  })

  async function uploadIcon(file: File) {
    if (!editing) { toast.error('Save first.'); return }
    setUploading(true)
    const form = new FormData(); form.append('image', file)
    try { const res = await adminApi.post(`/industries/${editing.id}/icon`, form, { headers: { 'Content-Type': 'multipart/form-data' } }); setIconUrl(res.data.media.url); toast.success('Icon updated.'); qc.invalidateQueries({ queryKey: ['admin-industries'] }) }
    catch { toast.error('Upload failed.') } finally { setUploading(false) }
  }

  function startEdit(item: any) { setEditing(item); setIconUrl(item.icon?.url || null); reset({ name: item.name, short_description: item.short_description || '', description: item.description || '', color: item.color || '#3B82F6', sort_order: item.sort_order || 0, is_active: item.is_active ?? true }); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null); reset(); setIconUrl(null) }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title="Industries We Serve" subtitle="Industries shown on the homepage section"
        action={<button onClick={() => { setEditing(null); reset(); setShowForm(true) }} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"><Plus className="h-4 w-4" /> Add Industry</button>} />

      <AdminTable headers={['Industry', 'Description', 'Color', 'Status', 'Actions']} loading={isLoading} emptyMessage="No industries added yet.">
        {(data as any[] || []).map((item: any) => (
          <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.color + '20' }}>
                  {item.icon_url ? <img src={item.icon_url} alt="" className="w-6 h-6 object-contain" /> : <div className="w-5 h-5 rounded" style={{ background: item.color }} />}
                </div>
                <p className="font-medium text-sm text-gray-900">{item.name}</p>
              </div>
            </td>
            <td className="px-5 py-4 text-xs text-gray-500 max-w-xs"><p className="line-clamp-2">{item.short_description}</p></td>
            <td className="px-5 py-4"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border border-gray-200" style={{ background: item.color }} /><span className="text-xs text-gray-500 font-mono">{item.color}</span></div></td>
            <td className="px-5 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.is_active ? 'Active' : 'Hidden'}</span></td>
            <td className="px-5 py-4"><RowActions onEdit={() => startEdit(item)} onDelete={() => setDeleteId(item.id)} /></td>
          </tr>
        ))}
      </AdminTable>

      {showForm && (
        <div className="fixed inset-0 z-50 flex"><div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto bg-white h-full w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Industry' : 'Add Industry'}</h2><button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button></div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
                <FormField label="Icon" hint={editing ? 'Upload SVG, PNG or WebP icon' : 'Save first then upload icon'}>
                  <ImageDropzone currentUrl={iconUrl} onUpload={uploadIcon} loading={uploading} label="Upload Icon" aspectClass="h-24 w-24" />
                </FormField>
                <FormField label="Industry Name" required><FormInput {...register('name')} placeholder="Healthcare" /></FormField>
                <FormField label="Short Description" hint="Shown on homepage card"><FormTextarea {...register('short_description')} rows={2} placeholder="Brief description…" /></FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Accent Color"><div className="flex gap-2"><input type="color" {...register('color')} className="h-10 w-12 rounded-lg border p-1 cursor-pointer" /><FormInput {...register('color')} placeholder="#3B82F6" /></div></FormField>
                  <FormField label="Sort Order"><FormInput {...register('sort_order')} type="number" /></FormField>
                </div>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded accent-brand-600" /><span className="text-sm text-gray-700">Active (visible on site)</span></label>
                <div className="flex gap-3 pt-4 border-t border-gray-100"><button type="button" onClick={closeForm} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button><SaveButton loading={saveMutation.isPending} label={editing ? 'Update' : 'Add Industry'} /></div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={deleteId !== null} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} loading={deleteMutation.isPending} />
    </div>
  )
}