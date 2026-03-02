'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Deck, DeckCard } from '@/types'
import { getDecks, saveDeck, deleteDeck, getDeck } from '@/lib/storage'
import { generateId } from '@/lib/utils'

const MAX_COPIES = 3
const SIDEBOARD_SIZE = 8

/** Combined quantity of a card across main deck + sideboard (used to enforce the 3-copy rule). */
function combinedQty(deck: Deck, cardId: string): number {
  const main = deck.cards.find((c) => c.cardId === cardId)?.quantity ?? 0
  const side = (deck.sideboard ?? []).find((c) => c.cardId === cardId)?.quantity ?? 0
  return main + side
}

function upsert(list: DeckCard[], cardId: string, delta: number): DeckCard[] {
  const existing = list.find((c) => c.cardId === cardId)
  const next = existing
    ? list.map((c) => c.cardId === cardId ? { ...c, quantity: c.quantity + delta } : c)
    : [...list, { cardId, quantity: delta }]
  return next.filter((c) => c.quantity > 0)
}

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([])

  useEffect(() => {
    setDecks(getDecks())
  }, [])

  const createDeck = useCallback((name: string, description = '') => {
    const deck: Deck = {
      id: generateId(),
      name,
      description,
      cards: [],
      sideboard: [],
      maybeboard: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = saveDeck(deck)
    setDecks([...updated])
    return deck
  }, [])

  const updateDeck = useCallback((deck: Deck) => {
    const updated = saveDeck({ ...deck, updatedAt: new Date().toISOString() })
    setDecks([...updated])
  }, [])

  const removeDeck = useCallback((deckId: string) => {
    const updated = deleteDeck(deckId)
    setDecks([...updated])
  }, [])

  // ── Main deck ──────────────────────────────────────────────────────────────

  /** Add 1 copy to main deck. Blocked if combined main+side would exceed 3. */
  const addCardToDeck = useCallback((deckId: string, cardId: string) => {
    const deck = getDeck(deckId)
    if (!deck) return
    if (combinedQty(deck, cardId) >= MAX_COPIES) return // hard enforcement
    const cards = upsert(deck.cards, cardId, 1)
    saveDeck({ ...deck, cards, updatedAt: new Date().toISOString() })
    setDecks([...getDecks()])
  }, [])

  /** Remove 1 copy from main deck. */
  const removeCardFromDeck = useCallback((deckId: string, cardId: string) => {
    const deck = getDeck(deckId)
    if (!deck) return
    const cards = upsert(deck.cards, cardId, -1)
    saveDeck({ ...deck, cards, updatedAt: new Date().toISOString() })
    setDecks([...getDecks()])
  }, [])

  // ── Sideboard ──────────────────────────────────────────────────────────────

  /** Add 1 copy to sideboard. Blocked if combined main+side would exceed 3,
   *  or if sideboard is already at 8 cards. */
  const addCardToSideboard = useCallback((deckId: string, cardId: string) => {
    const deck = getDeck(deckId)
    if (!deck) return
    if (combinedQty(deck, cardId) >= MAX_COPIES) return // hard enforcement
    const sideTotal = (deck.sideboard ?? []).reduce((s, c) => s + c.quantity, 0)
    if (sideTotal >= SIDEBOARD_SIZE) return // sideboard full
    const sideboard = upsert(deck.sideboard ?? [], cardId, 1)
    saveDeck({ ...deck, sideboard, updatedAt: new Date().toISOString() })
    setDecks([...getDecks()])
  }, [])

  /** Remove 1 copy from sideboard. */
  const removeCardFromSideboard = useCallback((deckId: string, cardId: string) => {
    const deck = getDeck(deckId)
    if (!deck) return
    const sideboard = upsert(deck.sideboard ?? [], cardId, -1)
    saveDeck({ ...deck, sideboard, updatedAt: new Date().toISOString() })
    setDecks([...getDecks()])
  }, [])

  // ── Maybeboard ─────────────────────────────────────────────────────────────

  /** Add 1 copy to maybeboard. No copy or size limits — scratchpad only. */
  const addCardToMaybeboard = useCallback((deckId: string, cardId: string) => {
    const deck = getDeck(deckId)
    if (!deck) return
    const maybeboard = upsert(deck.maybeboard ?? [], cardId, 1)
    saveDeck({ ...deck, maybeboard, updatedAt: new Date().toISOString() })
    setDecks([...getDecks()])
  }, [])

  /** Remove 1 copy from maybeboard. */
  const removeCardFromMaybeboard = useCallback((deckId: string, cardId: string) => {
    const deck = getDeck(deckId)
    if (!deck) return
    const maybeboard = upsert(deck.maybeboard ?? [], cardId, -1)
    saveDeck({ ...deck, maybeboard, updatedAt: new Date().toISOString() })
    setDecks([...getDecks()])
  }, [])

  // ── Legend ─────────────────────────────────────────────────────────────────

  const setDeckLegend = useCallback((deckId: string, legendId: string | null) => {
    const deck = getDeck(deckId)
    if (!deck) return
    saveDeck({ ...deck, legendId: legendId ?? undefined, updatedAt: new Date().toISOString() })
    setDecks([...getDecks()])
  }, [])

  /** Toggle a battlefield in/out of the deck's 3-slot battlefield list. */
  const toggleBattlefield = useCallback((deckId: string, battlefieldId: string) => {
    const deck = getDeck(deckId)
    if (!deck) return
    const current = deck.battlefieldIds ?? []
    const next = current.includes(battlefieldId)
      ? current.filter((id) => id !== battlefieldId)
      : current.length < 3 ? [...current, battlefieldId] : current // max 3
    saveDeck({ ...deck, battlefieldIds: next, updatedAt: new Date().toISOString() })
    setDecks([...getDecks()])
  }, [])

  /** Set rune counts per domain. Total across all domains should be 12. */
  const setDeckRunes = useCallback((deckId: string, runes: Record<string, number>) => {
    const deck = getDeck(deckId)
    if (!deck) return
    saveDeck({ ...deck, runes, updatedAt: new Date().toISOString() })
    setDecks([...getDecks()])
  }, [])

  return {
    decks,
    createDeck,
    updateDeck,
    removeDeck,
    addCardToDeck,
    removeCardFromDeck,
    addCardToSideboard,
    removeCardFromSideboard,
    addCardToMaybeboard,
    removeCardFromMaybeboard,
    setDeckLegend,
    toggleBattlefield,
    setDeckRunes,
  }
}
