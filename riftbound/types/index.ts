export interface CardAttributes {
  energy: number | null
  might: number | null
  power: number | null
}

export interface CardClassification {
  type: string
  supertype: string | null
  rarity: string
  domain: string[]
}

export interface CardText {
  rich: string
  plain: string
}

export interface CardSet {
  set_id: string
  label: string
}

export interface CardMedia {
  image_url: string
  artist: string
  accessibility_text: string
}

export interface CardMetadata {
  clean_name: string
  alternate_art: boolean
  overnumbered: boolean
  signature: boolean
}

export interface Card {
  id: string
  name: string
  riftbound_id: string
  tcgplayer_id: string
  public_code: string
  collector_number: number
  attributes: CardAttributes
  classification: CardClassification
  text: CardText
  set: CardSet
  media: CardMedia
  tags: string[]
  orientation: string
  metadata: CardMetadata
}

export interface PaginatedCards {
  items: Card[]
  total: number
  page: number
  size: number
  pages: number
}

export interface SetInfo {
  set_id: string
  label: string
  total_cards?: number
}

// Pricing — adapter interface so Shopify prices can replace placeholder later
export interface CardPrice {
  cardId: string
  market: number
  low: number
  high: number
  foil: number
  source: 'placeholder' | 'shopify' | 'tcgcsv'
  lastUpdated: string
}

// Collection
export interface CollectionEntry {
  cardId: string
  quantity: number
  foilQuantity: number
  addedAt: string
}

export type Collection = Record<string, CollectionEntry>

// Decks
export interface DeckCard {
  cardId: string
  quantity: number
}

export interface Deck {
  id: string
  name: string
  description: string
  /** Main deck — min 40, max 3 copies of any card (combined with sideboard) */
  cards: DeckCard[]
  /** Sideboard — exactly 0 or 8 cards, shares 3-copy limit with main deck */
  sideboard?: DeckCard[]
  /** Maybeboard — scratchpad with no copy/size limits */
  maybeboard?: DeckCard[]
  legendId?: string
  battlefieldIds?: string[]
  createdAt: string
  updatedAt: string
}

// Filter / query params
export interface CardQueryParams {
  page?: number
  size?: number
  sort?: string
  dir?: number
  type?: string
  rarity?: string
  domain?: string
  set?: string
}
