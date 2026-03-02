'use client'

import { ExternalLink } from 'lucide-react'
import { formatPrice } from '@/lib/pricing'
import { STORES } from '@/lib/pricing/stores'
import type { Card, CardPrice } from '@/types'

interface Props {
  card: Card
  tcgPrice: CardPrice | null
}

function getStorePrice(storeId: string, tcgPrice: CardPrice | null): CardPrice | null {
  // As new stores are wired up, add their cases here
  if (storeId === 'tcgplayer') return tcgPrice
  return null
}

export default function PriceComparisonTable({ card, tcgPrice }: Props) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h2 className="font-semibold text-white">Store Prices</h2>
      </div>

      {/* Header row */}
      <div className="hidden sm:grid grid-cols-[10rem_1fr_auto] gap-4 px-4 py-2 border-b border-zinc-800/60">
        <span className="text-xs font-medium text-zinc-500">Store</span>
        <div className="grid grid-cols-4 gap-4 text-xs font-medium text-zinc-500">
          <span>Market</span>
          <span>Low</span>
          <span>High</span>
          <span>Foil</span>
        </div>
        <span className="w-14" />
      </div>

      <div className="divide-y divide-zinc-800">
        {STORES.map((store) => {
          const price = getStorePrice(store.id, tcgPrice)
          const url = store.buyUrl(card)
          const isLive = store.status === 'live'

          return (
            <div
              key={store.id}
              className="flex flex-col gap-2 px-4 py-3 sm:grid sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-4"
            >
              {/* Store name + status */}
              <div>
                <p className={`text-sm font-medium ${isLive ? 'text-white' : 'text-zinc-500'}`}>
                  {store.name}
                </p>
                {isLive ? (
                  <span className="text-xs text-emerald-400">● Live</span>
                ) : (
                  <span className="text-xs text-zinc-600">Coming soon</span>
                )}
              </div>

              {/* Price columns */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className={`font-bold ${isLive ? 'text-amber-400' : 'text-zinc-700'}`}>
                    {price ? formatPrice(price.market) : '—'}
                  </p>
                  <p className="text-xs text-zinc-500 sm:hidden">Market</p>
                </div>
                <div>
                  <p className={isLive ? 'text-zinc-300' : 'text-zinc-700'}>
                    {price ? formatPrice(price.low) : '—'}
                  </p>
                  <p className="text-xs text-zinc-500 sm:hidden">Low</p>
                </div>
                <div>
                  <p className={isLive ? 'text-zinc-300' : 'text-zinc-700'}>
                    {price ? formatPrice(price.high) : '—'}
                  </p>
                  <p className="text-xs text-zinc-500 sm:hidden">High</p>
                </div>
                <div>
                  <p className={isLive ? 'text-zinc-300' : 'text-zinc-700'}>
                    {price ? formatPrice(price.foil) : '—'}
                  </p>
                  <p className="text-xs text-zinc-500 sm:hidden">Foil</p>
                </div>
              </div>

              {/* Buy link */}
              <div className="flex justify-end w-14">
                {isLive && url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-md bg-amber-400 px-2.5 py-1 text-xs font-medium text-zinc-900 hover:bg-amber-300 transition-colors"
                  >
                    Buy <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
