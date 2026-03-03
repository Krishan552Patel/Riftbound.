'use client'

import { useState, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCards } from '@/hooks/useCards'
import { useAllCards } from '@/hooks/useAllCards'
import { useCollection } from '@/hooks/useCollection'
import { filterCards, isFilterActive, getFilterOptions } from '@/lib/cardFilter'
import CardGrid, { CardGridSkeleton } from '@/components/cards/CardGrid'
import SearchBar from '@/components/cards/SearchBar'
import FilterPanel, { type PanelFilters } from '@/components/cards/FilterPanel'

const PAGE_SIZE = 24

export default function CardsPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<PanelFilters>({})
  const [page, setPage] = useState(1)
  const { collection } = useCollection()

  const activeFilters = { ...filters, query: query || undefined }
  const inFilterMode = isFilterActive(activeFilters)

  // All cards — always fetched so dropdowns populate and filter mode works
  const { data: allCards, isLoading: allCardsLoading } = useAllCards()

  // Server-side browse (disabled in filter mode)
  const { data: browseData, isLoading: browseLoading } = useCards(
    inFilterMode ? null : { size: PAGE_SIZE, page, sort: filters.sort, dir: filters.dir }
  )

  // Dropdown options derived from all loaded cards
  const filterOptions = useMemo(
    () => (allCards ? getFilterOptions(allCards) : undefined),
    [allCards]
  )

  // Client-side filtered results
  const filteredCards = useMemo(() => {
    if (!inFilterMode || !allCards) return []
    return filterCards(allCards, activeFilters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inFilterMode, allCards, query, filters.type, filters.rarity, filters.domain, filters.set])

  const totalPages = inFilterMode
    ? Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE))
    : (browseData?.pages ?? 1)

  const displayItems = inFilterMode
    ? filteredCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : (browseData?.items ?? [])

  const totalCount = inFilterMode ? filteredCards.length : (browseData?.total ?? 0)
  const isLoading = inFilterMode ? (allCardsLoading && !allCards) : browseLoading

  const ownedMap = Object.fromEntries(
    Object.entries(collection).map(([id, e]) => [id, e.quantity])
  )

  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    setPage(1)
  }, [])

  const handleFiltersChange = useCallback((f: PanelFilters) => {
    setFilters(f)
    setPage(1)
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-white">Card Browser</h1>
        <SearchBar onSearch={handleSearch} isLoading={false} />
      </div>

      <FilterPanel
        filters={filters}
        onChange={handleFiltersChange}
        options={filterOptions}
        showSort={!inFilterMode}
      />

      {isLoading ? (
        <CardGridSkeleton count={PAGE_SIZE} />
      ) : (
        <>
          <p className="text-sm text-zinc-500">
            {inFilterMode
              ? `${totalCount} result${totalCount !== 1 ? 's' : ''}${query ? ` for "${query}"` : ''}`
              : `${totalCount} cards total`}
          </p>
          <CardGrid cards={displayItems} ownedMap={ownedMap} />
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
