'use client'

import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { Card } from '@/types'

export const MAIN_DECK_TYPES = new Set(['Unit', 'Gear', 'Spell'])
const MIN_DECK_SIZE = 40
const MAX_COPIES = 3
const SIDEBOARD_SIZE = 8

export interface DeckEntry {
  card: Card
  quantity: number
}

interface ValidationResult {
  violations: { level: 'error' | 'warning'; message: string }[]
  isLegal: boolean
}

export function validateDeck(
  mainEntries: DeckEntry[],
  sideEntries: DeckEntry[],
  legendCard: Card | null
): ValidationResult {
  const violations: ValidationResult['violations'] = []

  // 1. Legend required
  if (!legendCard) {
    violations.push({ level: 'error', message: 'No Legend selected — required to build a legal deck' })
  }

  const totalMain = mainEntries.reduce((s, e) => s + e.quantity, 0)
  const totalSide = sideEntries.reduce((s, e) => s + e.quantity, 0)

  // 2. Main deck size
  if (totalMain < MIN_DECK_SIZE) {
    violations.push({
      level: totalMain === 0 ? 'warning' : 'error',
      message: `Main deck has ${totalMain} card${totalMain !== 1 ? 's' : ''} — minimum is ${MIN_DECK_SIZE}`,
    })
  }

  // 3. Sideboard must be exactly 0 or 8
  if (totalSide > 0 && totalSide !== SIDEBOARD_SIZE) {
    violations.push({
      level: 'error',
      message: `Sideboard has ${totalSide} card${totalSide !== 1 ? 's' : ''} — must be exactly 0 or ${SIDEBOARD_SIZE}`,
    })
  }

  // 4. Combined 3-copy limit (main + sideboard)
  const combinedMap = new Map<string, { name: string; total: number }>()
  for (const { card, quantity } of [...mainEntries, ...sideEntries]) {
    const prev = combinedMap.get(card.id) ?? { name: card.name, total: 0 }
    combinedMap.set(card.id, { name: card.name, total: prev.total + quantity })
  }
  const overLimit = [...combinedMap.values()].filter((v) => v.total > MAX_COPIES)
  if (overLimit.length > 0) {
    violations.push({
      level: 'error',
      message: `Exceeds 3-copy limit (main + side): ${overLimit.map((v) => `${v.name} (×${v.total})`).join(', ')}`,
    })
  }

  // 5. Domain violations in main deck and sideboard
  if (legendCard) {
    const legendDomains = new Set(legendCard.classification?.domain ?? [])
    const checkIllegal = (entries: DeckEntry[]) =>
      entries.filter((e) => {
        const domains = e.card.classification?.domain ?? []
        return domains.length > 0 && !domains.some((d) => legendDomains.has(d))
      })

    const illegalMain = checkIllegal(mainEntries)
    const illegalSide = checkIllegal(sideEntries)
    const illegal = [...illegalMain, ...illegalSide]

    if (illegal.length > 0) {
      const names = illegal.map((e) => e.card.name)
      const preview = names.slice(0, 3).join(', ')
      const extra = names.length > 3 ? ` +${names.length - 3} more` : ''
      violations.push({ level: 'error', message: `Domain violation: ${preview}${extra}` })
    }
  }

  return {
    violations,
    isLegal: violations.every((v) => v.level !== 'error'),
  }
}

interface DeckValidatorProps {
  mainEntries: DeckEntry[]
  sideEntries: DeckEntry[]
  legendCard: Card | null
}

export default function DeckValidator({ mainEntries, sideEntries, legendCard }: DeckValidatorProps) {
  const { violations } = validateDeck(mainEntries, sideEntries, legendCard)
  const totalMain = mainEntries.reduce((s, e) => s + e.quantity, 0)
  const totalSide = sideEntries.reduce((s, e) => s + e.quantity, 0)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Main deck progress */}
      <div className="px-3 pt-2.5 pb-2 border-b border-zinc-800 space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400">Main Deck</span>
            <span className={`text-xs font-bold ${totalMain >= MIN_DECK_SIZE ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalMain} / {MIN_DECK_SIZE}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalMain >= MIN_DECK_SIZE ? 'bg-emerald-500' : 'bg-amber-400'}`}
              style={{ width: `${Math.min(100, (totalMain / MIN_DECK_SIZE) * 100)}%` }}
            />
          </div>
        </div>

        {/* Sideboard progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400">Sideboard</span>
            <span className={`text-xs font-bold ${
              totalSide === 0 ? 'text-zinc-500'
              : totalSide === SIDEBOARD_SIZE ? 'text-emerald-400'
              : 'text-amber-400'
            }`}>
              {totalSide} / {SIDEBOARD_SIZE}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalSide === SIDEBOARD_SIZE ? 'bg-emerald-500' : 'bg-amber-400'}`}
              style={{ width: `${Math.min(100, (totalSide / SIDEBOARD_SIZE) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Violations */}
      <div className="px-3 py-2.5">
        {violations.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Deck is legal</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {violations.map((v, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {v.level === 'error'
                  ? <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-400 mt-0.5" />
                  : <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400 mt-0.5" />
                }
                <span className={v.level === 'error' ? 'text-red-300' : 'text-amber-300'}>
                  {v.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
