// src/pages/employee/EmployeeLayout.tsx
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, User, Briefcase, ListTodo,
  CalendarOff, LogOut, Menu, X, UserCheck, Bell, Code2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEmployeeStore } from '@/store/employeeStore'
import { employeeApi } from '@/lib/api'
import { toast } from 'sonner'

const NAV = [
  { label: 'Dashboard',      href: '/employee',          icon: LayoutDashboard, end: true },
  { label: 'My Profile',     href: '/employee/profile',  icon: User             },
  { label: 'My Projects',    href: '/employee/projects', icon: Briefcase        },
  { label: 'My Tasks',       href: '/employee/tasks',    icon: ListTodo         },
  { label: 'Leave Requests', href: '/employee/leave',    icon: CalendarOff      },
]

export default function EmployeeLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout }            = useEmployeeStore()
  const navigate                    = useNavigate()

  async function handleLogout() {
    try { await employeeApi.post('/logout') } catch {}
    logout()
    toast.success('Logged out successfully.')
    navigate('/employee/login', { replace: true })
  }

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 h-16 px-5 border-b border-white/5 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <UserCheck className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold leading-tight truncate">Employee Portal</p>
          <p className="text-slate-500 text-[10px] leading-tight">DevSoft BD</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        {NAV.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-blue-600/20 text-blue-400 shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            )}>
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/5 p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
            {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.designation || user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-colors">
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 border-r border-white/5 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 bg-slate-900 flex flex-col h-full">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 lg:ml-0">
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                {user?.name?.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-400 leading-tight">{user?.employee_code || user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}