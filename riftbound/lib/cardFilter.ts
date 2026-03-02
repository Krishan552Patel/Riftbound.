import type { Card } from '@/types'

export interface CardFilters {
  query?: string
  type?: string
  rarity?: string
  domain?: string
  set?: string
}

export function isFilterActive(f: CardFilters): boolean {
  return !!(f.query?.trim() || f.type || f.rarity || f.domain || f.set)
}

export function filterCards(cards: Card[], f: CardFilters): Card[] {
  const q = f.query?.trim().toLowerCase()
  return cards.filter((c) => {
    if (q && !c.name.toLowerCase().includes(q)) return false
    if (f.type && c.classification?.type !== f.type) return false
    if (f.rarity && c.classification?.rarity !== f.rarity) return false
    if (f.domain && !c.classification?.domain?.includes(f.domain)) return false
    if (f.set && c.set?.set_id !== f.set) return false
    return true
  })
}

export function getFilterOptions(cards: Card[]) {
  const types = new Set<string>()
  const rarities = new Set<string>()
  const domains = new Set<string>()
  const sets = new Map<string, string>()

  for (const c of cards) {
    if (c.classification?.type) types.add(c.classification.type)
    if (c.classification?.rarity) rarities.add(c.classification.rarity)
    if (c.classification?.domain) {
      for (const d of c.classification.domain) domains.add(d)
    }
    if (c.set?.set_id) sets.set(c.set.set_id, c.set.label)
  }

  return {
    types: [...types].sort().map((v) => ({ value: v, label: v })),
    rarities: [...rarities].sort().map((v) => ({ value: v, label: v })),
    domains: [...domains].sort().map((v) => ({ value: v, label: v })),
    sets: [...sets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([v, label]) => ({ value: v, label })),
  }
}
