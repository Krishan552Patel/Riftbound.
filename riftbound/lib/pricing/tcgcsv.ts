import type { Card, CardPrice } from '@/types'

// Maps Riftcodex set_id → TCGCSV groupId (Riftbound category = 89)
export const SET_TO_GROUP: Record<string, number> = {
  OGN: 24344, // Origins
  OGS: 24439, // Origins: Proving Grounds
  SFD: 24519, // Spiritforged
}

export interface TcgCsvPriceEntry {
  productId: number
  lowPrice: number | null
  midPrice: number | null
  highPrice: number | null
  marketPrice: number | null
  directLowPrice: number | null
  subTypeName: string
}

export type PriceMap = Record<string, { normal: TcgCsvPriceEntry | null; foil: TcgCsvPriceEntry | null }>

export function getGroupId(card: Card): number | null {
  return SET_TO_GROUP[card.set?.set_id ?? ''] ?? null
}

export function priceFromMap(card: Card, map: PriceMap): CardPrice | null {
  const entry = map[card.tcgplayer_id]
  if (!entry) return null

  const normal = entry.normal
  const foil = entry.foil
  if (!normal && !foil) return null

  return {
    cardId: card.id,
    market: normal?.marketPrice ?? 0,
    low: normal?.lowPrice ?? 0,
    high: normal?.highPrice ?? 0,
    foil: foil?.marketPrice ?? (normal?.marketPrice ?? 0) * 2.5,
    source: 'tcgcsv',
    lastUpdated: new Date().toISOString(),
  }
}
