'use client'

import Image from 'next/image'
import { useCardPrice } from '@/hooks/useCardPrice'
import { formatPrice } from '@/lib/pricing'
import RarityBadge from '@/components/cards/RarityBadge'
import type { Card } from '@/types'

interface BuilderCardTileProps {
  card: Card
  deckQty: number
  onAdd: (card: Card) => void
}

export default function BuilderCardTile({ card, deckQty, onAdd }: BuilderCardTileProps) {
  const price = useCardPrice(card)

  return (
    <button
      onClick={() => onAdd(card)}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 text-left w-full transition-all hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/5"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
        {card.media?.image_url ? (
          <Image
            src={card.media.image_url}
            alt={card.media?.accessibility_text || card.name}
            fill
            sizes="(max-width: 640px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600 text-[10px]">
            No image
          </div>
        )}

        {/* Deck quantity badge */}
        {deckQty > 0 && (
          <div className="absolute left-1.5 top-1.5 rounded bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-zinc-900">
            ×{deckQty}
          </div>
        )}

        {/* Hover add overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
          <span className="text-3xl font-bold text-white opacity-0 group-hover:opacity-90 transition-opacity drop-shadow">
            +
          </span>
        </div>
      </div>

      <div className="p-1.5">
        <p className="truncate text-xs font-semibold text-zinc-100">{card.name}</p>
        <div className="mt-0.5 flex items-center justify-between gap-1">
          <RarityBadge rarity={card.classification?.rarity ?? ''} />
          <span className="text-[10px] font-mono text-amber-400 flex-shrink-0">
            {price ? formatPrice(price.market) : '—'}
          </span>
        </div>
      </div>
    </button>
  )
}
