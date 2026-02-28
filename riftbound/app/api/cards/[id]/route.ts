import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.riftcodex.com'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const res = await fetch(`${BASE}/cards/${id}`, {
      next: { revalidate: 3600 }, // 1-hour cache for individual cards
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Card not found' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch card' }, { status: 500 })
  }
}
