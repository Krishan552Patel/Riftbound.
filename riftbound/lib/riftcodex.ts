import type { Card, PaginatedCards, CardQueryParams, SetInfo } from '@/types'

const API_BASE = 'https://api.riftcodex.com'

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`Riftcodex API error: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export function buildCardQuery(params: CardQueryParams): string {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.size) q.set('size', String(params.size))
  if (params.sort) q.set('sort', params.sort)
  if (params.dir !== undefined) q.set('dir', String(params.dir))
  if (params.type) q.set('type', params.type)
  if (params.rarity) q.set('rarity', params.rarity)
  if (params.domain) q.set('domain', params.domain)
  if (params.set) q.set('set', params.set)
  return q.toString()
}

export async function fetchCards(params: CardQueryParams): Promise<PaginatedCards> {
  return apiFetch<PaginatedCards>(`/cards?${buildCardQuery(params)}`)
}

export async function fetchCard(id: string): Promise<Card> {
  return apiFetch<Card>(`/cards/${id}`)
}

export async function searchCards(query: string, size = 50): Promise<PaginatedCards> {
  return apiFetch<PaginatedCards>(`/cards/search?query=${encodeURIComponent(query)}&size=${size}`)
}

export async function fetchSets(): Promise<SetInfo[]> {
  return apiFetch<SetInfo[]>('/sets')
}

export async function fetchIndex(): Promise<Record<string, string[]>> {
  return apiFetch<Record<string, string[]>>('/index')
}
