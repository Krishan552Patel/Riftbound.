'use client'

import { use, useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Plus, Minus, Trash2, Copy, Check } from 'lucide-react'
import { useDecks } from '@/hooks/useDecks'
import { useAllCards } from '@/hooks/useAllCards'
import { useRouter } from 'next/navigation'
import { filterCards, isFilterActive, getFilterOptions } from '@/lib/cardFilter'
import { formatPrice } from '@/lib/pricing'
import { getCardPrice } from '@/lib/pricing'
import FilterPanel, { type PanelFilters } from '@/components/cards/FilterPanel'
import SearchBar from '@/components/cards/SearchBar'
import RarityBadge from '@/components/cards/RarityBadge'
import BuilderCardTile from '@/components/decks/BuilderCardTile'
import DeckStats from '@/components/decks/DeckStats'
import { CardGridSkeleton } from '@/components/cards/CardGrid'
import type { Card } from '@/types'

const BUILDER_PAGE_SIZE = 40

const TYPE_ORDER = ['Champion', 'Unit', 'Spell', 'Equipment', 'Location']
function typeSort(a: string, b: string) {
  const ai = TYPE_ORDER.indexOf(a)
  const bi = TYPE_ORDER.indexOf(b)
  if (ai !== -1 && bi !== -1) return ai - bi
  if (ai !== -1) return -1
  if (bi !== -1) return 1
  return a.localeCompare(b)
}

