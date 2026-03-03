'use client'

import { useState, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCards } from '@/hooks/useCards'
import { useAllCards } from '@/hooks/useAllCards'
import { useAllPrices } from '@/hooks/useAllPrices'
import { useCollection } from '@/hooks/useCollection'
import { filterCards, isFilterActive, getFilterOptions } from '@/lib/cardFilter'
import CardGrid, { CardGridSkeleton } from '@/components/cards/CardGrid'
import SearchBar from '@/components/cards/SearchBar'
import FilterPanel, { type PanelFilters, PRICE_SORTS } from '@/components/cards/FilterPanel'
import type { Card } from '@/types'

const PAGE_SIZE = 24

function getMarketPrice(card: Card, priceMap: Record<string, { normal: { marketPrice: number | null } | null; foil: { marketPrice: number | null } | null }> | undefined): number {
  if (!priceMap || !card.tcgplayer_id) return 0
  return priceMap[card.tcgplayer_id]?.normal?.marketPrice ?? 0
}

export default function CardsPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<PanelFilters>({})
  const [page, setPage] = useState(1)
  const { collection } = useCollection()

  const activeFilters = { ...filters, query: query || undefined }
  const inFilterMode = isFilterActive(activeFilters)
  const isPriceSort = PRICE_SORTS.has(filters.sort ?? '')
  // Price sort forces client-side mode so we have all cards available to sort
  const useClientMode = inFilterMode || isPriceSort

  // All cards — needed for filter mode and price sort
  const { data: allCards, isLoading: allCardsLoading } = useAllCards()

  // All prices — fetched when price sort is active
  const { data: allPrices, isLoading: pricesLoading } = useAllPrices()

  // Server-side browse (disabled in client mode)
  const { data: browseData, isLoading: browseLoading } = useCards(
    useClientMode ? null : { size: PAGE_SIZE, page, sort: filters.sort, dir: filters.dir }
  )

  // Dropdown options derived from all loaded cards
  const filterOptions = useMemo(
    () => (allCards ? getFilterOptions(allCards) : undefined),
    [allCards]
  )

  // Client-side results: filtered then optionally sorted by price
  const clientCards = useMemo(() => {
    if (!useClientMode || !allCards) return []
    const base = inFilterMode ? filterCards(allCards, activeFilters) : allCards
    if (!isPriceSort) return base
    const asc = filters.sort === 'price-asc'
    return [...base].sort((a, b) => {
      const pa = getMarketPrice(a, allPrices)
      const pb = getMarketPrice(b, allPrices)
      // Cards with no price (0) go to the end regardless of sort direction
      if (pa === 0 && pb === 0) return 0
      if (pa === 0) return 1
      if (pb === 0) return -1
      return asc ? pa - pb : pb - pa
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useClientMode, allCards, allPrices, inFilterMode, isPriceSort, filters.sort, query, filters.type, filters.rarity, filters.domain, filters.set])

  const totalPages = useClientMode
    ? Math.max(1, Math.ceil(clientCards.length / PAGE_SIZE))
    : (browseData?.pages ?? 1)

  const displayItems = useClientMode
    ? clientCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : (browseData?.items ?? [])

  const totalCount = useClientMode ? clientCards.length : (browseData?.total ?? 0)
  const isLoading = useClientMode
    ? (allCardsLoading && !allCards) || (isPriceSort && pricesLoading && !allPrices)
    : browseLoading

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
        showSort={!inFilterMode || isPriceSort}
      />

      {isLoading ? (
        <CardGridSkeleton count={PAGE_SIZE} />
      ) : (
        <>
          <p className="text-sm text-zinc-500">
            {inFilterMode
              ? `${totalCount} result${totalCount !== 1 ? 's' : ''}${query ? ` for "${query}"` : ''}`
              : isPriceSort
              ? `${totalCount} cards · sorted by price`
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
