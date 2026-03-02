import type { Card } from '@/types'

export type StoreStatus = 'live' | 'coming-soon'

export interface StoreConfig {
  id: string
  name: string
  status: StoreStatus
  /** Returns a buy/search URL for the card, or null if not applicable */
  buyUrl: (card: Card) => string | null
}

export const STORES: StoreConfig[] = [
  {
    id: 'tcgplayer',
    name: 'TCGPlayer',
    status: 'live',
    buyUrl: (card) =>
      card.tcgplayer_id
        ? `https://www.tcgplayer.com/product/${card.tcgplayer_id}`
        : null,
  },
  {
    id: 'cardkingdom',
    name: 'Card Kingdom',
    status: 'coming-soon',
    buyUrl: () => null,
  },
  {
    id: 'ebay',
    name: 'eBay',
    status: 'coming-soon',
    buyUrl: (card) =>
      `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name + ' Riftbound')}`,
  },
]
