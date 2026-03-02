'use client'

import useSWR from 'swr'
import { getGroupId, priceFromMap, type PriceMap } from '@/lib/pricing/tcgcsv'
import { getCardPrice as getPlaceholderPrice } from '@/lib/pricing/placeholder'
import type { Card, CardPrice } from '@/types'

export function useCardPrice(card: Card | null | undefined): CardPrice | null {
  const groupId = card ? getGroupId(card) : null
  const { data } = useSWR<PriceMap>(groupId ? `/api/prices/${groupId}` : null, {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000, // 1 hour — same as server cache
  })

  if (!card) return null

  if (data) {
    const real = priceFromMap(card, data)
    if (real) return real
  }

  // Show placeholder prices while loading or if card has no TCGPlayer listing
  return getPlaceholderPrice(card)
}
