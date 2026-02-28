import type { Collection, CollectionEntry, Deck } from '@/types'

const KEYS = {
  collection: 'riftbound_collection',
  decks: 'riftbound_decks',
} as const

function isClient(): boolean {
  return typeof window !== 'undefined'
}

function getItem<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isClient()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}

// --- Collection ---

export function getCollection(): Collection {
  return getItem<Collection>(KEYS.collection, {})
}

export function setCollection(collection: Collection): void {
  setItem(KEYS.collection, collection)
}

export function upsertCollectionEntry(entry: CollectionEntry): Collection {
  const col = getCollection()
  col[entry.cardId] = entry
  setCollection(col)
  return col
}

export function removeCollectionEntry(cardId: string): Collection {
  const col = getCollection()
  delete col[cardId]
  setCollection(col)
  return col
}

// --- Decks ---

export function getDecks(): Deck[] {
  return getItem<Deck[]>(KEYS.decks, [])
}

export function saveDeck(deck: Deck): Deck[] {
  const decks = getDecks()
  const idx = decks.findIndex((d) => d.id === deck.id)
  if (idx >= 0) {
    decks[idx] = deck
  } else {
    decks.push(deck)
  }
  setItem(KEYS.decks, decks)
  return decks
}

export function deleteDeck(deckId: string): Deck[] {
  const decks = getDecks().filter((d) => d.id !== deckId)
  setItem(KEYS.decks, decks)
  return decks
}

export function getDeck(deckId: string): Deck | undefined {
  return getDecks().find((d) => d.id === deckId)
}
