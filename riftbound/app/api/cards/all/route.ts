import { NextResponse } from 'next/server'
import { upstreamFetch } from '@/lib/api/server'
import type { Card, PaginatedCards } from '@/types'

export async function GET() {
  try {
    const first = await upstreamFetch<PaginatedCards>('/cards?size=100&page=1', 86400)
    const cards: Card[] = [...first.items]
    if (first.pages > 1) {
      const rest = await Promise.all(
        Array.from({ length: first.pages - 1 }, (_, i) =>
          upstreamFetch<PaginatedCards>(`/cards?size=100&page=${i + 2}`, 86400)
        )
      )
      for (const p of rest) cards.push(...p.items)
    }
    return NextResponse.json(cards, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800' },
    })
  } catch (err) {
    console.error('[/api/cards/all]', err)
    return NextResponse.json({ error: 'Failed to fetch all cards' }, { status: 502 })
  }
}
