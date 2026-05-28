 
// ─────────────────────────────────────────────────────────────
// src/lib/utils.ts
// ─────────────────────────────────────────────────────────────
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
 
export function formatDate(date: string | null, format = 'MMM d, yyyy'): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  })
}
 
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '…' : str
}
 
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
 
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
 
export function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    low:      'bg-gray-100 text-gray-600',
    medium:   'bg-blue-100 text-blue-700',
    high:     'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  }
  return map[priority] ?? 'bg-gray-100 text-gray-600'
}
 
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    todo:        'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    in_review:   'bg-purple-100 text-purple-700',
    done:        'bg-green-100 text-green-700',
    cancelled:   'bg-red-100 text-red-700',
    draft:       'bg-gray-100 text-gray-600',
    published:   'bg-green-100 text-green-700',
    featured:    'bg-blue-100 text-blue-700',
    pending:     'bg-yellow-100 text-yellow-700',
    approved:    'bg-green-100 text-green-700',
    rejected:    'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}