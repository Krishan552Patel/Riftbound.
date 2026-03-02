'use client'

import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { Card } from '@/types'

const MAIN_DECK_TYPES = new Set(['Unit', 'Gear', 'Spell'])
const MIN_DECK_SIZE = 40
const MAX_COPIES = 3

interface DeckEntry {
  card: Card
  quantity: number
}

interface ValidationResult {
  violations: { level: 'error' | 'warning'; message: string }[]
  isLegal: boolean
}

export function validateDeck(
  entries: DeckEntry[],
  legendCard: Card | null
): ValidationResult {
  const violations: ValidationResult['violations'] = []

  // 1. Legend required
  if (!legendCard) {
    violations.push({ level: 'error', message: 'No Legend selected — required to build a legal deck' })
  }

  // Main deck cards only (exclude Legend/Battlefield from counts)
  const mainEntries = entries.filter((e) => MAIN_DECK_TYPES.has(e.card.classification?.type ?? ''))
  const totalMain = mainEntries.reduce((s, e) => s + e.quantity, 0)

  // 2. Deck size
  if (totalMain < MIN_DECK_SIZE) {
    violations.push({
      level: totalMain === 0 ? 'warning' : 'error',
      message: `Main deck has ${totalMain} card${totalMain !== 1 ? 's' : ''} — minimum is ${MIN_DECK_SIZE}`,
    })
  }

  // 3. 3-copy limit
  const overLimit = mainEntries.filter((e) => e.quantity > MAX_COPIES)
  if (overLimit.length > 0) {
    violations.push({
      level: 'error',
      message: `Exceeds 3-copy limit: ${overLimit.map((e) => `${e.card.name} (×${e.quantity})`).join(', ')}`,
    })
  }

  // 4. Wrong card type in main deck
  const wrongType = entries.filter((e) => !MAIN_DECK_TYPES.has(e.card.classification?.type ?? ''))
  if (wrongType.length > 0) {
    violations.push({
      level: 'error',
      message: `Cards not allowed in main deck: ${wrongType.map((e) => e.card.name).join(', ')}`,
    })
  }

  // 5. Domain violations (only if legend is set)
  if (legendCard) {
    const legendDomains = new Set(legendCard.classification?.domain ?? [])
    const illegal = mainEntries.filter((e) => {
      const domains = e.card.classification?.domain ?? []
      if (domains.length === 0) return false // neutral/colorless cards are always legal
      return !domains.some((d) => legendDomains.has(d))
    })
    if (illegal.length > 0) {
      const names = illegal.map((e) => e.card.name)
      const preview = names.slice(0, 3).join(', ')
      const extra = names.length > 3 ? ` +${names.length - 3} more` : ''
      violations.push({
        level: 'error',
        message: `Domain violation: ${preview}${extra}`,
      })
    }
  }

  return {
    violations,
    isLegal: violations.every((v) => v.level !== 'error'),
  }
}

interface DeckValidatorProps {
  entries: DeckEntry[]
  legendCard: Card | null
}

export default function DeckValidator({ entries, legendCard }: DeckValidatorProps) {
  const { violations, isLegal } = validateDeck(entries, legendCard)
  const totalMain = entries
    .filter((e) => MAIN_DECK_TYPES.has(e.card.classification?.type ?? ''))
    .reduce((s, e) => s + e.quantity, 0)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Header with deck size progress */}
      <div className="px-3 py-2.5 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-zinc-400">Deck Size</span>
          <span className={`text-xs font-bold ${totalMain >= MIN_DECK_SIZE ? 'text-emerald-400' : 'text-amber-400'}`}>
            {totalMain} / {MIN_DECK_SIZE}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              totalMain >= MIN_DECK_SIZE ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(100, (totalMain / MIN_DECK_SIZE) * 100)}%` }}
          />
        </div>
      </div>

      {/* Validation status */}
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
                {v.level === 'error' ? (
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400 mt-0.5" />
                )}
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
