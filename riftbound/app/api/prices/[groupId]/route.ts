import { type NextRequest, NextResponse } from 'next/server'
import type { TcgCsvPriceEntry, PriceMap } from '@/lib/pricing/tcgcsv'

// All known Riftbound group IDs on TCGCSV (category 89)
const ALLOWED_GROUPS = new Set([24344, 24439, 24519, 24343, 24528, 24552, 24502, 24560])

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params
  const gid = parseInt(groupId)

  if (isNaN(gid) || !ALLOWED_GROUPS.has(gid)) {
    return NextResponse.json({ error: 'Unknown group' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://tcgcsv.com/tcgplayer/89/${gid}/prices`, {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'riftbound-tracker/1.0' },
    })
    if (!res.ok) throw new Error(`TCGCSV ${res.status}`)

    const raw = await res.json() as { results: TcgCsvPriceEntry[] }
    const entries: TcgCsvPriceEntry[] = raw.results ?? []

    // Build a map keyed by productId string → { normal, foil }
    const map: PriceMap = {}
    for (const entry of entries) {
      const id = String(entry.productId)
      if (!map[id]) map[id] = { normal: null, foil: null }
      if (entry.subTypeName === 'Foil') {
        map[id].foil = entry
      } else {
        map[id].normal = entry
      }
    }

    return NextResponse.json(map, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (err) {
    console.error('[/api/prices]', err)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 502 })
  }
}
