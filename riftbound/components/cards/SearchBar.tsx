'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
  isLoading?: boolean
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search cards…',
  debounceMs = 300,
  isLoading = false,
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch(value), debounceMs)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [value, debounceMs, onSearch])

  return (
    <div className="relative">
      {isLoading ? (
        <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400 animate-spin" />
      ) : (
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-8 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
