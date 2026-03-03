import type { Card } from '@/types'

export type StoreStatus = 'live' | 'buylink' | 'coming-soon'

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
    status: 'buylink',
    buyUrl: (card) =>
      `https://www.cardkingdom.com/catalog/search?search=${encodeURIComponent(card.name)}`,
  },
  {
    id: 'ebay',
    name: 'eBay',
    status: 'buylink',
    buyUrl: (card) =>
      `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name + ' Riftbound')}`,
  },
]
