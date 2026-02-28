'use client'

import Link from 'next/link'
import { Trash2, Swords } from 'lucide-react'
import type { Deck } from '@/types'

interface DeckCardProps {
  deck: Deck
  onDelete: (id: string) => void
}

export default function DeckCard({ deck, onDelete }: DeckCardProps) {
  const totalCards = deck.cards.reduce((s, c) => s + c.quantity, 0)
  const uniqueCards = deck.cards.length

  return (
    <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-amber-400/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <Link
            href={`/decks/${deck.id}`}
            className="font-semibold text-white hover:text-amber-400 transition-colors"
          >
            {deck.name}
          </Link>
        </div>
        <button
          onClick={() => onDelete(deck.id)}
          className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {deck.description && (
        <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{deck.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span>{totalCards} cards · {uniqueCards} unique</span>
        <Link
          href={`/decks/${deck.id}`}
          className="text-amber-400 hover:underline"
        >
          Edit →
        </Link>
      </div>
    </div>
  )
}
