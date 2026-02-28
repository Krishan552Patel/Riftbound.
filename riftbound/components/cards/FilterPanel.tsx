'use client'

import type { CardQueryParams } from '@/types'

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
const TYPES = ['Unit', 'Spell', 'Legend', 'Equipment', 'Location']
const DOMAINS = ['Body', 'Calm', 'Order', 'Chaos', 'Spirit', 'Void']
const SORTS = [
  { value: '', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'energy', label: 'Energy' },
  { value: 'might', label: 'Might' },
  { value: 'power', label: 'Power' },
  { value: 'collector_number', label: 'Number' },
]

interface FilterPanelProps {
  filters: Partial<CardQueryParams>
  onChange: (filters: Partial<CardQueryParams>) => void
  sets?: { set_id: string; label: string }[]
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-400 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function FilterPanel({ filters, onChange, sets = [] }: FilterPanelProps) {
  const set = (key: keyof CardQueryParams, val: string) =>
    onChange({ ...filters, [key]: val || undefined, page: 1 })

  const setOptions = [
    { value: '', label: 'All Sets' },
    ...sets.map((s) => ({ value: s.set_id, label: s.label })),
  ]

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        label="Sort by"
        value={filters.sort ?? ''}
        onChange={(v) => onChange({ ...filters, sort: v || undefined, dir: v ? -1 : undefined, page: 1 })}
        options={SORTS}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-400">Order</label>
        <select
          value={filters.dir ?? -1}
          onChange={(e) => onChange({ ...filters, dir: Number(e.target.value), page: 1 })}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-400 transition-colors"
        >
          <option value={-1}>Desc</option>
          <option value={1}>Asc</option>
        </select>
      </div>
      <Select
        label="Rarity"
        value={filters.rarity ?? ''}
        onChange={(v) => set('rarity', v)}
        options={[{ value: '', label: 'All Rarities' }, ...RARITIES.map((r) => ({ value: r, label: r }))]}
      />
      <Select
        label="Type"
        value={filters.type ?? ''}
        onChange={(v) => set('type', v)}
        options={[{ value: '', label: 'All Types' }, ...TYPES.map((t) => ({ value: t, label: t }))]}
      />
      <Select
        label="Domain"
        value={filters.domain ?? ''}
        onChange={(v) => set('domain', v)}
        options={[{ value: '', label: 'All Domains' }, ...DOMAINS.map((d) => ({ value: d, label: d }))]}
      />
      <Select
        label="Set"
        value={filters.set ?? ''}
        onChange={(v) => set('set', v)}
        options={setOptions}
      />
    </div>
  )
}
