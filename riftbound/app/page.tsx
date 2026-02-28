'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCards } from '@/hooks/useCards'
import { useCardSearch } from '@/hooks/useCardSearch'
import { useCollection } from '@/hooks/useCollection'
import { useSets } from '@/hooks/useSets'
import CardGrid, { CardGridSkeleton } from '@/components/cards/CardGrid'
import SearchBar from '@/components/cards/SearchBar'
import FilterPanel from '@/components/cards/FilterPanel'
import type { CardQueryParams } from '@/types'

const PAGE_SIZE = 24

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Partial<CardQueryParams>>({ size: PAGE_SIZE, page: 1 })
  const { collection } = useCollection()
  const { data: sets } = useSets()

  const isSearching = query.trim().length > 0

  const { data: browseData, isLoading: browseLoading } = useCards(
    isSearching ? { size: 0, page: 1 } : { ...filters, size: PAGE_SIZE }
  )
  const { data: searchData, isLoading: searchLoading } = useCardSearch(query)

  const data = isSearching ? searchData : browseData
  const isLoading = isSearching ? searchLoading : browseLoading

  const ownedMap = Object.fromEntries(
    Object.entries(collection).map(([id, e]) => [id, e.quantity])
  )

  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    setFilters((f) => ({ ...f, page: 1 }))
  }, [])

  const totalPages = data?.pages ?? 1
  const currentPage = filters.page ?? 1

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-white">Card Browser</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      {!isSearching && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          sets={sets ?? []}
        />
      )}

      {isLoading ? (
        <CardGridSkeleton count={PAGE_SIZE} />
      ) : (
        <>
          {data && (
            <p className="text-sm text-zinc-500">
              {isSearching
                ? `${data.total} result${data.total !== 1 ? 's' : ''} for "${query}"`
                : `${data.total} cards total`}
            </p>
          )}
          <CardGrid cards={data?.items ?? []} ownedMap={ownedMap} />
        </>
      )}

      {!isSearching && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            className="flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm text-zinc-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            className="flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
