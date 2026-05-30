// src/pages/admin/EventsManager.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api'
import { Plus, X, CalendarDays, MapPin, Video } from 'lucide-react'
import {
  PageHeader, FormField, FormInput, FormTextarea, FormSelect,
  SaveButton, ConfirmDialog, AdminTable, RowActions, StatusBadge,
} from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'

const EVENT_TYPES   = ['webinar', 'conference', 'workshop', 'meetup', 'online']
const EVENT_STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled']

export default function EventsManager() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => adminApi.get('/events').then(r => r.data),
  })

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: '', description: '', event_type: 'webinar',
      starts_at: '', ends_at: '', timezone: 'Asia/Dhaka',
      location: '', venue_name: '', is_online: true,
      meeting_link: '', registration_url: '', max_attendees: '',
      status: 'upcoming', is_featured: false,
    },
  })

  const saveMutation = useMutation({
    mutationFn: (d: any) =>
      editing ? adminApi.put(`/events/${editing.id}`, d) : adminApi.post('/events', d),
    onSuccess: () => {
      toast.success(editing ? 'Event updated.' : 'Event created.')
      qc.invalidateQueries({ queryKey: ['admin-events'] })
      reset(); setShowForm(false); setEditing(null)
    },
    onError: () => toast.error('Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.delete(`/events/${id}`),
    onSuccess: () => { toast.success('Event deleted.'); qc.invalidateQueries({ queryKey: ['admin-events'] }); setDeleteId(null) },
  })

  function startEdit(ev: any) {
    setEditing(ev)
    reset({
      title: ev.title, description: ev.description || '',
      event_type: ev.event_type || 'webinar',
      starts_at: ev.starts_at ? ev.starts_at.substring(0, 16) : '',
      ends_at:   ev.ends_at   ? ev.ends_at.substring(0, 16)   : '',
      timezone: ev.timezone || 'Asia/Dhaka',
      location: ev.location || '', venue_name: ev.venue_name || '',
      is_online: ev.is_online ?? true,
      meeting_link: ev.meeting_link || '', registration_url: ev.registration_url || '',
      max_attendees: ev.max_attendees || '',
      status: ev.status || 'upcoming', is_featured: ev.is_featured ?? false,
    })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); reset() }

  const isOnline = watch('is_online')
  const events = data?.data?.data || data?.data || []

  const statusColor: Record<string, string> = {
    upcoming:  'bg-blue-100 text-blue-700',
    ongoing:   'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  }

  return (
    <div className="max-w-7xl space-y-6">
      <PageHeader
        title="Events"
        subtitle="Manage webinars, workshops, and conferences"
        action={
          <button onClick={() => { setEditing(null); reset(); setShowForm(true) }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus className="h-4 w-4" /> New Event
          </button>
        }
      />

      <AdminTable
        headers={['Event', 'Type', 'Date', 'Location', 'Status', 'Actions']}
        loading={isLoading}
        emptyMessage="No events yet. Create your first.">
        {events.map((ev: any) => (
          <tr key={ev.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{ev.title}</p>
                  {ev.is_featured && <span className="text-xs text-amber-600 font-medium">★ Featured</span>}
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full capitalize">{ev.event_type}</span>
            </td>
            <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">
              {ev.starts_at ? new Date(ev.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {ev.is_online
                  ? <><Video className="h-3.5 w-3.5 text-brand-500" /> Online</>
                  : <><MapPin className="h-3.5 w-3.5 text-gray-400" /> {ev.location || '—'}</>
                }
              </div>
            </td>
            <td className="px-5 py-4">
              <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', statusColor[ev.status] || 'bg-gray-100 text-gray-600')}>
                {ev.status}
              </span>
            </td>
            <td className="px-5 py-4">
              <RowActions onEdit={() => startEdit(ev)} onDelete={() => setDeleteId(ev.id)} />
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Form drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto bg-white h-full w-full max-w-xl flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-semibold text-gray-900">{editing ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
                <FormField label="Event Title" required>
                  <FormInput {...register('title')} placeholder="Laravel Workshop 2025" />
                </FormField>
                <FormField label="Description">
                  <FormTextarea {...register('description')} rows={3} placeholder="What will attendees learn or experience?" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Event Type">
                    <FormSelect {...register('event_type')}>
                      {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </FormSelect>
                  </FormField>
                  <FormField label="Status">
                    <FormSelect {...register('status')}>
                      {EVENT_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </FormSelect>
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Start Date & Time" required>
                    <FormInput {...register('starts_at')} type="datetime-local" />
                  </FormField>
                  <FormField label="End Date & Time">
                    <FormInput {...register('ends_at')} type="datetime-local" />
                  </FormField>
                </div>
                <FormField label="Timezone">
                  <FormSelect {...register('timezone')}>
                    {['Asia/Dhaka', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'Asia/Singapore'].map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </FormSelect>
                </FormField>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('is_online')} className="w-4 h-4 rounded accent-brand-600" />
                  <span className="text-sm text-gray-700">Online event</span>
                </label>
                {isOnline ? (
                  <FormField label="Meeting Link">
                    <FormInput {...register('meeting_link')} placeholder="https://meet.google.com/…" />
                  </FormField>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Venue Name">
                      <FormInput {...register('venue_name')} placeholder="Conference Center" />
                    </FormField>
                    <FormField label="Location">
                      <FormInput {...register('location')} placeholder="Dhaka, Bangladesh" />
                    </FormField>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Registration URL">
                    <FormInput {...register('registration_url')} placeholder="https://forms.gle/…" />
                  </FormField>
                  <FormField label="Max Attendees">
                    <FormInput {...register('max_attendees')} type="number" placeholder="100" />
                  </FormField>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded accent-brand-600" />
                  <span className="text-sm text-gray-700">Featured event</span>
                </label>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeForm} className="flex-1 px-4 py-2.5 border border-gray-200 text-sm rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                  <SaveButton loading={saveMutation.isPending} label={editing ? 'Update Event' : 'Create Event'} />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}