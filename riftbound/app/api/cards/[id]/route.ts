import { type NextRequest, NextResponse } from 'next/server'
import { upstreamFetch } from '@/lib/api/server'
import type { Card } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const data = await upstreamFetch<Card>(`/cards/${id}`, 3600)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error(`[/api/cards/${id}]`, err)
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }
}
