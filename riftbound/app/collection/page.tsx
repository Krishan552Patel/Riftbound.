'use client'

import { useState, useEffect } from 'react'
import { useCollection } from '@/hooks/useCollection'
import CollectionStats from '@/components/collection/CollectionStats'
import CollectionTable from '@/components/collection/CollectionTable'
import type { Card } from '@/types'

export default function CollectionPage() {
  const { collection, updateCard, removeCard } = useCollection()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)

  const cardIds = Object.keys(collection)

  useEffect(() => {
    if (cardIds.length === 0) {
      setCards([])
      return
    }
    setLoading(true)
    // Fetch each card in the collection — they're all individually cached
    Promise.all(
      cardIds.map((id) =>
        fetch(`/api/cards/${id}`)
          .then((r) => r.json())
          .catch(() => null)
      )
    ).then((results) => {
      setCards(results.filter(Boolean) as Card[])
      setLoading(false)
    })
  }, [cardIds.join(',')])

  const handleExport = () => {
    const lines = Object.values(collection).map((e) => {
      const card = cards.find((c) => c.id === e.cardId)
      const name = card?.name ?? e.cardId
      const lines: string[] = []
      if (e.quantity > 0) lines.push(`${e.quantity}x ${name}`)
      if (e.foilQuantity > 0) lines.push(`${e.foilQuantity}x ${name} (Foil)`)
      return lines.join('\n')
    })
    navigator.clipboard.writeText(lines.join('\n'))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Collection</h1>
        {cardIds.length > 0 && (
          <button
            onClick={handleExport}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Export to clipboard
          </button>
        )}
      </div>

      <CollectionStats collection={collection} cards={cards} />

      {loading ? (
        <div className="flex h-32 items-center justify-center text-zinc-500">
          Loading collection…
        </div>
      ) : (
        <CollectionTable
          collection={collection}
          cards={cards}
          onRemove={removeCard}
          onUpdate={updateCard}
        />
      )}
    </div>
  )
}
