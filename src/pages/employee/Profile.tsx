// src/pages/employee/Profile.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { employeeApi } from '@/lib/api'
import { Camera, Lock, Loader2, Save, Github, Linkedin, Phone, MapPin, BookOpen } from 'lucide-react'
import { useEmployeeStore } from '@/store/employeeStore'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  phone:        z.string().optional(),
  address:      z.string().optional(),
  bio:          z.string().max(500, 'Max 500 characters').optional(),
  linkedin_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  github_url:   z.string().url('Enter a valid URL').optional().or(z.literal('')),
  skills:       z.string().optional(),
})

const passwordSchema = z.object({
  current_password:      z.string().min(1, 'Required'),
  new_password:          z.string().min(8, 'Minimum 8 characters'),
  new_password_confirmation: z.string(),
}).refine(d => d.new_password === d.new_password_confirmation, {
  message: 'Passwords do not match',
  path: ['new_password_confirmation'],
})

type ProfileForm  = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function EmployeeProfile() {
  const [tab, setTab]           = useState<'info' | 'password'>('info')
  const [avatarLoading, setAvatarLoading] = useState(false)
  const { user, setAuth, token }         = useEmployeeStore()
  const qc = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['employee-profile'],
    queryFn: () => employeeApi.get('/profile').then(r => r.data.data),
  })

  const { register: regProfile, handleSubmit: submitProfile, formState: { errors: pErr } } =
    useForm<ProfileForm>({
      resolver: zodResolver(profileSchema),
      values: profile ? {
        phone:        profile.phone        || '',
        address:      profile.address      || '',
        bio:          profile.bio          || '',
        linkedin_url: profile.linkedin_url || '',
        github_url:   profile.github_url   || '',
        skills:       (profile.skills || []).join(', '),
      } : undefined,
    })

  const { register: regPw, handleSubmit: submitPw, reset: resetPw, formState: { errors: pwErr } } =
    useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const updateMutation = useMutation({
    mutationFn: (d: any) => {
      const payload = {
        ...d,
        skills: d.skills ? d.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      }
      return employeeApi.put('/profile', payload)
    },
    onSuccess: () => {
      toast.success('Profile updated.')
      qc.invalidateQueries({ queryKey: ['employee-profile'] })
    },
    onError: () => toast.error('Update failed.'),
  })

  const passwordMutation = useMutation({
    mutationFn: (d: PasswordForm) => employeeApi.put('/profile/password', d),
    onSuccess: () => {
      toast.success('Password changed. You may need to log in again on other devices.')
      resetPw()
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to change password.'),
  })

  async function handleAvatarUpload(file: File) {
    setAvatarLoading(true)
    const form = new FormData()
    form.append('image', file)
    try {
      const res = await employeeApi.post('/profile/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Avatar updated.')
      qc.invalidateQueries({ queryKey: ['employee-profile'] })
      // Update store user avatar
      if (user && token) {
        setAuth(token, { ...user, avatar: res.data.avatar_url })
      }
    } catch {
      toast.error('Upload failed.')
    } finally {
      setAvatarLoading(false)
    }
  }

  if (isLoading) return (
    <div className="max-w-2xl space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Update your personal information and account settings.</p>
      </div>

      {/* Avatar + basic info card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-100 flex items-center justify-center">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-brand-600 font-bold text-2xl">
                    {profile?.name?.substring(0, 2).toUpperCase()}
                  </span>
              }
            </div>
            <label className={cn(
              'absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-brand-600 hover:bg-brand-700 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm',
              avatarLoading && 'cursor-not-allowed opacity-60'
            )}>
              {avatarLoading
                ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                : <Camera className="h-3.5 w-3.5 text-white" />
              }
              <input type="file" accept="image/*" className="sr-only"
                disabled={avatarLoading}
                onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
            </label>
          </div>

          {/* Name + meta */}
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">{profile?.name}</h2>
            <p className="text-sm text-brand-600 font-medium mt-0.5">{profile?.designation}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {profile?.department && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{profile.department}</span>
              )}
              {profile?.employee_code && (
                <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{profile.employee_code}</span>
              )}
              {profile?.employment_type && (
                <span className="text-xs text-gray-500 capitalize">{profile.employment_type.replace('_', ' ')}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'info',     label: 'Personal Info' },
          { key: 'password', label: 'Change Password' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Personal info form */}
      {tab === 'info' && (
        <form onSubmit={submitProfile(d => updateMutation.mutate(d))}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> Phone</span>
              </label>
              <input {...regProfile('phone')} placeholder="+8801XXXXXXXXX"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400" /> Address</span>
              </label>
              <input {...regProfile('address')} placeholder="Your address"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-gray-400" /> Bio</span>
            </label>
            <textarea {...regProfile('bio')} rows={3}
              placeholder="A short bio about yourself…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-colors resize-none" />
            {pErr.bio && <p className="text-xs text-red-500 mt-1">{pErr.bio.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills</label>
            <input {...regProfile('skills')} placeholder="Laravel, React, MySQL — comma separated"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-colors" />
            <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Linkedin className="h-3.5 w-3.5 text-blue-500" /> LinkedIn URL</span>
              </label>
              <input {...regProfile('linkedin_url')} placeholder="https://linkedin.com/in/…"
                className={cn('w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-colors',
                  pErr.linkedin_url ? 'border-red-300' : 'border-gray-200')} />
              {pErr.linkedin_url && <p className="text-xs text-red-500 mt-1">{pErr.linkedin_url.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Github className="h-3.5 w-3.5 text-gray-700" /> GitHub URL</span>
              </label>
              <input {...regProfile('github_url')} placeholder="https://github.com/…"
                className={cn('w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-colors',
                  pErr.github_url ? 'border-red-300' : 'border-gray-200')} />
              {pErr.github_url && <p className="text-xs text-red-500 mt-1">{pErr.github_url.message}</p>}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={updateMutation.isPending}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Change password form */}
      {tab === 'password' && (
        <form onSubmit={submitPw(d => passwordMutation.mutate(d))}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Lock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              After changing your password, you will be signed out on all other devices.
            </p>
          </div>

          {[
            { name: 'current_password'      as const, label: 'Current Password',      err: pwErr.current_password },
            { name: 'new_password'          as const, label: 'New Password',          err: pwErr.new_password },
            { name: 'new_password_confirmation' as const, label: 'Confirm New Password', err: pwErr.new_password_confirmation },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
              <input {...regPw(field.name)} type="password" placeholder="••••••••"
                className={cn('w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-colors',
                  field.err ? 'border-red-300 bg-red-50' : 'border-gray-200')} />
              {field.err && <p className="text-xs text-red-500 mt-1">{field.err.message}</p>}
            </div>
          ))}

          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={passwordMutation.isPending}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              {passwordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {passwordMutation.isPending ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}