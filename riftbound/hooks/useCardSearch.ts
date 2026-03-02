'use client'

import useSWR from 'swr'
import type { PaginatedCards } from '@/types'

export function useCardSearch(query: string, page = 1) {
  const trimmed = query.trim()
  // Enforce same 2-char minimum as the server route
  const key = trimmed.length >= 2
    ? `/api/cards/search?query=${encodeURIComponent(trimmed)}&size=24&page=${page}`
    : null
  return useSWR<PaginatedCards>(key, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })
}
