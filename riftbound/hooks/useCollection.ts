'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Collection, CollectionEntry } from '@/types'
import {
  getCollection,
  upsertCollectionEntry,
  removeCollectionEntry,
} from '@/lib/storage'

export function useCollection() {
  const [collection, setCollection] = useState<Collection>({})

  useEffect(() => {
    setCollection(getCollection())
  }, [])

  const addCard = useCallback((entry: Omit<CollectionEntry, 'addedAt'>) => {
    const full: CollectionEntry = { ...entry, addedAt: new Date().toISOString() }
    const updated = upsertCollectionEntry(full)
    setCollection({ ...updated })
  }, [])

  const updateCard = useCallback((cardId: string, quantity: number, foilQuantity: number) => {
    const existing = getCollection()[cardId]
    const entry: CollectionEntry = {
      cardId,
      quantity,
      foilQuantity,
      addedAt: existing?.addedAt ?? new Date().toISOString(),
    }
    const updated = upsertCollectionEntry(entry)
    setCollection({ ...updated })
  }, [])

  const removeCard = useCallback((cardId: string) => {
    const updated = removeCollectionEntry(cardId)
    setCollection({ ...updated })
  }, [])

  const getEntry = useCallback(
    (cardId: string): CollectionEntry | undefined => collection[cardId],
    [collection]
  )

  const isOwned = useCallback(
    (cardId: string): boolean => Boolean(collection[cardId]?.quantity),
    [collection]
  )

  return { collection, addCard, updateCard, removeCard, getEntry, isOwned }
}
