'use client'

import { use, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react'
import { useDecks } from '@/hooks/useDecks'
import { useRouter } from 'next/navigation'
import SearchBar from '@/components/cards/SearchBar'
import CardGrid from '@/components/cards/CardGrid'
import RarityBadge from '@/components/cards/RarityBadge'
import { getCardPrice, formatPrice } from '@/lib/pricing'
import type { Card, PaginatedCards } from '@/types'

export default function DeckBuilderPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params)
  const { decks, updateDeck, removeDeck, addCardToDeck, removeCardFromDeck } = useDecks()
  const router = useRouter()

  const deck = decks.find((d) => d.id === deckId)

  // Card search for the left panel
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Card[]>([])
  const [browsedCards, setBrowsedCards] = useState<Card[]>([])
  const [searching, setSearching] = useState(false)
  const [deckName, setDeckName] = useState(deck?.name ?? '')
  const [editingName, setEditingName] = useState(false)
  // Card data cache for deck entries
  const [deckCardCache, setDeckCardCache] = useState<Map<string, Card>>(new Map())

  // Load initial browse cards
  useEffect(() => {
    fetch('/api/cards?size=24')
      .then((r) => r.json())
      .then((data: PaginatedCards) => setBrowsedCards(data.items ?? []))
      .catch(() => {})
  }, [])

  // Fetch card details for deck entries not yet in cache
  useEffect(() => {
    if (!deck) return
    const missing = deck.cards.filter((dc) => !deckCardCache.has(dc.cardId))
    if (missing.length === 0) return
    Promise.all(
      missing.map((dc) =>
        fetch(`/api/cards/${dc.cardId}`)
          .then((r) => r.json())
          .catch(() => null)
      )
    ).then((results) => {
      const newCache = new Map(deckCardCache)
      results.forEach((card: Card | null) => {
        if (card) newCache.set(card.id, card)
      })
      setDeckCardCache(newCache)
    })
  }, [deck?.cards.map((c) => c.cardId).join(',')])

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/cards/search?query=${encodeURIComponent(q)}&size=24`)
      const data: PaginatedCards = await res.json()
      setSearchResults(data.items ?? [])
    } catch {
      setSearchResults([])
    }
    setSearching(false)
  }, [])

  const handleSaveName = () => {
    if (!deck || !deckName.trim()) return
    updateDeck({ ...deck, name: deckName.trim() })
    setEditingName(false)
  }

  if (!deck) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-zinc-400">Deck not found.</p>
        <Link href="/decks" className="text-amber-400 hover:underline">
          ← Back to decks
        </Link>
      </div>
    )
  }

  const displayCards = query.trim() ? searchResults : browsedCards
  const totalCards = deck.cards.reduce((s, c) => s + c.quantity, 0)

  const deckValue = deck.cards.reduce((sum, dc) => {
    const card = deckCardCache.get(dc.cardId)
    if (!card) return sum
    return sum + getCardPrice(card).market * dc.quantity
  }, 0)

  return (
    <div className="space-y-4">
      <Link
        href="/decks"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to decks
      </Link>

      <div className="flex items-center gap-3">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="rounded-md border border-amber-400 bg-zinc-900 px-3 py-1 text-lg font-bold text-white outline-none"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="rounded-md bg-amber-400 px-3 py-1 text-sm font-medium text-zinc-900"
            >
              Save
            </button>
            <button
              onClick={() => { setDeckName(deck.name); setEditingName(false) }}
              className="text-sm text-zinc-500 hover:text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-2xl font-bold text-white hover:text-amber-400 transition-colors"
          >
            {deck.name}
          </button>
        )}
        <span className="text-sm text-zinc-500">{totalCards} cards · {formatPrice(deckValue)} est.</span>
        <button
          onClick={() => { removeDeck(deck.id); router.push('/decks') }}
          className="ml-auto text-zinc-600 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: card search */}
        <div className="space-y-4">
          <SearchBar onSearch={handleSearch} placeholder="Search cards to add…" />
          {searching ? (
            <p className="text-sm text-zinc-500">Searching…</p>
          ) : (
            <CardGrid
              cards={displayCards}
              compact
              onAddToDeck={(card) => addCardToDeck(deck.id, card.id)}
            />
          )}
        </div>

        {/* Right: deck list */}
        <div className="space-y-2">
          <h2 className="font-semibold text-white">Deck List</h2>
          {deck.cards.length === 0 ? (
            <p className="text-sm text-zinc-500">No cards yet — click cards on the left to add them.</p>
          ) : (
            <div className="space-y-1">
              {deck.cards.map((dc) => {
                const card = deckCardCache.get(dc.cardId)
                return (
                  <div
                    key={dc.cardId}
                    className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-1.5"
                  >
                    {card?.media.image_url && (
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
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {card?.name ?? dc.cardId}
                      </p>
                      {card && <RarityBadge rarity={card.classification.rarity} />}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => removeCardFromDeck(deck.id, dc.cardId)}
                        className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-amber-400">
                        {dc.quantity}
                      </span>
                      <button
                        onClick={() => addCardToDeck(deck.id, dc.cardId)}
                        className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {deck.cards.length > 0 && (
            <button
              onClick={() => {
                const lines = deck.cards.map((dc) => {
                  const card = deckCardCache.get(dc.cardId)
                  return `${dc.quantity}x ${card?.name ?? dc.cardId}`
                })
                navigator.clipboard.writeText(lines.join('\n'))
              }}
              className="w-full rounded-md border border-zinc-700 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Copy deck list
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
