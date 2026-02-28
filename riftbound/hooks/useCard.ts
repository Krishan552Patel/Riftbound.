'use client'

import useSWR from 'swr'
import type { Card } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useCard(id: string | null) {
  return useSWR<Card>(id ? `/api/cards/${id}` : null, fetcher, {
    revalidateOnFocus: false,
  })
}
