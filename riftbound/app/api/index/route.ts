import { NextResponse } from 'next/server'
import { upstreamFetch } from '@/lib/api/server'

// The full card index can be large — cache aggressively
export async function GET() {
  try {
    const data = await upstreamFetch<unknown>('/index', 86400)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
      },
    })
  } catch (err) {
    console.error('[/api/index]', err)
    return NextResponse.json({ error: 'Failed to fetch index' }, { status: 502 })
  }
}
