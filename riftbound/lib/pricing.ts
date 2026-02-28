import type { Card, CardPrice } from '@/types'

const RARITY_RANGES: Record<string, [number, number]> = {
  Common: [0.10, 0.50],
  Uncommon: [0.25, 2.00],
  Rare: [1.00, 10.00],
  Epic: [5.00, 30.00],
  Legendary: [20.00, 100.00],
}

// djb2 hash → float 0–1 (deterministic per card ID)
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
 * To swap in real Shopify prices: implement the same CardPrice interface
 * and replace calls to getCardPrice() with your Shopify price fetcher.
 */
export function getCardPrice(card: Card): CardPrice {
  const [lo, hi] = RARITY_RANGES[card.classification.rarity] ?? [0.10, 1.00]
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

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
