// src/pages/admin/ProjectForm.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { ArrowLeft, X, Plus, Loader2, Trash2, GripVertical } from 'lucide-react'
import {
  FormField, FormInput, FormTextarea, FormSelect,
  SaveButton, Tabs, ImageDropzone, PageHeader,
} from '@/components/admin/AdminShared'

const TABS = ['Basic Info', 'Client', 'Content', 'Media', 'Tags']

const schema = z.object({
  title:             z.string().min(2, 'Title required'),
  short_description: z.string().max(500).optional(),
  status:            z.enum(['draft', 'published', 'featured']),
  is_featured:       z.boolean().optional(),
  live_url:          z.string().url().optional().or(z.literal('')),
  github_url:        z.string().url().optional().or(z.literal('')),
  case_study_url:    z.string().url().optional().or(z.literal('')),
  completion_date:   z.string().optional(),
  duration:          z.string().optional(),
  team_size:         z.coerce.number().int().positive().optional().or(z.literal('')),
  client_name:       z.string().optional(),
  client_country:    z.string().optional(),
  description:       z.string().optional(),
  challenge:         z.string().optional(),
  solution:          z.string().optional(),
  outcome:           z.string().optional(),
  meta_title:        z.string().max(300).optional(),
  meta_description:  z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

export default function ProjectForm() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const isEdit    = !!id
  const [tab, setTab]         = useState('Basic Info')
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [thumbnailId,  setThumbnailId]  = useState<number | null>(null)
  const [galleryImages, setGalleryImages] = useState<{ id: number; image_url: string; thumb_url?: string }[]>([])
  const [uploadingThumb,   setUploadingThumb]   = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  // Load existing project if editing
  const { data: projectData } = useQuery({
    queryKey: ['admin-project', id],
    queryFn:  () => adminApi.get(`/projects/${id}`).then(r => r.data.data),
    enabled:  isEdit,
  })

  // Load all tags for selector
  const { data: tagsData } = useQuery({
    queryKey: ['admin-tags'],
    queryFn:  () => adminApi.get('/tags').then(r => r.data.data),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft', is_featured: false },
  })

  // Populate form when editing
  useEffect(() => {
    if (projectData) {
      reset({
        title:             projectData.title        || '',
        short_description: projectData.short_description || '',
        status:            projectData.status        || 'draft',
        is_featured:       projectData.is_featured   || false,
        live_url:          projectData.live_url       || '',
        github_url:        projectData.github_url     || '',
        case_study_url:    projectData.case_study_url || '',
        completion_date:   projectData.completion_date || '',
        duration:          projectData.duration        || '',
        team_size:         projectData.team_size        || '',
        client_name:       projectData.client_name     || '',
        client_country:    projectData.client_country  || '',
        description:       projectData.description     || '',
        challenge:         projectData.challenge       || '',
        solution:          projectData.solution        || '',
        outcome:           projectData.outcome         || '',
        meta_title:        projectData.meta_title      || '',
        meta_description:  projectData.meta_description || '',
      })
      setSelectedTags(projectData.all_tags?.map((t: any) => t.id) || [])
      setThumbnailUrl(projectData.thumbnail_url || null)
      setThumbnailId(projectData.thumbnail_id   || null)
      setGalleryImages(projectData.images?.map((img: any) => ({
        id: img.id, image_url: img.image_url, thumb_url: img.thumb_url,
      })) || [])
    }
  }, [projectData, reset])

  const saveMutation = useMutation({
    mutationFn: (data: FormValues & { tag_ids: number[] }) =>
      isEdit
        ? adminApi.put(`/projects/${id}`, data)
        : adminApi.post('/projects', data),
    onSuccess: (res) => {
      toast.success(isEdit ? 'Project updated.' : 'Project created.')
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
      if (!isEdit) navigate(`/admin/projects/${res.data.data.id}/edit`, { replace: true })
    },
    onError: () => toast.error('Save failed.'),
  })

  function onSubmit(data: FormValues) {
    saveMutation.mutate({ ...data, tag_ids: selectedTags })
  }

  // Thumbnail upload
  async function uploadThumbnail(file: File) {
    if (!isEdit) { toast.error('Save the project first, then upload images.'); return }
    setUploadingThumb(true)
    const form = new FormData(); form.append('image', file)
    try {
      const res = await adminApi.post(`/projects/${id}/thumbnail`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setThumbnailUrl(res.data.media.url)
      setThumbnailId(res.data.media.id)
      toast.success('Thumbnail updated.')
    } catch { toast.error('Upload failed.') }
    finally { setUploadingThumb(false) }
  }

  // Gallery upload
  async function uploadGallery(files: File[]) {
    if (!isEdit) { toast.error('Save the project first, then upload gallery images.'); return }
    setUploadingGallery(true)
    const form = new FormData()
    files.forEach(f => form.append('images[]', f))
    try {
      const res = await adminApi.post(`/projects/${id}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setGalleryImages(prev => [...prev, ...res.data.data])
      toast.success(`${res.data.data.length} image(s) uploaded.`)
    } catch { toast.error('Gallery upload failed.') }
    finally { setUploadingGallery(false) }
  }

  async function removeGalleryImage(imageId: number) {
    try {
      await adminApi.delete(`/projects/${id}/images/${imageId}`)
      setGalleryImages(prev => prev.filter(img => img.id !== imageId))
      toast.success('Image removed.')
    } catch { toast.error('Remove failed.') }
  }

  function toggleTag(tagId: number) {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const tagsByType = {
    tech:     (tagsData || []).filter((t: any) => t.type === 'tech'),
    category: (tagsData || []).filter((t: any) => t.type === 'category'),
    industry: (tagsData || []).filter((t: any) => t.type === 'industry'),
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/projects" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader
          title={isEdit ? 'Edit Project' : 'New Project'}
          subtitle={isEdit ? `Editing: ${watch('title') || 'Untitled'}` : 'Add a new project to your portfolio'}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

          {/* ── Tab: Basic Info ────────────────────────── */}
          {tab === 'Basic Info' && (
            <div className="space-y-5">
              <FormField label="Project Title" required error={errors.title?.message}>
                <FormInput {...register('title')} placeholder="e.g. ERP System for ABC Manufacturing" error={!!errors.title} />
              </FormField>
              <FormField label="Short Description" hint="Shown on the project card. Max 500 characters.">
                <FormTextarea {...register('short_description')} rows={2} placeholder="One or two sentences describing the project." />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Status" required>
                  <FormSelect {...register('status')}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="featured">Featured</option>
                  </FormSelect>
                </FormField>
                <FormField label="Homepage Featured">
                  <label className="flex items-center gap-3 cursor-pointer mt-1">
                    <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded accent-brand-600" />
                    <span className="text-sm text-gray-600">Show on homepage featured strip</span>
                  </label>
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Live URL" error={errors.live_url?.message}>
                  <FormInput {...register('live_url')} placeholder="https://example.com" error={!!errors.live_url} />
                </FormField>
                <FormField label="GitHub URL">
                  <FormInput {...register('github_url')} placeholder="https://github.com/..." />
                </FormField>
                <FormField label="Case Study URL">
                  <FormInput {...register('case_study_url')} placeholder="https://..." />
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Completion Date">
                  <FormInput {...register('completion_date')} type="date" />
                </FormField>
                <FormField label="Duration">
                  <FormInput {...register('duration')} placeholder="e.g. 3 months" />
                </FormField>
                <FormField label="Team Size">
                  <FormInput {...register('team_size')} type="number" min={1} placeholder="5" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Meta Title" hint="SEO — defaults to project title if empty">
                  <FormInput {...register('meta_title')} placeholder="Custom page title for SEO" />
                </FormField>
                <FormField label="Meta Description" hint="SEO — 150-160 characters">
                  <FormInput {...register('meta_description')} placeholder="Short description for search engines" />
                </FormField>
              </div>
            </div>
          )}

          {/* ── Tab: Client ────────────────────────────── */}
          {tab === 'Client' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Client Name">
                  <FormInput {...register('client_name')} placeholder="ABC Manufacturing Ltd" />
                </FormField>
                <FormField label="Client Country">
                  <FormInput {...register('client_country')} placeholder="Bangladesh" />
                </FormField>
              </div>
              <FormField label="Client Logo" hint="Upload client's logo to show in project sidebar">
                <p className="text-xs text-gray-400 mb-2">Client logo upload available after saving the project.</p>
              </FormField>
            </div>
          )}

          {/* ── Tab: Content ───────────────────────────── */}
          {tab === 'Content' && (
            <div className="space-y-5">
              <FormField label="Full Description" hint="Rich text — tells the full story of the project.">
                <FormTextarea {...register('description')} rows={8} placeholder="Describe the project in detail. What was built, what technologies were used, what problems were solved…" />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="The Challenge" hint="What problem did the client face?">
                  <FormTextarea {...register('challenge')} rows={4} placeholder="The client needed to manage…" />
                </FormField>
                <FormField label="Our Solution" hint="How did you solve it?">
                  <FormTextarea {...register('solution')} rows={4} placeholder="We built a custom ERP system that…" />
                </FormField>
                <FormField label="The Outcome" hint="What was the measurable result?">
                  <FormTextarea {...register('outcome')} rows={4} placeholder="40% reduction in processing time…" />
                </FormField>
              </div>
            </div>
          )}

          {/* ── Tab: Media ─────────────────────────────── */}
          {tab === 'Media' && (
            <div className="space-y-6">
              {!isEdit && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  Save the project first on the Basic Info tab, then come back to upload images.
                </div>
              )}

              <FormField label="Thumbnail Image" hint="Main image shown on project card. Recommended: 1280×720px">
                <ImageDropzone
                  currentUrl={thumbnailUrl}
                  onUpload={uploadThumbnail}
                  loading={uploadingThumb}
                  label="Upload Thumbnail"
                  aspectClass="aspect-video max-h-56"
                />
              </FormField>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Images <span className="text-gray-400 text-xs font-normal">(shown in project detail page)</span>
                </label>

                {/* Gallery grid */}
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                    {galleryImages.map(img => (
                      <div key={img.id} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img src={img.thumb_url || img.image_url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button type="button" onClick={() => removeGalleryImage(img.id)}
                            className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload dropzone */}
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl hover:border-brand-400 hover:bg-gray-50 transition-colors cursor-pointer">
                  <input type="file" accept="image/*" multiple className="sr-only"
                    onChange={e => e.target.files && uploadGallery(Array.from(e.target.files))}
                    disabled={!isEdit || uploadingGallery} />
                  {uploadingGallery ? (
                    <><Loader2 className="h-6 w-6 text-brand-500 animate-spin mb-2" /><span className="text-sm text-brand-600">Uploading…</span></>
                  ) : (
                    <><Plus className="h-6 w-6 text-gray-400 mb-2" /><span className="text-sm text-gray-500">Click to add gallery images</span><span className="text-xs text-gray-400">Select multiple files at once</span></>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* ── Tab: Tags ──────────────────────────────── */}
          {tab === 'Tags' && (
            <div className="space-y-6">
              {(['tech', 'category', 'industry'] as const).map(type => (
                <div key={type}>
                  <label className="block text-sm font-medium text-gray-700 mb-3 capitalize">
                    {type === 'tech' ? 'Tech Stack' : type === 'category' ? 'Project Category' : 'Industry'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tagsByType[type].map((tag: any) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                        style={
                          selectedTags.includes(tag.id)
                            ? { background: tag.color, color: '#fff', borderColor: tag.color }
                            : { background: 'transparent', color: tag.color, borderColor: tag.color + '60' }
                        }>
                        {selectedTags.includes(tag.id) && '✓ '}
                        {tag.name}
                      </button>
                    ))}
                    {tagsByType[type].length === 0 && (
                      <p className="text-sm text-gray-400">No {type} tags yet. Add them in the Tags section.</p>
                    )}
                  </div>
                </div>
              ))}

              {selectedTags.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-widest">Selected ({selectedTags.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tagId => {
                      const tag = (tagsData || []).find((t: any) => t.id === tagId)
                      if (!tag) return null
                      return (
                        <span key={tagId} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ background: tag.color }}>
                          {tag.name}
                          <button type="button" onClick={() => toggleTag(tagId)} className="opacity-70 hover:opacity-100">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-6 py-4">
          <Link to="/admin/projects" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            {isEdit && (
              <a href={`/projects/${projectData?.slug}`} target="_blank" rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:text-brand-700 border border-brand-200 px-4 py-2 rounded-lg hover:bg-brand-50 transition-colors">
                Preview ↗
              </a>
            )}
            <SaveButton loading={saveMutation.isPending} label={isEdit ? 'Update Project' : 'Create Project'} />
          </div>
        </div>
      </form>
    </div>
  )
}