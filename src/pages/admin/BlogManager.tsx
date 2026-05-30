// src/pages/admin/BlogManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, X, Newspaper, Eye, RotateCcw } from 'lucide-react'
import {
  PageHeader, FormField, FormInput, FormTextarea, FormSelect,
  SaveButton, ConfirmDialog, AdminTable, RowActions, StatusBadge, SearchInput,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

const STATUS_FILTERS = ['all', 'draft', 'published', 'scheduled']

export default function BlogManager() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('all')
  const qc = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['admin-blog-categories'],
    queryFn: () => adminApi.get('/blog-categories').then(r => r.data.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog', { search, status }],
    queryFn: () => adminApi.get('/blog', {
      params: {
        ...(search && { search }),
        ...(status !== 'all' && { status }),
      },
    }).then(r => r.data),
  })

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: '', category_id: '', excerpt: '', content: '',
      tags: '', read_time: 3, status: 'draft', published_at: '',
      meta_title: '', meta_description: '',
    },
  })

  const saveMutation = useMutation({
    mutationFn: (d: any) => {
      const payload = { ...d, tags: d.tags ? d.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [] }
      return editing ? adminApi.put(`/blog/${editing.id}`, payload) : adminApi.post('/blog', payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Post updated.' : 'Post created.')
      qc.invalidateQueries({ queryKey: ['admin-blog'] })
      reset(); setShowForm(false); setEditing(null)
    },
    onError: () => toast.error('Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/blog/${id}`),
    onSuccess: () => { toast.success('Post deleted.'); qc.invalidateQueries({ queryKey: ['admin-blog'] }); setDeleteId(null) },
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => adminApi.post(`/blog/${id}/restore`),
    onSuccess: () => { toast.success('Post restored.'); qc.invalidateQueries({ queryKey: ['admin-blog'] }) },
  })

  function startEdit(post: any) {
    setEditing(post)
    reset({
      title: post.title, category_id: post.category_id || '',
      excerpt: post.excerpt || '', content: post.content || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      read_time: post.read_time || 3, status: post.status || 'draft',
      published_at: post.published_at ? post.published_at.substring(0, 16) : '',
      meta_title: post.meta_title || '', meta_description: post.meta_description || '',
    })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const posts = data?.data?.data || data?.data || []

  return (
    <div className="max-w-7xl space-y-6">
      <PageHeader
        title="Blog Posts"
        subtitle={`${data?.data?.meta?.total || 0} total posts`}
        action={
          <button onClick={() => { setEditing(null); reset(); setShowForm(true) }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> New Post
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                status === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {s}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search posts…" />
      </div>

      <AdminTable
        headers={['Post', 'Category', 'Author', 'Status', 'Views', 'Date', 'Actions']}
        loading={isLoading}
        emptyMessage="No blog posts yet.">
        {posts.map((post: any) => (
          <tr key={post.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                {post.featured_image?.url
                  ? <img src={post.featured_image.url} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                  : <div className="w-12 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><Newspaper className="h-4 w-4 text-gray-300" /></div>
                }
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{post.excerpt}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {post.category?.name || '—'}
              </span>
            </td>
            <td className="px-5 py-4 text-sm text-gray-600">{post.author?.name || '—'}</td>
            <td className="px-5 py-4"><StatusBadge status={post.status} /></td>
            <td className="px-5 py-4 text-sm text-gray-500">{post.views_count || 0}</td>
            <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-1">
                {post.slug && (
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Preview">
                    <Eye className="h-4 w-4" />
                  </a>
                )}
                {post.deleted_at ? (
                  <button onClick={() => restoreMutation.mutate(post.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Restore">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                ) : (
                  <RowActions onEdit={() => startEdit(post)} onDelete={() => setDeleteId(post.id)} />
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Form drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto bg-white h-full w-full max-w-2xl flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
                <FormField label="Title" required>
                  <FormInput {...register('title')} placeholder="Post title" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Category">
                    <FormSelect {...register('category_id')}>
                      <option value="">No category</option>
                      {(categories as any[] || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </FormSelect>
                  </FormField>
                  <FormField label="Read Time (min)">
                    <FormInput {...register('read_time', { valueAsNumber: true })} type="number" min={1} />
                  </FormField>
                </div>
                <FormField label="Excerpt" hint="Auto-generated if left empty">
                  <FormTextarea {...register('excerpt')} rows={2} placeholder="Short summary shown on listing page…" />
                </FormField>
                <FormField label="Content" required hint="Full post content — HTML supported">
                  <FormTextarea {...register('content')} rows={10} placeholder="Write your post content here. HTML is supported." />
                </FormField>
                <FormField label="Tags" hint="Comma-separated: AI, Laravel, Tutorial">
                  <FormInput {...register('tags')} placeholder="AI, Laravel, Tutorial" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Status">
                    <FormSelect {...register('status')}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </FormSelect>
                  </FormField>
                  <FormField label="Publish Date" hint="Leave blank to publish now">
                    <FormInput {...register('published_at')} type="datetime-local" />
                  </FormField>
                </div>
                <FormField label="Meta Title" hint="SEO — defaults to post title">
                  <FormInput {...register('meta_title')} placeholder="Custom SEO title" />
                </FormField>
                <FormField label="Meta Description" hint="SEO — 150-160 characters">
                  <FormTextarea {...register('meta_description')} rows={2} placeholder="Brief description for search engines…" />
                </FormField>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeForm} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                  <SaveButton loading={saveMutation.isPending} label={editing ? 'Update Post' : 'Create Post'} />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this post?"
        message="The post will be soft-deleted and can be restored later."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}