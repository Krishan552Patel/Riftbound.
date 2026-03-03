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
  if (storeId === 'tcgplayer') return tcgPrice
  return null
}

export default function PriceComparisonTable({ card, tcgPrice }: Props) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h2 className="font-semibold text-white">Store Prices</h2>
        {tcgPrice?.source === 'tcgcsv' && (
          <span className="text-xs text-emerald-400">● Live from TCGPlayer</span>
        )}
      </div>

      {/* Header row */}
      <div className="hidden sm:grid grid-cols-[10rem_1fr_auto] gap-4 px-4 py-2 border-b border-zinc-800/60 bg-zinc-950/30">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Store</span>
        <div className="grid grid-cols-4 gap-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">
          <span>Market</span>
          <span>Low</span>
          <span>High</span>
          <span>Foil</span>
        </div>
        <span className="w-16" />
      </div>

      <div className="divide-y divide-zinc-800">
        {STORES.map((store) => {
          const price = getStorePrice(store.id, tcgPrice)
          const url = store.buyUrl(card)
          const isLive = store.status === 'live'
          const isBuyLink = store.status === 'buylink'

          return (
            <div
              key={store.id}
              className="flex flex-col gap-2 px-4 py-3 sm:grid sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-4"
            >
              {/* Store name + status */}
              <div>
                <p className={`text-sm font-medium ${isLive ? 'text-white' : isBuyLink ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {store.name}
                </p>
                {isLive ? (
                  <span className="text-xs text-emerald-400">● Live prices</span>
                ) : isBuyLink ? (
                  <span className="text-xs text-zinc-500">Search only</span>
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

              {/* Buy / Search link */}
              <div className="flex justify-end w-16">
                {url && (isLive || isBuyLink) ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      isLive
                        ? 'bg-amber-400 text-zinc-900 hover:bg-amber-300'
                        : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    {isLive ? 'Buy' : 'Search'} <ExternalLink className="h-3 w-3" />
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
