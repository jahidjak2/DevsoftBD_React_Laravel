// src/components/layout/EnhancedFooter.tsx
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Github, Instagram, Youtube, Code2, ArrowUpRight } from 'lucide-react'
import type { SiteSettings } from '@/types'

const QUICK_LINKS = [
  { label: 'About Us',    href: '/about' },
  { label: 'Our Services',href: '/services' },
  { label: 'Our Team',    href: '/team' },
  { label: 'Projects',    href: '/projects' },
  { label: 'Contact Us',  href: '/contact' },
  { label: 'Blog',        href: '/blog' },
  { label: 'Events',      href: '/events' },
]

const SERVICES = [
  { label: 'Web Development',  href: '/services/web-design-development' },
  { label: 'Mobile Apps',      href: '/services/mobile-app-development' },
  { label: 'AI & ML',          href: '/services/ml-ai-development' },
  { label: 'ERP Systems',      href: '/services/erp-development' },
  { label: 'Cloud Solutions',  href: '/services/cloud-solutions' },
  { label: 'Cyber Security',   href: '/services/cyber-security' },
]

const SOCIAL: { key: keyof SiteSettings; Icon: React.ElementType; label: string }[] = [
  { key: 'facebook_url',  Icon: Facebook,  label: 'Facebook' },
  { key: 'twitter_url',   Icon: Twitter,   label: 'Twitter' },
  { key: 'linkedin_url',  Icon: Linkedin,  label: 'LinkedIn' },
  { key: 'github_url',    Icon: Github,    label: 'GitHub' },
  { key: 'instagram_url', Icon: Instagram, label: 'Instagram' },
  { key: 'youtube_url',   Icon: Youtube,   label: 'YouTube' },
]

interface Props { settings?: SiteSettings }

export default function EnhancedFooter({ settings }: Props) {
  const year = new Date().getFullYear()
  const siteName = settings?.site_name || 'DevSoft BD'

  return (
    <footer className="bg-[#0a0f1e] text-gray-400">
      {/* Main footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand column */}
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3">
              {settings?.logo_dark
                ? <img src={settings.logo_dark} alt={siteName} className="h-10 w-auto" />
                : (
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
                      <Code2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-display font-bold text-xl text-white">{siteName}</span>
                  </div>
                )
              }
            </Link>

            <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
              {settings?.footer_about_text || 'Professional software development company delivering cutting-edge solutions for businesses worldwide.'}
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              {settings?.phone_primary && (
                <a href={`tel:${settings.phone_primary}`}
                  className="flex items-center gap-3 text-sm text-gray-500 hover:text-blue-400 transition-colors">
                  <Phone className="h-4 w-4 text-coral flex-shrink-0" />
                  {settings.phone_primary}
                </a>
              )}
              {settings?.phone_secondary && (
                <a href={`tel:${settings.phone_secondary}`}
                  className="flex items-center gap-3 text-sm text-gray-500 hover:text-blue-400 transition-colors">
                  <Phone className="h-4 w-4 text-coral flex-shrink-0" />
                  {settings.phone_secondary}
                </a>
              )}
              {settings?.email_primary && (
                <a href={`mailto:${settings.email_primary}`}
                  className="flex items-center gap-3 text-sm text-gray-500 hover:text-blue-400 transition-colors">
                  <Mail className="h-4 w-4 text-coral flex-shrink-0" />
                  {settings.email_primary}
                </a>
              )}
              {settings?.address && (
                <span className="flex items-start gap-3 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 text-coral flex-shrink-0 mt-0.5" />
                  {settings.address}
                </span>
              )}
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 flex-wrap">
              {SOCIAL.filter(s => settings?.[s.key]).map(({ key, Icon, label }) => (
                <a key={key}
                  href={settings![key] as string}
                  target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-600 flex items-center justify-center text-gray-500 hover:text-white transition-all duration-200">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-6 text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-white mb-6 text-sm uppercase tracking-widest">Services</h4>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s.label}>
                  <Link to={s.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Map */}
          <div>
            <h4 className="font-display font-semibold text-white mb-6 text-sm uppercase tracking-widest">Find Us</h4>
            <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-white/5">
              {settings?.google_maps_embed ? (
                <iframe
                  src={settings.google_maps_embed}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="DevSoft BD office location"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                  <MapPin className="h-6 w-6 opacity-30" />
                </div>
              )}
            </div>
            {settings?.working_hours && (
              <p className="text-xs text-gray-600 mt-3">{settings.working_hours}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            {settings?.footer_copyright || `© ${year} ${siteName}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms"   className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms of Service</Link>
            <a href="https://devsoftbd.com" target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1">
              devsoftbd.com <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}