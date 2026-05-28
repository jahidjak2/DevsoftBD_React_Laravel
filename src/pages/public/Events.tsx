
// ─────────────────────────────────────────────────────────────
// src/pages/public/Events.tsx
// ─────────────────────────────────────────────────────────────
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/lib/api'
import { Calendar, MapPin, Video, Users } from 'lucide-react'
 
export function Events() {
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => publicApi.get('/events').then(r => r.data.data),
  })
 
  return (
    <>
      <Helmet><title>Events — DevSoft BD</title></Helmet>
      <section className="bg-navy-800 py-20">
        <div className="container text-center">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">Upcoming</p>
          <h1 className="section-headline text-white mb-4">Events & Webinars</h1>
        </div>
      </section>
      <section className="section">
        <div className="container max-w-4xl">
          {isLoading ? (
            <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}</div>
          ) : (data as any[] || []).length === 0 ? (
            <EmptyState title="No upcoming events" subtitle="Check back soon for webinars and workshops." />
          ) : (
            <div className="space-y-6">
              {(data as any[]).map((event: any) => (
                <div key={event.id} className="card p-6 flex gap-6">
                  {event.banner_url && (
                    <img src={event.banner_url} alt={event.title} className="w-40 h-28 object-cover rounded-xl flex-shrink-0 hidden md:block" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge bg-brand-50 text-brand-600 text-xs">{event.event_type}</span>
                      <span className={cn('badge text-xs', event.status === 'upcoming' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600')}>{event.status}</span>
                    </div>
                    <h3 className="font-display font-semibold text-gray-900 mb-3">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-brand-500" />{event.starts_at} {event.starts_at_time && `at ${event.starts_at_time}`}</span>
                      {event.is_online ? <span className="flex items-center gap-1.5"><Video className="h-4 w-4 text-brand-500" />Online</span>
                        : event.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-500" />{event.location}</span>}
                    </div>
                    {event.registration_url && (
                      <a href={event.registration_url} target="_blank" rel="noopener noreferrer"
                        className="btn-primary text-sm mt-4 inline-flex">Register Now</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
export default Events
 