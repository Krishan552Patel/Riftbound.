import { type NextRequest, NextResponse } from 'next/server'
import { upstreamFetch } from '@/lib/api/server'
import type { PaginatedCards } from '@/types'

// Allowlisted sort fields — prevents injection into upstream query
const ALLOWED_SORT = new Set(['name', 'collector_number', 'energy', 'might', 'power'])
const ALLOWED_DIR = new Set(['1', '-1'])

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  // Allowlist and validate all params before forwarding upstream
  const page = sp.get('page') ?? '1'
  const size = sp.get('size') ?? '24'
  const sort = sp.get('sort') ?? ''
  const dir = sp.get('dir') ?? ''
  const type = sp.get('type') ?? ''
  const rarity = sp.get('rarity') ?? ''
  const domain = sp.get('domain') ?? ''
  const set = sp.get('set') ?? ''

  const upstream = new URLSearchParams()
  upstream.set('page', String(Math.max(1, parseInt(page) || 1)))
  upstream.set('size', String(Math.min(100, Math.max(1, parseInt(size) || 24))))
  if (sort && ALLOWED_SORT.has(sort)) upstream.set('sort', sort)
  if (dir && ALLOWED_DIR.has(dir)) upstream.set('dir', dir)
  if (type) upstream.set('type', type)
  if (rarity) upstream.set('rarity', rarity)
  if (domain) upstream.set('domain', domain)
  if (set) upstream.set('set', set)

  try {
    const data = await upstreamFetch<PaginatedCards>(`/cards?${upstream.toString()}`, 300)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    console.error('[/api/cards]', err)
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 502 })
  }
}
