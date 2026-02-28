import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.riftcodex.com'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString()
  try {
    const res = await fetch(`${BASE}/cards/search?${params}`, {
      next: { revalidate: 60 }, // 1-minute cache for search results
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to search cards' }, { status: 500 })
  }
}
