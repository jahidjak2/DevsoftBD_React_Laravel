// src/pages/admin/SiteSettings.tsx
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import {
  PageHeader, Tabs, FormField, FormInput, FormTextarea,
  SaveButton, ImageDropzone,
} from '@/components/admin/AdminShared'

const TAB_GROUPS = [
  { tab: 'General',  group: 'general' },
  { tab: 'Contact',  group: 'contact' },
  { tab: 'Social',   group: 'social'  },
  { tab: 'SEO',      group: 'seo'     },
  { tab: 'Footer',   group: 'footer'  },
]

const SETTINGS_FIELDS: Record<string, { key: string; label: string; type: string; hint?: string }[]> = {
  general: [
    { key: 'site_name',     label: 'Site Name',          type: 'text' },
    { key: 'site_tagline',  label: 'Tagline',            type: 'text' },
    { key: 'logo_light',    label: 'Logo (Light bg)',    type: 'image', hint: 'Used on white/light backgrounds. Recommended: SVG or PNG, max 300px height' },
    { key: 'logo_dark',     label: 'Logo (Dark bg)',     type: 'image', hint: 'Used on dark backgrounds (footer, dark hero)' },
    { key: 'favicon',       label: 'Favicon',            type: 'image', hint: '32×32 or 64×64 PNG' },
    { key: 'primary_color', label: 'Brand Primary Color',type: 'color' },
  ],
  contact: [
    { key: 'phone_primary',    label: 'Primary Phone',    type: 'text' },
    { key: 'phone_secondary',  label: 'Secondary Phone',  type: 'text' },
    { key: 'email_primary',    label: 'Contact Email',    type: 'text' },
    { key: 'address',          label: 'Office Address',   type: 'text' },
    { key: 'working_hours',    label: 'Working Hours',    type: 'text', hint: 'e.g. Sun–Thu: 9:00 AM – 6:00 PM' },
    { key: 'google_maps_embed',label: 'Google Maps Embed URL', type: 'text', hint: 'Paste the src URL from Google Maps embed code' },
  ],
  social: [
    { key: 'facebook_url',  label: 'Facebook URL',  type: 'text' },
    { key: 'twitter_url',   label: 'Twitter/X URL', type: 'text' },
    { key: 'linkedin_url',  label: 'LinkedIn URL',  type: 'text' },
    { key: 'github_url',    label: 'GitHub URL',    type: 'text' },
    { key: 'instagram_url', label: 'Instagram URL', type: 'text' },
    { key: 'youtube_url',   label: 'YouTube URL',   type: 'text' },
  ],
  seo: [
    { key: 'meta_description', label: 'Default Meta Description', type: 'textarea', hint: 'Used when a page has no custom description. 150–160 characters.' },
    { key: 'og_image',         label: 'Default OG Image',         type: 'image',    hint: '1200×630px — shown when pages are shared on social media' },
    { key: 'google_analytics', label: 'Google Analytics ID',      type: 'text',     hint: 'e.g. G-XXXXXXXXXX' },
  ],
  footer: [
    { key: 'footer_copyright', label: 'Copyright Text',   type: 'text' },
    { key: 'footer_about_text',label: 'Footer About Text',type: 'textarea' },
  ],
}

export default function SiteSettings() {
  const [activeTab, setActiveTab] = useState('General')
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.get('/settings').then(r => r.data.data),
  })

  // Flatten all settings into key→value map
  const flatSettings = settingsData
    ? Object.values(settingsData).reduce((acc: any, group: any) => {
        Object.values(group as any).forEach((s: any) => { acc[s.key] = s.value || '' })
        return acc
      }, {})
    : {}

  const { register, handleSubmit, setValue, watch, reset } = useForm({ defaultValues: flatSettings })

  useEffect(() => { if (flatSettings && Object.keys(flatSettings).length > 0) reset(flatSettings) }, [JSON.stringify(flatSettings)])

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, string>) => {
      const settings = Object.entries(values).map(([key, value]) => ({ key, value }))
      return adminApi.post('/settings', { settings })
    },
    onSuccess: () => {
      toast.success('Settings saved successfully.')
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      qc.invalidateQueries({ queryKey: ['homepage'] })
    },
    onError: () => toast.error('Failed to save settings.'),
  })

  async function uploadImage(key: string, file: File) {
    setUploadingKey(key)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await adminApi.post(`/settings/${key}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setValue(key, res.data.url)
      toast.success('Image uploaded.')
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
    } catch {
      toast.error('Image upload failed.')
    } finally {
      setUploadingKey(null)
    }
  }

  const currentGroup = TAB_GROUPS.find(t => t.tab === activeTab)?.group || 'general'
  const fields = SETTINGS_FIELDS[currentGroup] || []

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Site Settings"
        subtitle="Manage your global website configuration — changes apply instantly."
      />

      <form onSubmit={handleSubmit(d => saveMutation.mutate(d as any))} className="space-y-6">
        <Tabs
          tabs={TAB_GROUPS.map(t => t.tab)}
          active={activeTab}
          onChange={setActiveTab}
        />

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            fields.map(field => (
              <FormField key={field.key} label={field.label} hint={field.hint}>
                {field.type === 'image' ? (
                  <div className="space-y-2">
                    <ImageDropzone
                      currentUrl={watch(field.key)}
                      onUpload={file => uploadImage(field.key, file)}
                      loading={uploadingKey === field.key}
                      label={`Upload ${field.label}`}
                      aspectClass={field.key === 'favicon' ? 'h-24 w-24' : field.key.includes('logo') ? 'h-28 w-64' : 'aspect-video max-h-40'}
                    />
                    {watch(field.key) && (
                      <p className="text-xs text-gray-400 break-all">{watch(field.key)}</p>
                    )}
                  </div>
                ) : field.type === 'textarea' ? (
                  <FormTextarea {...register(field.key)} rows={3} placeholder={`Enter ${field.label.toLowerCase()}`} />
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input type="color" {...register(field.key)} className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer p-1" />
                    <FormInput {...register(field.key)} placeholder="#2563EB" className="flex-1" />
                  </div>
                ) : (
                  <FormInput {...register(field.key)} placeholder={`Enter ${field.label.toLowerCase()}`} />
                )}
              </FormField>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <SaveButton loading={saveMutation.isPending} label="Save Settings" />
        </div>
      </form>
    </div>
  )
}