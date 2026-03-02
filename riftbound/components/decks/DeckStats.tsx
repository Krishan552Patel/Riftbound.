'use client'

import type { Card } from '@/types'

interface DeckEntry {
  card: Card
  quantity: number
}

interface DeckStatsProps {
  entries: DeckEntry[]
}

export default function DeckStats({ entries }: DeckStatsProps) {
  const totalCards = entries.reduce((s, e) => s + e.quantity, 0)
  if (totalCards === 0) return null

  // Energy curve
  const energyCounts: Record<string, number> = {}
  for (const { card, quantity } of entries) {
    const e = card.attributes?.energy
    const key = e == null ? '—' : e >= 7 ? '7+' : String(e)
    energyCounts[key] = (energyCounts[key] ?? 0) + quantity
  }
  const energyOrder = ['0', '1', '2', '3', '4', '5', '6', '7+', '—']
  const energyKeys = energyOrder.filter((k) => energyCounts[k])
  const maxEnergy = Math.max(...Object.values(energyCounts), 1)

  // Type breakdown
  const typeCounts: Record<string, number> = {}
  for (const { card, quantity } of entries) {
    const t = card.classification?.type ?? 'Unknown'
    typeCounts[t] = (typeCounts[t] ?? 0) + quantity
  }
  const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])

  // Domain breakdown
  const domainCounts: Record<string, number> = {}
  for (const { card, quantity } of entries) {
    for (const d of card.classification?.domain ?? []) {
      domainCounts[d] = (domainCounts[d] ?? 0) + quantity
    }
  }
  const domainEntries = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      {/* Energy curve */}
      {energyKeys.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Energy Curve
          </p>
          <div className="space-y-1">
            {energyKeys.map((k) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-5 text-right text-xs text-zinc-500">{k}</span>
                <div className="flex-1 h-3 rounded bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded bg-amber-400/70 transition-all"
                    style={{ width: `${((energyCounts[k] ?? 0) / maxEnergy) * 100}%` }}
                  />
                </div>
                <span className="w-4 text-right text-xs text-zinc-400">
                  {energyCounts[k]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Type breakdown */}
      {typeEntries.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Card Types
          </p>
          <div className="space-y-1">
            {typeEntries.map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <span className="w-16 truncate text-zinc-400">{type}</span>
                <div className="flex-1 h-2 rounded bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded bg-zinc-500 transition-all"
                    style={{ width: `${(count / totalCards) * 100}%` }}
                  />
                </div>
                <span className="w-4 text-right text-zinc-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domain breakdown */}
      {domainEntries.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Domains
          </p>
          <div className="flex flex-wrap gap-1.5">
            {domainEntries.map(([domain, count]) => (
              <span
                key={domain}
                className="rounded-full bg-amber-900/30 px-2 py-0.5 text-xs text-amber-300"
              >
                {domain} ×{count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
