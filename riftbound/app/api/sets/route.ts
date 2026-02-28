import { NextResponse } from 'next/server'

const BASE = 'https://api.riftcodex.com'

export async function GET() {
  try {
    const res = await fetch(`${BASE}/sets`, {
      next: { revalidate: 86400 }, // 24-hour cache for sets
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=172800',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sets' }, { status: 500 })
  }
}
