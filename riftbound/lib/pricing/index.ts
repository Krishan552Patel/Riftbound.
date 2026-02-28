/**
 * SWAP POINT: Change this import to switch pricing providers.
 *
 * To use live Shopify prices, create lib/pricing/shopify.ts that implements
 * PriceProvider, then swap the import:
 *
 *   import { shopifyPriceProvider as activePriceProvider } from './shopify'
 */
export { placeholderPriceProvider as activePriceProvider, getCardPrice } from './placeholder'
export type { PriceProvider } from './types'

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
