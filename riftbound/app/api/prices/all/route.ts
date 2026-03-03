import { NextResponse } from 'next/server'
import { SET_TO_GROUP, type TcgCsvPriceEntry, type PriceMap } from '@/lib/pricing/tcgcsv'

export async function GET() {
  try {
    const groups = Object.values(SET_TO_GROUP)

    const results = await Promise.all(
      groups.map((gid) =>
        fetch(`https://tcgcsv.com/tcgplayer/89/${gid}/prices`, {
          next: { revalidate: 3600 },
          headers: { 'User-Agent': 'riftbound-tracker/1.0' },
        }).then((r) => {
          if (!r.ok) throw new Error(`TCGCSV ${r.status} for group ${gid}`)
          return r.json() as Promise<{ results: TcgCsvPriceEntry[] }>
        })
      )
    )

    const merged: PriceMap = {}
    for (const result of results) {
      for (const entry of result.results ?? []) {
        const id = String(entry.productId)
        if (!merged[id]) merged[id] = { normal: null, foil: null }
        if (entry.subTypeName === 'Foil') {
          merged[id].foil = entry
        } else {
          merged[id].normal = entry
        }
      }
    }

    return NextResponse.json(merged, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (err) {
    console.error('[/api/prices/all]', err)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 502 })
  }
}
