'use client'

import Image from 'next/image'
import { Eye } from 'lucide-react'
import { useCardPrice } from '@/hooks/useCardPrice'
import { formatPrice } from '@/lib/pricing'
import RarityBadge from '@/components/cards/RarityBadge'
import type { Card } from '@/types'

export type CardDisabledReason = 'domain' | 'limit' | 'type'

interface BuilderCardTileProps {
  card: Card
  deckQty: number
  onAdd: (card: Card) => void
  disabledReason?: CardDisabledReason
  onPreview?: (card: Card) => void
}

export default function BuilderCardTile({ card, deckQty, onAdd, disabledReason, onPreview }: BuilderCardTileProps) {
  const price = useCardPrice(card)
  const isAtLimit = disabledReason === 'limit'
  const isDomainIllegal = disabledReason === 'domain'
  const isDisabled = !!disabledReason

  const badgeBg = isAtLimit ? 'bg-zinc-500' : 'bg-amber-400'
  const badgeText = isAtLimit ? 'text-zinc-100' : 'text-zinc-900'

  return (
    <div
      onClick={() => !isDisabled && onAdd(card)}
      title={
        isDomainIllegal ? 'Outside deck domains'
          : isAtLimit ? '3-copy limit reached'
          : undefined
      }
      className={[
        'group relative flex flex-col overflow-hidden rounded-lg border bg-zinc-900 text-left w-full transition-all select-none',
        isDisabled
          ? 'border-zinc-800 opacity-40 cursor-not-allowed'
          : 'border-zinc-800 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/5 cursor-pointer',
      ].join(' ')}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
        {card.media?.image_url ? (
          <Image
            src={card.media.image_url}
            alt={card.media?.accessibility_text || card.name}
            fill
            sizes="(max-width: 640px) 33vw, 20vw"
            className={[
              'object-cover transition-transform duration-300',
              !isDisabled && 'group-hover:scale-105',
            ].join(' ')}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600 text-[10px]">
            No image
          </div>
        )}

        {/* Deck quantity badge */}
        {deckQty > 0 && (
          <div className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-xs font-bold ${badgeBg} ${badgeText}`}>
            {isAtLimit ? `${deckQty}/3` : `×${deckQty}`}
          </div>
        )}

        {/* Domain-illegal overlay */}
        {isDomainIllegal && (
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <span className="rounded bg-red-900/80 px-1.5 py-0.5 text-[10px] font-medium text-red-300">
              Wrong domain
            </span>
          </div>
        )}

        {/* Hover add overlay (pointer-events-none so it doesn't block the eye button) */}
        {!isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors pointer-events-none">
            <span className="text-3xl font-bold text-white opacity-0 group-hover:opacity-90 transition-opacity drop-shadow">
              +
            </span>
          </div>
        )}

        {/* Preview button — always shown on hover, works even when card is at limit */}
        {onPreview && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPreview(card) }}
            className="absolute bottom-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/85 hover:text-white"
            title="View card"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
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
    </div>
  )
}
