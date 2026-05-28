 
// src/components/shared/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
 
interface Props {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}
 
export function Pagination({ currentPage, lastPage, onPageChange }: Props) {
  if (lastPage <= 1) return null
 
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1)
    .filter(p => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2)
 
  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="h-4 w-4" />
      </button>
 
      {pages.map((page, i) => {
        const prev = pages[i - 1]
        return (
          <>
            {prev && page - prev > 1 && (
              <span key={`ellipsis-${i}`} className="text-gray-400 px-1">…</span>
            )}
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                currentPage === page
                  ? 'bg-brand-600 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              )}>
              {page}
            </button>
          </>
        )
      })}
 
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
 