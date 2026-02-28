import { type NextRequest, NextResponse } from 'next/server'
import { upstreamFetch } from '@/lib/api/server'
import type { PaginatedCards } from '@/types'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query') ?? ''
  const size = req.nextUrl.searchParams.get('size') ?? '50'

  if (query.trim().length < 2) {
    return NextResponse.json({ items: [], total: 0, page: 1, size: 0, pages: 0 })
  }

  const upstream = new URLSearchParams({
    query: query.trim(),
    size: String(Math.min(100, Math.max(1, parseInt(size) || 50))),
  })

  try {
    const data = await upstreamFetch<PaginatedCards>(
      `/cards/search?${upstream.toString()}`,
      60,
    )
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error('[/api/cards/search]', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 502 })
  }
}
