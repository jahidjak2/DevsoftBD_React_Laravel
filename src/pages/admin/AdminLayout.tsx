// src/pages/admin/AdminLayout.tsx
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Globe, Layers, FolderKanban, Users2, Star,
  Building2, HelpCircle, Newspaper, CalendarDays, MessageSquare,
  Image, UserCheck, Briefcase, ListTodo, CalendarOff, Settings,
  ChevronRight, Menu, X, LogOut, Bell, Search, Code2, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'

// ── Sidebar nav structure ─────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',      href: '/admin',           icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Website Content',
    items: [
      { label: 'Hero Section',     href: '/admin/hero',            icon: Globe },
      { label: 'Services',         href: '/admin/services',        icon: Layers },
      { label: 'Industries',       href: '/admin/industries',      icon: Building2 },
      { label: 'Why Choose Us',    href: '/admin/why-choose-us',   icon: HelpCircle },
      { label: 'Trusted Companies',href: '/admin/trusted-companies', icon: Star },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      { label: 'Projects',         href: '/admin/projects',        icon: FolderKanban },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Team Members',     href: '/admin/team',            icon: Users2 },
      { label: 'Testimonials',     href: '/admin/testimonials',    icon: Star },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Blog Posts',       href: '/admin/blog',            icon: Newspaper },
      { label: 'Events',           href: '/admin/events',          icon: CalendarDays },
    ],
  },
  {
    label: 'Communications',
    items: [
      { label: 'Inquiries',        href: '/admin/inquiries',       icon: MessageSquare },
      { label: 'Media Library',    href: '/admin/media',           icon: Image },
    ],
  },
  {
    label: 'HR & Internal',
    items: [
      { label: 'Employees',        href: '/admin/employees',       icon: UserCheck },
      { label: 'Departments',      href: '/admin/departments',     icon: Building2 },
      { label: 'Internal Projects',href: '/admin/internal-projects', icon: Briefcase },
      { label: 'Task Board',       href: '/admin/tasks',           icon: ListTodo },
      { label: 'Leave Approvals',  href: '/admin/leaves',          icon: CalendarOff },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Site Settings',    href: '/admin/settings',        icon: Settings },
    ],
  },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogout() {
    try { await authApi.post('/admin/logout') } catch {}
    logout()
    toast.success('Logged out.')
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-[#0f172a] border-r border-white/5 transition-all duration-300 flex-shrink-0',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Brand */}
        <div className={cn('flex items-center h-16 border-b border-white/5 flex-shrink-0 px-4 gap-3')}>
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-display font-bold text-white text-sm truncate">DevSoft Admin</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0">
            <ChevronRight className={cn('h-4 w-4 transition-transform', sidebarOpen && 'rotate-180')} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-4">
              {sidebarOpen && (
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-1">
                  {group.label}
                </p>
              )}
              {group.items.map(item => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                    isActive
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  )}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/5 p-3">
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <button onClick={handleLogout}
                  className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                  title="Logout">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#0f172a] flex flex-col h-full">
            <div className="flex items-center justify-between h-16 border-b border-white/5 px-4">
              <span className="font-display font-bold text-white text-sm">DevSoft Admin</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-2">
              {NAV_GROUPS.map(group => (
                <div key={group.label} className="mb-4">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-1">
                    {group.label}
                  </p>
                  {group.items.map(item => (
                    <NavLink key={item.href} to={item.href}
                      end={'end' in item ? item.end : false}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) => cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                        isActive ? 'bg-brand-600/20 text-brand-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      )}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setMobileSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 flex-1 max-w-md lg:ml-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input placeholder="Quick search…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-brand-400 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
              <Globe className="h-3.5 w-3.5" /> View Site
            </a>
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