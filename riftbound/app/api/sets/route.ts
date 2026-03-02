import { NextResponse } from 'next/server'
import { upstreamFetch } from '@/lib/api/server'
import type { SetInfo } from '@/types'

export async function GET() {
  try {
    const data = await upstreamFetch<{ items: SetInfo[] }>('/sets', 86400)
    return NextResponse.json(data.items, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
      },
    })
  } catch (err) {
    console.error('[/api/sets]', err)
    return NextResponse.json({ error: 'Failed to fetch sets' }, { status: 502 })
  }
}
