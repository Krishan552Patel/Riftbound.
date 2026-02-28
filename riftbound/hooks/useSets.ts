'use client'

import useSWR from 'swr'
import type { SetInfo } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useSets() {
  return useSWR<SetInfo[]>('/api/sets', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 86400 * 1000,
  })
}
