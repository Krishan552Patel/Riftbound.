'use client'

import useSWR from 'swr'
import type { CardQueryParams, PaginatedCards } from '@/types'

function buildQuery(params: CardQueryParams): string {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  q.set('size', String(params.size ?? 24))
  if (params.sort) q.set('sort', params.sort)
  if (params.dir !== undefined) q.set('dir', String(params.dir))
  if (params.type) q.set('type', params.type)
  if (params.rarity) q.set('rarity', params.rarity)
  if (params.domain) q.set('domain', params.domain)
  if (params.set) q.set('set', params.set)
  return q.toString()
}

export function useCards(params: CardQueryParams | null) {
  const key = params ? `/api/cards?${buildQuery(params)}` : null
  return useSWR<PaginatedCards>(key, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })
}
