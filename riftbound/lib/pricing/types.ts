import type { Card, CardPrice } from '@/types'

/**
 * PriceProvider is the adapter interface any pricing backend must implement.
 * Swap providers by changing the export in lib/pricing/index.ts.
 */
export interface PriceProvider {
  /** Fetch price for a single card. */
  getPrice(card: Card): Promise<CardPrice>

  /**
   * Fetch prices for a batch of cards.
   * Implementations handle rate-limiting internally.
   */
  getPrices(cards: Card[]): Promise<Record<string, CardPrice>>

  /** Human-readable label shown in the UI ("Live" vs "Placeholder") */
  readonly label: string

  /** Whether prices are real-time or synthetic */
  readonly isLive: boolean
}
