'use client'

import type { Card } from '@/types'
import CardTile from './CardTile'

interface CardGridProps {
  cards: Card[]
  ownedMap?: Record<string, number>
  compact?: boolean
  onAddToDeck?: (card: Card) => void
}

function SkeletonTile() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 animate-pulse">
      <div className="aspect-[3/4] w-full bg-zinc-800" />
      <div className="p-2 space-y-2">
        <div className="h-4 rounded bg-zinc-700 w-3/4" />
        <div className="h-3 rounded bg-zinc-800 w-1/2" />
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTile key={i} />
      ))}
    </div>
  )
}

export default function CardGrid({ cards, ownedMap, compact, onAddToDeck }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-700 text-zinc-500">
        No cards found.
      </div>
    )
  }

  return (
    <div
      className={
        compact
          ? 'grid grid-cols-2 gap-2 sm:grid-cols-3'
          : 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
      }
    >
      {cards.map((card) => (
        <CardTile
          key={card.id}
          card={card}
          ownedQty={ownedMap?.[card.id]}
          compact={compact}
          onAddToDeck={onAddToDeck}
        />
      ))}
    </div>
  )
}
