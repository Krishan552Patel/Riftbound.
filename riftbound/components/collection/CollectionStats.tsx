'use client'

import type { Collection, Card } from '@/types'
import { getCardPrice, formatPrice } from '@/lib/pricing'

interface CollectionStatsProps {
  collection: Collection
  cards: Card[]
}

export default function CollectionStats({ collection, cards }: CollectionStatsProps) {
  const cardMap = new Map(cards.map((c) => [c.id, c]))
  const entries = Object.values(collection)

  const totalUnique = entries.length
  const totalCards = entries.reduce((s, e) => s + e.quantity + e.foilQuantity, 0)

  const totalValue = entries.reduce((sum, entry) => {
    const card = cardMap.get(entry.cardId)
    if (!card) return sum
    const price = getCardPrice(card)
    return sum + price.market * entry.quantity + price.foil * entry.foilQuantity
  }, 0)

  const rarityCounts: Record<string, number> = {}
  entries.forEach((entry) => {
    const card = cardMap.get(entry.cardId)
    if (card) {
      const r = card.classification.rarity
      rarityCounts[r] = (rarityCounts[r] ?? 0) + entry.quantity
    }
  })

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatBox label="Unique Cards" value={totalUnique.toString()} />
      <StatBox label="Total Cards" value={totalCards.toString()} />
      <StatBox label="Est. Value" value={formatPrice(totalValue)} highlight />
      <StatBox
        label="Breakdown"
        value={Object.entries(rarityCounts)
          .map(([r, n]) => `${n} ${r}`)
          .join(' · ') || '—'}
        small
      />
    </div>
  )
}

function StatBox({
  label,
  value,
  highlight,
  small,
}: {
  label: string
  value: string
  highlight?: boolean
  small?: boolean
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p
        className={`mt-1 font-bold ${small ? 'text-xs text-zinc-300' : 'text-xl'} ${highlight ? 'text-amber-400' : 'text-white'}`}
      >
        {value}
      </p>
    </div>
  )
}
