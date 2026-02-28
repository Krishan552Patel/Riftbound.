'use client'

import useSWR from 'swr'
import type { PaginatedCards } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useCardSearch(query: string) {
  const trimmed = query.trim()
  const key = trimmed ? `/api/cards/search?query=${encodeURIComponent(trimmed)}&size=48` : null
  return useSWR<PaginatedCards>(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })
}
