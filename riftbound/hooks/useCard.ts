'use client'

import useSWR from 'swr'
import type { Card } from '@/types'

export function useCard(id: string | null) {
  return useSWR<Card>(id ? `/api/cards/${id}` : null, {
    revalidateOnFocus: false,
  })
}
