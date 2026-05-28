// src/components/layout/MainHeader.tsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, Code2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SiteSettings } from '@/types'

const NAV = [
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Web Development',    href: '/services/web-design-development' },
      { label: 'Mobile Apps',        href: '/services/mobile-app-development' },
      { label: 'AI & ML',            href: '/services/ml-ai-development' },
      { label: 'E-Commerce',         href: '/services/ecommerce-development' },
      { label: 'ERP Systems',        href: '/services/erp-development' },
      { label: 'Cloud Solutions',    href: '/services/cloud-solutions' },
      { label: 'Cyber Security',     href: '/services/cyber-security' },
      { label: 'QA & Testing',       href: '/services/qa-testing-automation' },
    ],
  },
  { label: 'Projects', href: '/projects' },
  { label: 'About',    href: '/about' },
  { label: 'Blog',     href: '/blog' },
  { label: 'Events',   href: '/events' },
  { label: 'Contact',  href: '/contact' },
]

interface Props { settings?: SiteSettings }

export default function MainHeader({ settings }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false); setActiveDropdown(null) }, [location.pathname])

  const logo = settings?.logo_light
  const siteName = settings?.site_name || 'DevSoft BD'

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all duration-300',
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
        : 'bg-white border-b border-gray-100'
    )}>
      <div className="container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            {logo
              ? <img src={logo} alt={siteName} className="h-10 w-auto" />
              : (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
                    <Code2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-display font-800 text-xl text-gray-900">{siteName}</span>
                </div>
              )
            }
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation">
            {NAV.map((item) => (
              <div key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}>

                {item.children ? (
                  <button className={cn(
                    'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeDropdown === item.label
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'
                  )}>
                    {item.label}
                    <ChevronDown className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      activeDropdown === item.label && 'rotate-180'
                    )} />
                  </button>
                ) : (
                  <Link to={item.href} className={cn(
                    'flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'
                  )}>
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-card-hover border border-gray-100 py-2 animate-fade-in">
                    {item.children.map((child) => (
                      <Link key={child.label} to={child.href}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                        {child.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                      <Link to={item.href}
                        className="flex items-center gap-2 px-2 py-2 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
                        View all services <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA button */}
          <div className="hidden lg:block">
            <Link to="/contact" className="btn-primary text-sm">
              Schedule a Call
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <nav className="container py-4 space-y-1">
            {NAV.map((item) => (
              <div key={item.label}>
                <Link to={item.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    location.pathname.startsWith(item.href)
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'
                  )}>
                  {item.label}
                  {item.children && <ChevronDown className="h-4 w-4 opacity-50" />}
                </Link>
                {item.children && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {item.children.map((child) => (
                      <Link key={child.label} to={child.href}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:text-brand-600 transition-colors rounded-lg">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 px-4">
              <Link to="/contact" className="btn-primary w-full justify-center text-sm">
                Schedule a Call
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}