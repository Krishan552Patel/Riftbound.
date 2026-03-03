'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Plus, Minus, BookOpen } from 'lucide-react'
import { useCard } from '@/hooks/useCard'
import { useCollection } from '@/hooks/useCollection'
import { useDecks } from '@/hooks/useDecks'
import { formatPrice } from '@/lib/pricing'
import { useCardPrice } from '@/hooks/useCardPrice'
import RarityBadge from '@/components/cards/RarityBadge'
import PriceComparisonTable from '@/components/cards/PriceComparisonTable'

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: card, isLoading, error } = useCard(id)
  const { getEntry, updateCard, removeCard } = useCollection()
  const { decks, addCardToDeck } = useDecks()
  const [selectedDeck, setSelectedDeck] = useState('')
  const price = useCardPrice(card)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 rounded bg-zinc-800" />
        <div className="flex gap-8">
          <div className="h-96 w-64 rounded-lg bg-zinc-800" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-48 rounded bg-zinc-800" />
            <div className="h-4 w-32 rounded bg-zinc-800" />
            <div className="h-24 rounded bg-zinc-800" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-zinc-400">Card not found.</p>
        <Link href="/" className="text-amber-400 hover:underline">
          ← Back to cards
        </Link>
      </div>
    )
  }

  const entry = getEntry(card.id)
  const qty = entry?.quantity ?? 0
  const foilQty = entry?.foilQuantity ?? 0

  const handleQtyChange = (delta: number) => {
    const newQty = Math.max(0, qty + delta)
    if (newQty === 0 && foilQty === 0) {
      removeCard(card.id)
    } else {
      updateCard(card.id, newQty, foilQty)
    }
  }

  const handleFoilQtyChange = (delta: number) => {
    const newFoilQty = Math.max(0, foilQty + delta)
    if (qty === 0 && newFoilQty === 0) {
      removeCard(card.id)
    } else {
      updateCard(card.id, qty, newFoilQty)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/cards"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cards
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Card image */}
        <div className="flex-shrink-0">
          <div className="relative h-auto w-64 overflow-hidden rounded-xl shadow-2xl shadow-black/50">
            {card.media?.image_url ? (
              <Image
                src={card.media.image_url}
                alt={card.media?.accessibility_text || card.name}
                width={256}
                height={358}
                className="w-full object-cover"
                priority
              />
            ) : (
              <div className="flex h-80 w-64 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
                No image
              </div>
            )}
          </div>
          {card.media?.artist && (
            <p className="mt-2 text-center text-xs text-zinc-500">
              Art by {card.media.artist}
            </p>
          )}
        </div>

        {/* Card info */}
        <div className="flex-1 space-y-5">
          <div>
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-bold text-white">{card.name}</h1>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RarityBadge rarity={card.classification?.rarity ?? ''} />
              <span className="text-sm text-zinc-400">{card.classification?.type}</span>
              {card.classification?.supertype && (
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                  {card.classification.supertype}
                </span>
              )}
              {(card.classification?.domain ?? []).map((d) => (
                <span
                  key={d}
                  className="rounded bg-amber-900/30 px-1.5 py-0.5 text-xs text-amber-300"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            {card.attributes?.energy != null && (
              <Stat label="Energy" value={card.attributes.energy} />
            )}
            {card.attributes?.might != null && (
              <Stat label="Might" value={card.attributes.might} />
            )}
            {card.attributes?.power != null && (
              <Stat label="Power" value={card.attributes.power} />
            )}
          </div>

          {/* Card text */}
          {card.text?.plain && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-sm leading-relaxed text-zinc-300">{card.text.plain}</p>
            </div>
          )}

          {/* Tags */}
          {(card.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(card.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Set info */}
          <p className="text-sm text-zinc-500">
            {card.set?.label} · {card.public_code}
          </p>

          {/* Pricing */}
          <PriceComparisonTable card={card} tcgPrice={price} />

          {/* Collection tracker */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
            <h2 className="font-semibold text-white">My Collection</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 w-10">Normal</span>
                <QuantityStepper value={qty} onChange={handleQtyChange} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 w-10">Foil</span>
                <QuantityStepper value={foilQty} onChange={handleFoilQtyChange} />
              </div>
            </div>
            {(qty > 0 || foilQty > 0) && (
              <p className="text-xs text-emerald-400">
                Owned: {qty} normal{foilQty > 0 ? `, ${foilQty} foil` : ''} ·{' '}
                Est. value {price ? formatPrice(price.market * qty + price.foil * foilQty) : '—'}
              </p>
            )}
          </div>

          {/* Add to deck */}
          {decks.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              <h2 className="font-semibold text-white">Add to Deck</h2>
              <div className="flex gap-2">
                <select
                  value={selectedDeck}
                  onChange={(e) => setSelectedDeck(e.target.value)}
                  className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-400"
                >
                  <option value="">Select a deck…</option>
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  disabled={!selectedDeck}
                  onClick={() => {
                    if (selectedDeck) {
                      addCardToDeck(selectedDeck, card.id)
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <BookOpen className="h-4 w-4" /> Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 min-w-[60px]">
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  )
}


function QuantityStepper({ value, onChange }: { value: number; onChange: (delta: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(-1)}
        disabled={value === 0}
        className="flex h-7 w-7 items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-6 text-center text-sm font-medium text-white">{value}</span>
      <button
        onClick={() => onChange(1)}
        className="flex h-7 w-7 items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}
