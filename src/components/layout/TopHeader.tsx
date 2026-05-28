// src/components/layout/TopHeader.tsx
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Github, Instagram, Youtube } from 'lucide-react'
import type { SiteSettings } from '@/types'

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  facebook_url:  Facebook,
  twitter_url:   Twitter,
  linkedin_url:  Linkedin,
  github_url:    Github,
  instagram_url: Instagram,
  youtube_url:   Youtube,
}

interface Props { settings?: SiteSettings }

export default function TopHeader({ settings }: Props) {
  const socialLinks = Object.entries(SOCIAL_ICONS)
    .map(([key, Icon]) => ({ key, Icon, href: settings?.[key as keyof SiteSettings] as string }))
    .filter(s => s.href)

  return (
    <div className="bg-[#0a0f1e] border-b border-white/5 hidden md:block">
      <div className="container">
        <div className="flex items-center justify-between py-2.5">
          {/* Contact strip */}
          <div className="flex items-center gap-6 flex-wrap">
            {settings?.phone_primary && (
              <a href={`tel:${settings.phone_primary}`}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-xs">
                <Phone className="h-3.5 w-3.5 text-blue-500" />
                {settings.phone_primary}
              </a>
            )}
            {settings?.phone_secondary && (
              <a href={`tel:${settings.phone_secondary}`}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-xs">
                <Phone className="h-3.5 w-3.5 text-blue-500" />
                {settings.phone_secondary}
              </a>
            )}
            {settings?.email_primary && (
              <a href={`mailto:${settings.email_primary}`}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-xs">
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                {settings.email_primary}
              </a>
            )}
            {settings?.address && (
              <span className="flex items-center gap-2 text-gray-400 text-xs">
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                {settings.address}
              </span>
            )}
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ key, Icon, href }) => (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-400 transition-colors"
                aria-label={key.replace('_url', '')}>
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}