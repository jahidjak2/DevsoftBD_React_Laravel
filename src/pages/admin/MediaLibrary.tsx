// src/pages/admin/MediaLibrary.tsx
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, Trash2, Edit2, Copy, X, Check, Search, Filter, Loader2 } from 'lucide-react'
import { PageHeader, ConfirmDialog } from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

const TYPE_FILTERS = [
  { label: 'All',       value: ''         },
  { label: 'Images',    value: 'image'    },
  { label: 'Documents', value: 'document' },
  { label: 'Videos',    value: 'video'    },
]

function formatBytes(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return bytes + ' B'
}

export default function MediaLibrary() {
  const [search, setSearch]       = useState('')
  const [type, setType]           = useState('')
  const [selected, setSelected]   = useState<any | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [editingAlt, setEditingAlt] = useState(false)
  const [altText, setAltText]     = useState('')
  const [copiedId, setCopiedId]   = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [page, setPage]           = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-media', { search, type, page }],
    queryFn: () => adminApi.get('/media', { params: { ...(search && { search }), ...(type && { type }), page } }).then(r => r.data),
  })

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => {
      const form = new FormData()
      files.forEach(f => form.append('files[]', f))
      return adminApi.post('/media', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (res) => {
      toast.success(`${res.data.data.length} file(s) uploaded.`)
      qc.invalidateQueries({ queryKey: ['admin-media'] })
    },
    onError: () => toast.error('Upload failed.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, alt_text }: { id: number; alt_text: string }) =>
      adminApi.put(`/media/${id}`, { alt_text }),
    onSuccess: () => {
      toast.success('Alt text saved.')
      qc.invalidateQueries({ queryKey: ['admin-media'] })
      if (selected) setSelected((prev: any) => ({ ...prev, alt_text: altText }))
      setEditingAlt(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/media/${id}`),
    onSuccess: () => {
      toast.success('File deleted.')
      qc.invalidateQueries({ queryKey: ['admin-media'] })
      setDeleteId(null)
      if (selected?.id === deleteId) setSelected(null)
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) uploadMutation.mutate(acceptedFiles)
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [], 'video/*': [] },
    maxSize: 20 * 1024 * 1024,
    multiple: true,
  })

  function copyUrl(media: any) {
    navigator.clipboard.writeText(media.url)
    setCopiedId(media.id)
    toast.success('URL copied.')
    setTimeout(() => setCopiedId(null), 2000)
  }

  function startEditAlt(media: any) {
    setSelected(media)
    setAltText(media.alt_text || '')
    setEditingAlt(true)
  }

  const media = data?.data?.data || []
  const meta  = data?.data?.meta

  return (
    <div className="max-w-7xl space-y-6 h-[calc(100vh-9rem)] flex flex-col">
      <PageHeader
        title="Media Library"
        subtitle={`${meta?.total || 0} files`}
      />

      {/* Upload dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
          isDragActive
            ? 'border-brand-400 bg-brand-50'
            : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
        )}>
        <input {...getInputProps()} />
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
            <p className="text-sm text-brand-600 font-medium">Uploading files…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">
              {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
            </p>
            <p className="text-xs text-gray-400">Images, PDFs, videos — max 20 MB each</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {TYPE_FILTERS.map(f => (
            <button key={f.value} onClick={() => { setType(f.value); setPage(1) }}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                type === f.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by filename or alt text…"
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400 transition-colors w-72" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-4">
        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-xl" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ImageIcon className="h-12 w-12 text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No files found</p>
              <p className="text-sm text-gray-400 mt-1">Upload files using the dropzone above.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {media.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => { setSelected(item); setAltText(item.alt_text || ''); setEditingAlt(false) }}
                    className={cn(
                      'relative group aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer ring-2 transition-all',
                      selected?.id === item.id ? 'ring-brand-500' : 'ring-transparent hover:ring-brand-300'
                    )}>
                    {item.mime_type?.startsWith('image/') ? (
                      <img src={item.thumb_url || item.url} alt={item.alt_text || item.filename}
                        className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-50">
                        <div className="text-2xl mb-1">{item.extension === 'pdf' ? '📄' : item.mime_type?.startsWith('video/') ? '🎬' : '📎'}</div>
                        <p className="text-[10px] text-gray-500 text-center line-clamp-2 break-all">{item.filename}</p>
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button onClick={e => { e.stopPropagation(); copyUrl(item) }}
                        className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors" title="Copy URL">
                        {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeleteId(item.id) }}
                        className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-red-600 hover:bg-white transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {selected?.id === item.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    ← Prev
                  </button>
                  <span className="text-sm text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
                  <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail sidebar */}
        {selected && (
          <div className="w-64 flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">File Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Preview */}
            {selected.mime_type?.startsWith('image/') ? (
              <img src={selected.thumb_url || selected.url} alt={selected.alt_text}
                className="w-full aspect-square object-cover rounded-xl bg-gray-50" />
            ) : (
              <div className="w-full aspect-square rounded-xl bg-gray-50 flex items-center justify-center text-5xl">
                {selected.extension === 'pdf' ? '📄' : '📎'}
              </div>
            )}

            {/* Info */}
            <div className="space-y-2 text-xs">
              {[
                { label: 'Filename', value: selected.filename },
                { label: 'Size', value: formatBytes(selected.size) },
                { label: 'Type', value: selected.mime_type },
                ...(selected.width ? [{ label: 'Dimensions', value: `${selected.width} × ${selected.height}px` }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px]">{label}</p>
                  <p className="text-gray-700 break-all">{value}</p>
                </div>
              ))}
            </div>

            {/* Alt text editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Alt Text</p>
                <button onClick={() => setEditingAlt(!editingAlt)}
                  className="text-[10px] text-brand-600 hover:text-brand-700">
                  {editingAlt ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {editingAlt ? (
                <div className="space-y-2">
                  <textarea
                    value={altText}
                    onChange={e => setAltText(e.target.value)}
                    rows={2}
                    placeholder="Describe the image for accessibility…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-400 resize-none"
                  />
                  <button
                    onClick={() => updateMutation.mutate({ id: selected.id, alt_text: altText })}
                    disabled={updateMutation.isPending}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                    {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-600 italic">{selected.alt_text || 'No alt text set'}</p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <button onClick={() => copyUrl(selected)}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                {copiedId === selected.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedId === selected.id ? 'Copied!' : 'Copy URL'}
              </button>
              <a href={selected.url} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                ↗ Open Original
              </a>
              <button onClick={() => setDeleteId(selected.id)}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 text-xs font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Delete File
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this file?"
        message="The file will be permanently deleted from storage. This cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}