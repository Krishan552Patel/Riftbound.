import type { Card, CardPrice } from '@/types'
import type { PriceProvider } from './types'

const RARITY_RANGES: Record<string, [number, number]> = {
  Common: [0.10, 0.50],
  Uncommon: [0.25, 2.00],
  Rare: [1.00, 10.00],
  Epic: [5.00, 30.00],
  Legendary: [20.00, 100.00],
}

/**
 * djb2 hash → float 0–1 (deterministic per seed string).
 * Same card always yields the same price — no randomness at runtime.
 */
function hashString(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i)
    h = h >>> 0 // keep unsigned 32-bit
  }
  return h / 0xffffffff
}

/**
 * Generate a deterministic placeholder price for a card.
 * Exported for synchronous use in components that can't await.
 */
export function getCardPrice(card: Card): CardPrice {
  const [lo, hi] = RARITY_RANGES[card.classification?.rarity ?? ''] ?? [0.10, 1.00]
  const h = hashString(card.id)
  const market = +(lo + h * (hi - lo)).toFixed(2)
  return {
    cardId: card.id,
    market,
    low: +(market * 0.8).toFixed(2),
    high: +(market * 1.3).toFixed(2),
    foil: +(market * 2.5).toFixed(2),
    source: 'placeholder',
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Placeholder PriceProvider adapter.
 * To swap in live Shopify prices: implement PriceProvider in a new file
 * and change the export in lib/pricing/index.ts.
 */
export const placeholderPriceProvider: PriceProvider = {
  label: 'Placeholder',
  isLive: false,

  async getPrice(card: Card): Promise<CardPrice> {
    return getCardPrice(card)
  },

  async getPrices(cards: Card[]): Promise<Record<string, CardPrice>> {
    return Object.fromEntries(cards.map((card) => [card.id, getCardPrice(card)]))
  },
}
