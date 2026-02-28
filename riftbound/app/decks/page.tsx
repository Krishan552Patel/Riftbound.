'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useDecks } from '@/hooks/useDecks'
import { useRouter } from 'next/navigation'
import DeckCard from '@/components/decks/DeckCard'

export default function DecksPage() {
  const { decks, createDeck, removeDeck } = useDecks()
  const router = useRouter()
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleCreate = () => {
    if (!newName.trim()) return
    const deck = createDeck(newName.trim(), newDesc.trim())
    setNewName('')
    setNewDesc('')
    setShowForm(false)
    router.push(`/decks/${deck.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Decks</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-amber-300 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Deck
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 space-y-3">
          <h2 className="font-semibold text-white">Create New Deck</h2>
          <input
            type="text"
            placeholder="Deck name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400"
            autoFocus
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="rounded-md bg-amber-400 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md border border-zinc-700 px-4 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-700 py-16 text-center">
          <p className="text-zinc-500">No decks yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-amber-400 hover:underline"
          >
            Create your first deck →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onDelete={removeDeck} />
          ))}
        </div>
      )}
    </div>
  )
}
