'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import type { Collection, Card } from '@/types'
import { getCardPrice, formatPrice } from '@/lib/pricing'
import RarityBadge from '@/components/cards/RarityBadge'

interface CollectionTableProps {
  collection: Collection
  cards: Card[]
  onRemove: (cardId: string) => void
  onUpdate: (cardId: string, quantity: number, foilQuantity: number) => void
}

export default function CollectionTable({
  collection,
  cards,
  onRemove,
  onUpdate,
}: CollectionTableProps) {
  const cardMap = new Map(cards.map((c) => [c.id, c]))
  const entries = Object.values(collection)
    .map((e) => ({ entry: e, card: cardMap.get(e.cardId) }))
    .filter((x): x is { entry: typeof x.entry; card: Card } => !!x.card)

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-700 py-16 text-center">
        <p className="text-zinc-500">Your collection is empty.</p>
        <Link href="/" className="text-sm text-amber-400 hover:underline">
          Browse cards to add some →
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left text-xs text-zinc-500">
            <th className="px-3 py-2 font-medium">Card</th>
            <th className="px-3 py-2 font-medium">Rarity</th>
            <th className="px-3 py-2 font-medium text-center">Normal</th>
            <th className="px-3 py-2 font-medium text-center">Foil</th>
            <th className="px-3 py-2 font-medium text-right">Market</th>
            <th className="px-3 py-2 font-medium text-right">Value</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {entries.map(({ entry, card }) => {
            const price = getCardPrice(card)
            const value = price.market * entry.quantity + price.foil * entry.foilQuantity
            return (
              <tr
                key={card.id}
                className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
              >
                <td className="px-3 py-2">
                  <Link href={`/cards/${card.id}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                    {card.media?.image_url && (
                      <div className="relative h-10 w-7 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={card.media.image_url}
                          alt={card.name}
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className="font-medium text-zinc-100">{card.name}</span>
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <RarityBadge rarity={card.classification.rarity} />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="number"
                    min={0}
                    value={entry.quantity}
                    onChange={(e) => {
                      const q = Math.max(0, parseInt(e.target.value) || 0)
                      if (q === 0 && entry.foilQuantity === 0) onRemove(card.id)
                      else onUpdate(card.id, q, entry.foilQuantity)
                    }}
                    className="w-14 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-center text-sm text-zinc-100 outline-none focus:border-amber-400"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="number"
                    min={0}
                    value={entry.foilQuantity}
                    onChange={(e) => {
                      const q = Math.max(0, parseInt(e.target.value) || 0)
                      if (entry.quantity === 0 && q === 0) onRemove(card.id)
                      else onUpdate(card.id, entry.quantity, q)
                    }}
                    className="w-14 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-center text-sm text-zinc-100 outline-none focus:border-amber-400"
                  />
                </td>
                <td className="px-3 py-2 text-right font-mono text-amber-400">
                  {formatPrice(price.market)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-zinc-300">
                  {formatPrice(value)}
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => onRemove(card.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
