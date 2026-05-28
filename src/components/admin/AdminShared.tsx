// src/components/admin/AdminShared.tsx
// Shared admin UI primitives used across all admin pages

import { cn } from '@/lib/utils'
import { Loader2, AlertTriangle, Plus, Trash2, Edit2, MoreVertical, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState } from 'react'

// ── Page header ───────────────────────────────────────────
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  color?: string
  trend?: string
}
export function StatCard({ label, value, icon: Icon, color = 'brand', trend }: StatCardProps) {
  const colors: Record<string, string> = {
    brand:  'bg-brand-50 text-brand-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors[color] || colors.brand)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div className="font-display text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}

// ── Add button ────────────────────────────────────────────
interface AddButtonProps { label: string; onClick: () => void }
export function AddButton({ label, onClick }: AddButtonProps) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
      <Plus className="h-4 w-4" /> {label}
    </button>
  )
}

// ── Table wrapper ─────────────────────────────────────────
interface TableProps { headers: string[]; children: React.ReactNode; loading?: boolean; emptyMessage?: string }
export function AdminTable({ headers, children, loading, emptyMessage = 'No records found.' }: TableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {headers.map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-500 mx-auto" />
                </td>
              </tr>
            ) : children ? children : (
              <tr>
                <td colSpan={headers.length} className="py-16 text-center text-sm text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Table row actions ─────────────────────────────────────
interface RowActionsProps {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  onToggle?: () => void
  isActive?: boolean
}
export function RowActions({ onEdit, onDelete, onView, onToggle, isActive }: RowActionsProps) {
  return (
    <div className="flex items-center gap-1 justify-end">
      {onView && (
        <button onClick={onView} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="View">
          <Eye className="h-4 w-4" />
        </button>
      )}
      {onToggle && (
        <button onClick={onToggle} className={cn('p-1.5 rounded-lg transition-colors', isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100')} title="Toggle active">
          {isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
        </button>
      )}
      {onEdit && (
        <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Edit">
          <Edit2 className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    featured:  'bg-blue-100 text-blue-700',
    draft:     'bg-gray-100 text-gray-600',
    active:    'bg-green-100 text-green-700',
    inactive:  'bg-gray-100 text-gray-500',
    pending:   'bg-amber-100 text-amber-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-600',
    new:       'bg-blue-100 text-blue-700',
    read:      'bg-gray-100 text-gray-600',
    replied:   'bg-green-100 text-green-700',
    spam:      'bg-red-100 text-red-600',
    archived:  'bg-gray-100 text-gray-500',
    planning:  'bg-purple-100 text-purple-700',
    on_hold:   'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
    todo:         'bg-gray-100 text-gray-600',
    in_progress:  'bg-blue-100 text-blue-700',
    in_review:    'bg-purple-100 text-purple-700',
    done:         'bg-green-100 text-green-700',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize', colors[status] || 'bg-gray-100 text-gray-600')}>
      {status.replace('_', ' ')}
    </span>
  )
}

// ── Priority badge ────────────────────────────────────────
export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low:      'bg-gray-100 text-gray-500',
    medium:   'bg-blue-100 text-blue-600',
    high:     'bg-orange-100 text-orange-600',
    critical: 'bg-red-100 text-red-600',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize', colors[priority] || 'bg-gray-100 text-gray-500')}>
      {priority}
    </span>
  )
}

// ── Confirm delete dialog ─────────────────────────────────
interface ConfirmDialogProps {
  open: boolean
  title?: string
  message?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}
export function ConfirmDialog({ open, title = 'Delete this item?', message = 'This action cannot be undone.', onConfirm, onCancel, loading }: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="font-display font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Slide-over drawer ─────────────────────────────────────
interface DrawerProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: string }
export function Drawer({ open, onClose, title, children, width = 'max-w-lg' }: DrawerProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative ml-auto bg-white h-full flex flex-col shadow-2xl w-full', width)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Form field wrapper ────────────────────────────────────
interface FormFieldProps { label: string; error?: string; required?: boolean; children: React.ReactNode; hint?: string }
export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Form input ────────────────────────────────────────────
export function FormInput({ className, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={cn(
        'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-colors',
        error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white',
        className
      )}
    />
  )
}

// ── Form textarea ─────────────────────────────────────────
export function FormTextarea({ className, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-colors resize-none',
        error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white',
        className
      )}
    />
  )
}

// ── Form select ───────────────────────────────────────────
export function FormSelect({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-colors',
        className
      )}
    />
  )
}

// ── Save button ───────────────────────────────────────────
export function SaveButton({ loading, label = 'Save Changes' }: { loading?: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading}
      className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors disabled:cursor-not-allowed">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {loading ? 'Saving…' : label}
    </button>
  )
}

// ── Search input ──────────────────────────────────────────
import { Search } from 'lucide-react'
export function SearchInput({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-400 transition-colors w-64"
      />
    </div>
  )
}

// ── Image upload dropzone ─────────────────────────────────
import { Upload, ImageIcon } from 'lucide-react'
interface ImageDropzoneProps {
  currentUrl?: string | null
  onUpload: (file: File) => void
  loading?: boolean
  label?: string
  aspectClass?: string
}
export function ImageDropzone({ currentUrl, onUpload, loading, label = 'Upload Image', aspectClass = 'aspect-video' }: ImageDropzoneProps) {
  return (
    <label className={cn(
      'relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer group transition-colors',
      aspectClass,
      loading ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:border-brand-400 hover:bg-gray-50'
    )}>
      <input type="file" accept="image/*" className="sr-only"
        onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
      {currentUrl ? (
        <>
          <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white text-xs font-medium flex items-center gap-1.5">
              <Upload className="h-4 w-4" /> Change
            </p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                <ImageIcon className="h-5 w-5 text-gray-400 group-hover:text-brand-500" />
              </div>
              <span className="text-xs text-gray-500 group-hover:text-brand-600 font-medium">{label}</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP up to 10MB</span>
            </>
          )}
        </div>
      )}
    </label>
  )
}

// ── Tabs ──────────────────────────────────────────────────
interface TabsProps { tabs: string[]; active: string; onChange: (tab: string) => void }
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
      {tabs.map(tab => (
        <button key={tab} onClick={() => onChange(tab)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            active === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          )}>
          {tab}
        </button>
      ))}
    </div>
  )
}