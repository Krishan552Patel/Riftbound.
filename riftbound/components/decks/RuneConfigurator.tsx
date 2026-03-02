'use client'

import { Plus, Minus } from 'lucide-react'

const TOTAL_RUNES = 12

interface RuneConfiguratorProps {
  domains: string[]          // the 2 domains from the legend, e.g. ['Fury', 'Order']
  runes: Record<string, number>
  onChange: (runes: Record<string, number>) => void
}

export default function RuneConfigurator({ domains, runes, onChange }: RuneConfiguratorProps) {
  const total = domains.reduce((s, d) => s + (runes[d] ?? 0), 0)
  const remaining = TOTAL_RUNES - total

  function adjust(domain: string, delta: number) {
    const current = runes[domain] ?? 0
    const next = Math.max(0, Math.min(TOTAL_RUNES, current + delta))
    // Don't exceed 12 total
    if (delta > 0 && total >= TOTAL_RUNES) return
    onChange({ ...runes, [domain]: next })
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
        <span className="text-sm font-semibold text-white">Rune Deck</span>
        <span className={`text-xs font-bold ${total === TOTAL_RUNES ? 'text-emerald-400' : 'text-amber-400'}`}>
          {total} / {TOTAL_RUNES}
        </span>
      </div>

      <div className="px-3 py-3 space-y-3">
        {domains.map((domain) => {
          const count = runes[domain] ?? 0
          return (
            <div key={domain} className="flex items-center gap-3">
              <span className="w-16 text-xs font-medium text-zinc-300 truncate">{domain}</span>

              {/* Rune pips */}
              <div className="flex flex-1 gap-0.5">
                {Array.from({ length: TOTAL_RUNES }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-sm transition-colors ${i < count ? 'bg-amber-400' : 'bg-zinc-800'}`}
                  />
                ))}
              </div>

              {/* +/- controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => adjust(domain, -1)}
                  disabled={count === 0}
                  className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-xs font-bold text-amber-400">{count}</span>
                <button
                  onClick={() => adjust(domain, 1)}
                  disabled={total >= TOTAL_RUNES}
                  className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          )
        })}

        {/* Remaining runes hint */}
        {remaining > 0 && (
          <p className="text-[10px] text-zinc-600">
            {remaining} rune{remaining !== 1 ? 's' : ''} unassigned
          </p>
        )}

        {/* Quick presets */}
        {domains.length === 2 && (
          <div className="flex gap-1.5 flex-wrap pt-1">
            {[
              [6, 6], [7, 5], [5, 7], [8, 4], [4, 8], [9, 3], [3, 9],
            ].map(([a, b]) => {
              const active = (runes[domains[0]] ?? 0) === a && (runes[domains[1]] ?? 0) === b
              return (
                <button
                  key={`${a}-${b}`}
                  onClick={() => onChange({ [domains[0]]: a, [domains[1]]: b })}
                  className={[
                    'rounded px-2 py-0.5 text-[10px] transition-colors',
                    active ? 'bg-amber-400 text-zinc-900 font-bold' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
                  ].join(' ')}
                >
                  {a}/{b}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
