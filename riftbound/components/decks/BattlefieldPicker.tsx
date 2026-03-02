'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, X } from 'lucide-react'
import type { Card } from '@/types'

const MAX_BATTLEFIELDS = 3

interface BattlefieldPickerProps {
  battlefieldCards: Card[]
  selectedIds: string[]
  onToggle: (cardId: string) => void
}

export default function BattlefieldPicker({ battlefieldCards, selectedIds, onToggle }: BattlefieldPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = battlefieldCards.filter((c) => selectedIds.includes(c.id))
  const isFull = selectedIds.length >= MAX_BATTLEFIELDS

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800/40 transition-colors"
      >
        <span>
          Battlefields
          <span className={`ml-2 text-xs font-normal ${selectedIds.length === MAX_BATTLEFIELDS ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {selectedIds.length} / {MAX_BATTLEFIELDS}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected battlefields */}
      {selected.length > 0 && (
        <div className="flex gap-2 px-3 py-2 border-t border-zinc-800 flex-wrap">
          {selected.map((c) => (
            <div key={c.id} className="group relative">
              <div className="relative h-16 w-11 overflow-hidden rounded border border-zinc-700">
                {c.media?.image_url ? (
                  <Image src={c.media.image_url} alt={c.name} fill sizes="44px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-zinc-800 text-[9px] text-zinc-500 text-center px-1">{c.name}</div>
                )}
              </div>
              <button
                onClick={() => onToggle(c.id)}
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-2.5 w-2.5" />
              </button>
              <p className="mt-0.5 w-11 truncate text-center text-[9px] text-zinc-400">{c.name}</p>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: MAX_BATTLEFIELDS - selected.length }).map((_, i) => (
            <div key={i} className="h-16 w-11 rounded border border-dashed border-zinc-700 flex items-center justify-center text-zinc-700 text-lg">+</div>
          ))}
        </div>
      )}

      {/* Picker list */}
      {open && (
        <div className="border-t border-zinc-800 max-h-52 overflow-y-auto divide-y divide-zinc-800/50">
          {battlefieldCards.length === 0 ? (
            <p className="px-3 py-3 text-xs text-zinc-500">Loading battlefields…</p>
          ) : (
            battlefieldCards.map((c) => {
              const isSelected = selectedIds.includes(c.id)
              const disabled = !isSelected && isFull
              return (
                <button
                  key={c.id}
                  onClick={() => { if (!disabled) { onToggle(c.id); if (!isSelected && selectedIds.length + 1 === MAX_BATTLEFIELDS) setOpen(false) } }}
                  disabled={disabled}
                  className={[
                    'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
                    isSelected ? 'bg-amber-900/20' : disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-800/40',
                  ].join(' ')}
                >
                  {c.media?.image_url && (
                    <div className="relative h-8 w-6 flex-shrink-0 overflow-hidden rounded">
                      <Image src={c.media.image_url} alt={c.name} fill sizes="24px" className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-zinc-100">{c.name}</p>
                    <p className="text-[10px] text-zinc-500">{c.set?.label} · {c.public_code}</p>
                  </div>
                  {isSelected && <span className="text-xs text-amber-400">✓</span>}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
