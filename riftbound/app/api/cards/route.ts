import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.riftcodex.com'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString()
  try {
    const res = await fetch(`${BASE}/cards?${params}`, {
      next: { revalidate: 300 }, // 5-minute server-side cache
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}
