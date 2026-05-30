// src/pages/employee/Dashboard.tsx
import { useQuery } from '@tanstack/react-query'
import { employeeApi } from '@/lib/api'
import { Link } from 'react-router-dom'
import {
  ListTodo, Briefcase, CalendarOff, AlertTriangle,
  ArrowRight, Clock, CheckCircle, Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEmployeeStore } from '@/store/employeeStore'

function useDashboard() {
  return useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: () => employeeApi.get('/dashboard').then(r => r.data),
    refetchInterval: 60000,
  })
}

const PRIORITY_COLOR: Record<string, string> = {
  low:      'bg-gray-100 text-gray-500',
  medium:   'bg-blue-100 text-blue-600',
  high:     'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-700',
}

const STATUS_ICON: Record<string, React.ElementType> = {
  todo:        Circle,
  in_progress: Clock,
  in_review:   AlertTriangle,
  done:        CheckCircle,
}

export default function EmployeeDashboard() {
  const { data, isLoading } = useDashboard()
  const user = useEmployeeStore((s: { user: any }) => s.user)

  return (
    <div className="max-w-5xl space-y-7">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {data?.greeting || `Hello, ${user?.name?.split(' ')[0] || 'there'} 👋`}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's an overview of your work today.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
          : [
              {
                label: 'Total Tasks',
                value: data?.task_stats?.total ?? 0,
                icon: ListTodo,
                color: 'bg-blue-50 text-blue-600',
                href: '/employee/tasks',
              },
              {
                label: 'In Progress',
                value: data?.task_stats?.in_progress ?? 0,
                icon: Clock,
                color: 'bg-amber-50 text-amber-600',
                href: '/employee/tasks',
              },
              {
                label: 'Overdue',
                value: data?.task_stats?.overdue ?? 0,
                icon: AlertTriangle,
                color: 'bg-red-50 text-red-600',
                href: '/employee/tasks',
              },
              {
                label: 'Active Projects',
                value: data?.active_projects ?? 0,
                icon: Briefcase,
                color: 'bg-green-50 text-green-600',
                href: '/employee/projects',
              },
            ].map(stat => (
              <Link key={stat.label} to={stat.href}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="font-display text-2xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </Link>
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming tasks */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-semibold text-gray-900">Upcoming Tasks</h2>
            <Link to="/employee/tasks"
              className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-100 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              : !data?.recent_tasks?.length
                ? (
                  <div className="py-12 text-center text-sm text-gray-400">
                    <CheckCircle className="h-8 w-8 text-green-200 mx-auto mb-2" />
                    No upcoming tasks — you're all clear!
                  </div>
                )
                : data.recent_tasks.map((task: any) => {
                  const StatusIcon = STATUS_ICON[task.status] || Circle
                  const isOverdue  = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
                  return (
                    <Link key={task.id} to="/employee/tasks"
                      className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <StatusIcon className={cn('h-4 w-4 flex-shrink-0',
                        task.status === 'done' ? 'text-green-500' :
                        task.status === 'in_progress' ? 'text-blue-500' : 'text-gray-300'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {task.project_name && <span>{task.project_name} · </span>}
                          {task.milestone && <span>{task.milestone}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', PRIORITY_COLOR[task.priority])}>
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className={cn('text-xs whitespace-nowrap', isOverdue ? 'text-red-500 font-semibold' : 'text-gray-400')}>
                            {isOverdue ? '⚠ ' : ''}
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })
            }
          </div>
        </div>

        {/* Leave balance */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-display font-semibold text-gray-900">Leave Balance</h2>
            <Link to="/employee/leave"
              className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium">
              Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)
              : !data?.leave_balance?.length
                ? <p className="text-sm text-gray-400 text-center py-6">No leave data.</p>
                : data.leave_balance.map((lb: any) => {
                  const pct = lb.total_days > 0 ? Math.max(0, Math.round((lb.remaining / lb.total_days) * 100)) : 0
                  return (
                    <div key={lb.type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-700 font-medium">{lb.type}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {lb.remaining}
                          <span className="text-xs text-gray-400 font-normal"> / {lb.total_days}d</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444' }}
                        />
                      </div>
                    </div>
                  )
                })
            }

            {data?.pending_leave_requests > 0 && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                {data.pending_leave_requests} pending request{data.pending_leave_requests !== 1 ? 's' : ''}
              </div>
            )}

            <Link to="/employee/leave"
              className="block w-full text-center text-sm text-brand-600 hover:text-brand-700 font-medium border border-brand-200 hover:bg-brand-50 py-2 rounded-xl transition-colors mt-2">
              + Request Leave
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}