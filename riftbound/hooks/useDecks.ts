'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Deck, DeckCard } from '@/types'
import { getDecks, saveDeck, deleteDeck, getDeck } from '@/lib/storage'
import { generateId } from '@/lib/utils'

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

  const addCardToDeck = useCallback((deckId: string, cardId: string) => {
    const deck = getDeck(deckId)
    if (!deck) return
    const existing = deck.cards.find((c) => c.cardId === cardId)
    const cards: DeckCard[] = existing
      ? deck.cards.map((c) => c.cardId === cardId ? { ...c, quantity: c.quantity + 1 } : c)
      : [...deck.cards, { cardId, quantity: 1 }]
    const updated = saveDeck({ ...deck, cards, updatedAt: new Date().toISOString() })
    setDecks([...updated])
  }, [])

  const removeCardFromDeck = useCallback((deckId: string, cardId: string) => {
    const deck = getDeck(deckId)
    if (!deck) return
    const cards = deck.cards
      .map((c) => c.cardId === cardId ? { ...c, quantity: c.quantity - 1 } : c)
      .filter((c) => c.quantity > 0)
    const updated = saveDeck({ ...deck, cards, updatedAt: new Date().toISOString() })
    setDecks([...updated])
  }, [])

  return { decks, createDeck, updateDeck, removeDeck, addCardToDeck, removeCardFromDeck }
}
