'use client'

import useSWR from 'swr'
import type { Card } from '@/types'

export function useAllCards() {
  return useSWR<Card[]>('/api/cards/all', {
    revalidateOnFocus: false,
    dedupingInterval: 24 * 60 * 60 * 1000,
  })
}
