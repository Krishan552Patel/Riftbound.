'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/pricing'
import { useCardPrice } from '@/hooks/useCardPrice'
import type { Card } from '@/types'
import RarityBadge from './RarityBadge'

interface CardTileProps {
  card: Card
  ownedQty?: number
  compact?: boolean
  onAddToDeck?: (card: Card) => void
}

export default function CardTile({ card, ownedQty, compact, onAddToDeck }: CardTileProps) {
  const price = useCardPrice(card)

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-all hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-400/5',
        compact ? 'text-xs' : 'text-sm'
      )}
    >
      <Link href={`/cards/${card.id}`} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
          {card.media?.image_url ? (
            <Image
              src={card.media.image_url}
              alt={card.media?.accessibility_text || card.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-600 text-xs">
              No image
            </div>
          )}
          {ownedQty ? (
            <div className="absolute left-1.5 top-1.5 rounded bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-zinc-900">
              ×{ownedQty}
            </div>
          ) : null}
        </div>
        <div className="p-2">
          <p className="truncate font-semibold text-zinc-100">{card.name}</p>
          <div className="mt-1 flex items-center justify-between gap-1">
            <RarityBadge rarity={card.classification?.rarity ?? ''} />
            <span className="font-mono text-amber-400">{price ? formatPrice(price.market) : '—'}</span>
          </div>
          <p className="mt-1 truncate text-zinc-500">{card.classification?.type}</p>
        </div>
      </Link>
      {onAddToDeck && (
        <button
          onClick={() => onAddToDeck(card)}
          className="border-t border-zinc-800 py-1.5 text-center text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          + Add to deck
        </button>
      )}
    </div>
  )
}
