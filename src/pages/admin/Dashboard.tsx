// src/pages/admin/Dashboard.tsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { FolderKanban, MessageSquare, UserCheck, Briefcase, ListTodo, Newspaper, ArrowRight, Clock, AlertCircle } from 'lucide-react'
import { StatCard, StatusBadge, PriorityBadge } from '@/components/admin/AdminShared'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

function useDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.get('/dashboard/stats').then(r => r.data),
    refetchInterval: 30000, // refresh every 30s
  })
}

const STAT_CONFIG = [
  { key: 'Published projects',     icon: FolderKanban, color: 'brand'  },
  { key: 'New inquiries (7d)',      icon: MessageSquare,color: 'amber'  },
  { key: 'Active employees',        icon: UserCheck,    color: 'green'  },
  { key: 'Active projects',         icon: Briefcase,    color: 'purple' },
  { key: 'Open tasks',              icon: ListTodo,     color: 'red'    },
  { key: 'Blog posts published',    icon: Newspaper,    color: 'brand'  },
]

export default function Dashboard() {
  const { data, isLoading } = useDashboardStats()
  const user = useAuthStore(s => s.user)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {greeting}, {user?.name?.split(' ')[0] || 'Admin'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your platform today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-28 animate-pulse">
              <div className="w-8 h-8 bg-gray-100 rounded-xl mb-3" />
              <div className="h-6 bg-gray-100 rounded w-12 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
          ))
        ) : (
          data?.stats?.map((stat: any) => {
            const config = STAT_CONFIG.find(c => c.key === stat.label) || STAT_CONFIG[0]
            return (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={config.icon}
                color={config.color}
              />
            )
          })
        )}
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent inquiries */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-semibold text-gray-900">Recent Inquiries</h2>
            <Link to="/admin/inquiries" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-3.5 animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-gray-100 rounded w-32 mb-1.5" />
                    <div className="h-3 bg-gray-100 rounded w-48" />
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full w-14" />
                </div>
              ))
            ) : data?.recent_inquiries?.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No inquiries yet.</div>
            ) : (
              data?.recent_inquiries?.map((inq: any) => (
                <Link key={inq.id} to="/admin/inquiries"
                  className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold flex-shrink-0">
                    {inq.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{inq.name}</p>
                    <p className="text-xs text-gray-400 truncate">{inq.subject || inq.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={inq.status} />
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Pending tasks */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-semibold text-gray-900">Upcoming Tasks</h2>
            <Link to="/admin/tasks" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Board <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 animate-pulse">
                  <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            ) : data?.pending_tasks?.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No upcoming tasks.</div>
            ) : (
              data?.pending_tasks?.map((task: any) => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date()
                return (
                  <div key={task.id} className="px-5 py-3.5">
                    <div className="flex items-start gap-2 mb-1.5">
                      {isOverdue && <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />}
                      <p className={cn('text-sm font-medium line-clamp-1', isOverdue ? 'text-red-700' : 'text-gray-800')}>
                        {task.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      {task.due_date && (
                        <span className={cn('text-xs flex items-center gap-1', isOverdue ? 'text-red-500' : 'text-gray-400')}>
                          <Clock className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent projects */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900">Recent Projects</h2>
          <Link to="/admin/projects" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="aspect-video bg-gray-100 rounded-xl" />
                <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                <div className="h-5 bg-gray-100 rounded-full w-20" />
              </div>
            ))
          ) : (
            data?.recent_projects?.map((project: any) => (
              <Link key={project.id} to={`/admin/projects/${project.id}/edit`}
                className="group cursor-pointer">
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-2">
                  {project.thumbnail?.url ? (
                    <img src={project.thumbnail.url} alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                      <FolderKanban className="h-6 w-6 text-brand-400" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors mb-1">
                  {project.title}
                </p>
                <StatusBadge status={project.status} />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add Project',     href: '/admin/projects/new',  icon: FolderKanban, color: 'bg-brand-50 text-brand-600  border-brand-100' },
          { label: 'Add Employee',    href: '/admin/employees',     icon: UserCheck,    color: 'bg-green-50 text-green-600 border-green-100' },
          { label: 'View Inquiries',  href: '/admin/inquiries',     icon: MessageSquare,color: 'bg-amber-50 text-amber-600  border-amber-100' },
          { label: 'Site Settings',   href: '/admin/settings',      icon: null,         color: 'bg-gray-50 text-gray-600   border-gray-100' },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={label} to={href}
            className={cn('flex items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-sm', color)}>
            {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{label}</span>
            <ArrowRight className="h-4 w-4 ml-auto opacity-50" />
          </Link>
        ))}
      </div>
    </div>
  )
}