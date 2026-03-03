'use client'

import useSWR from 'swr'
import type { PriceMap } from '@/lib/pricing/tcgcsv'

export function useAllPrices() {
  return useSWR<PriceMap>('/api/prices/all', {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000, // 1 hour
  })
}