export default function DeckBuilderPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params)
  const { decks, updateDeck, removeDeck, addCardToDeck, removeCardFromDeck } = useDecks()
  const router = useRouter()

  const deck = decks.find((d) => d.id === deckId)

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<PanelFilters>({})
  const [cardPage, setCardPage] = useState(1)
  const [deckName, setDeckName] = useState(deck?.name ?? '')
  const [editingName, setEditingName] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: allCards, isLoading: allCardsLoading } = useAllCards()

  // Map for fast card lookup from deck entries
  const allCardsMap = useMemo(() => {
    if (!allCards) return new Map<string, Card>()
    return new Map(allCards.map((c) => [c.id, c]))
  }, [allCards])

  // Filter options for the dropdowns
  const filterOptions = useMemo(
    () => (allCards ? getFilterOptions(allCards) : undefined),
    [allCards]
  )

  // Active filters check
  const activeFilters = { ...filters, query: query || undefined }
  const inFilterMode = isFilterActive(activeFilters)

  // Filtered + paginated cards for the left panel
  const filteredCards = useMemo(() => {
    if (!allCards) return []
    if (inFilterMode) return filterCards(allCards, activeFilters)
    return allCards
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCards, inFilterMode, query, filters.type, filters.rarity, filters.domain, filters.set])

  const totalCardPages = Math.max(1, Math.ceil(filteredCards.length / BUILDER_PAGE_SIZE))
  const pagedCards = filteredCards.slice(
    (cardPage - 1) * BUILDER_PAGE_SIZE,
    cardPage * BUILDER_PAGE_SIZE
  )

  // Deck qty map for badge overlays
  const deckQtyMap = useMemo(() => {
    if (!deck) return {} as Record<string, number>
    return Object.fromEntries(deck.cards.map((c) => [c.cardId, c.quantity]))
  }, [deck])

  // Resolved deck entries with full card objects
  const deckEntries = useMemo(() => {
    if (!deck) return []
    return deck.cards
      .map((dc) => ({ card: allCardsMap.get(dc.cardId), quantity: dc.quantity }))
      .filter((e): e is { card: Card; quantity: number } => !!e.card)
  }, [deck, allCardsMap])

  // Deck list grouped by card type
  const groupedDeck = useMemo(() => {
    const groups = new Map<string, typeof deckEntries>()
    for (const entry of deckEntries) {
      const type = entry.card.classification?.type ?? 'Other'
      if (!groups.has(type)) groups.set(type, [])
      groups.get(type)!.push(entry)
    }
    return [...groups.entries()].sort(([a], [b]) => typeSort(a, b))
  }, [deckEntries])

  // Deck value estimate
  const deckValue = useMemo(
    () => deckEntries.reduce((sum, { card, quantity }) => sum + getCardPrice(card).market * quantity, 0),
    [deckEntries]
  )

  const totalCards = deck?.cards.reduce((s, c) => s + c.quantity, 0) ?? 0

  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    setCardPage(1)
  }, [])

  const handleFiltersChange = useCallback((f: PanelFilters) => {
    setFilters(f)
    setCardPage(1)
  }, [])

  const handleSaveName = () => {
    if (!deck || !deckName.trim()) return
    updateDeck({ ...deck, name: deckName.trim() })
    setEditingName(false)
  }

  const handleCopy = () => {
    const lines = deckEntries.map(
      ({ card, quantity }) => `${quantity}x ${card.name} (${card.public_code})`
    )
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!deck) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-zinc-400">Deck not found.</p>
        <Link href="/decks" className="text-amber-400 hover:underline">← Back to decks</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/decks"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Decks
        </Link>

        <div className="flex items-center gap-2 flex-1">
          {editingName ? (
            <>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') { setDeckName(deck.name); setEditingName(false) }
                }}
                className="rounded-md border border-amber-400 bg-zinc-900 px-3 py-1 text-lg font-bold text-white outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="rounded-md bg-amber-400 px-3 py-1 text-sm font-medium text-zinc-900 hover:bg-amber-300"
              >
                Save
              </button>
              <button
                onClick={() => { setDeckName(deck.name); setEditingName(false) }}
                className="text-sm text-zinc-500 hover:text-white"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-2xl font-bold text-white hover:text-amber-400 transition-colors"
            >
              {deck.name}
            </button>
          )}
        </div>

        <span className="text-sm text-zinc-500">
          {totalCards} cards · {formatPrice(deckValue)} est.
        </span>

        <button
          onClick={() => { removeDeck(deck.id); router.push('/decks') }}
          className="text-zinc-600 hover:text-red-400 transition-colors"
          title="Delete deck"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Main split layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] items-start">

        {/* ── Left: Card Browser ── */}
        <div className="space-y-3">
          <SearchBar onSearch={handleSearch} placeholder="Search cards…" isLoading={false} />
          <FilterPanel
            filters={filters}
            onChange={handleFiltersChange}
            options={filterOptions}
            showSort={false}
          />

          <p className="text-xs text-zinc-500">
            {filteredCards.length} cards · click a card to add it to the deck
          </p>

          {allCardsLoading ? (
            <CardGridSkeleton count={12} />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {pagedCards.map((card) => (
                  <BuilderCardTile
                    key={card.id}
                    card={card}
                    deckQty={deckQtyMap[card.id] ?? 0}
                    onAdd={(c) => addCardToDeck(deck.id, c.id)}
                  />
                ))}
              </div>

              {totalCardPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    disabled={cardPage <= 1}
                    onClick={() => setCardPage((p) => p - 1)}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-zinc-400">{cardPage} / {totalCardPages}</span>
                  <button
                    disabled={cardPage >= totalCardPages}
                    onClick={() => setCardPage((p) => p + 1)}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right: Sticky Deck Panel ── */}
        <div className="lg:sticky lg:top-6 space-y-3">

          {/* Stats */}
          <DeckStats entries={deckEntries} />

          {/* Deck list */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white">Deck List</h2>
              <span className="text-xs text-zinc-500">{totalCards} cards</span>
            </div>

            {groupedDeck.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-zinc-500">
                No cards yet — click cards on the left to add.
              </p>
            ) : (
              <div className="divide-y divide-zinc-800/50 max-h-[50vh] overflow-y-auto">
                {groupedDeck.map(([type, entries]) => (
                  <div key={type}>
                    {/* Group header */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/40 sticky top-0">
                      <span className="text-xs font-semibold text-zinc-300">{type}</span>
                      <span className="text-xs text-zinc-600">
                        ({entries.reduce((s, e) => s + e.quantity, 0)})
                      </span>
                    </div>

                    {/* Cards in group */}
                    {entries.map(({ card, quantity }) => (
                      <div
                        key={card.id}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/30 transition-colors"
                      >
                        {card.media?.image_url && (
                          <div className="relative h-8 w-6 flex-shrink-0 overflow-hidden rounded">
                            <Image
                              src={card.media.image_url}
                              alt={card.name}
                              fill
                              sizes="24px"
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium text-zinc-100">{card.name}</p>
                          <RarityBadge rarity={card.classification?.rarity ?? ''} />
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => removeCardFromDeck(deck.id, card.id)}
                            className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center text-xs font-bold text-amber-400">
                            {quantity}
                          </span>
                          <button
                            onClick={() => addCardToDeck(deck.id, card.id)}
                            className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {deckEntries.length > 0 && (
              <div className="border-t border-zinc-800 px-3 py-2">
                <button
                  onClick={handleCopy}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-zinc-700 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  {copied
                    ? <><Check className="h-3 w-3 text-emerald-400" /> Copied!</>
                    : <><Copy className="h-3 w-3" /> Copy deck list</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
