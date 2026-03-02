'use client'

import useSWR from 'swr'
import type { SetInfo } from '@/types'

export function useSets() {
  return useSWR<SetInfo[]>('/api/sets', {
    revalidateOnFocus: false,
    dedupingInterval: 86400 * 1000,
  })
}
