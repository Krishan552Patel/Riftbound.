'use client'

export const PRICE_SORTS = new Set(['price-asc', 'price-desc'])

const SORTS = [
  { value: '', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'energy', label: 'Energy' },
  { value: 'might', label: 'Might' },
  { value: 'power', label: 'Power' },
  { value: 'collector_number', label: 'Number' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
]

export interface PanelFilters {
  type?: string
  rarity?: string
  domain?: string
  set?: string
  sort?: string
  dir?: number
}

interface DropdownOption {
  value: string
  label: string
}

export interface FilterOptions {
  types: DropdownOption[]
  rarities: DropdownOption[]
  domains: DropdownOption[]
  sets: DropdownOption[]
}

interface FilterPanelProps {
  filters: PanelFilters
  onChange: (filters: PanelFilters) => void
  options?: FilterOptions
  showSort?: boolean
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
  options: DropdownOption[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-400 transition-colors"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function FilterPanel({ filters, onChange, options, showSort = true }: FilterPanelProps) {
  const isPriceSort = PRICE_SORTS.has(filters.sort ?? '')

  return (
    <div className="flex flex-wrap gap-3">
      {options && (
        <>
          <Select
            label="Type"
            value={filters.type ?? ''}
            onChange={(v) => onChange({ ...filters, type: v || undefined })}
            options={options.types}
          />
          <Select
            label="Rarity"
            value={filters.rarity ?? ''}
            onChange={(v) => onChange({ ...filters, rarity: v || undefined })}
            options={options.rarities}
          />
          <Select
            label="Domain"
            value={filters.domain ?? ''}
            onChange={(v) => onChange({ ...filters, domain: v || undefined })}
            options={options.domains}
          />
          <Select
            label="Set"
            value={filters.set ?? ''}
            onChange={(v) => onChange({ ...filters, set: v || undefined })}
            options={options.sets}
          />
        </>
      )}
      {showSort && (
        <>
          <Select
            label="Sort by"
            value={filters.sort ?? ''}
            onChange={(v) => onChange({ ...filters, sort: v || undefined, dir: v ? -1 : undefined })}
            options={SORTS}
          />
          {/* Direction dropdown only applies to server-side sorts */}
          {!isPriceSort && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-400">Order</label>
              <select
                value={filters.dir ?? -1}
                onChange={(e) => onChange({ ...filters, dir: Number(e.target.value) })}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-400 transition-colors"
              >
                <option value={-1}>Desc</option>
                <option value={1}>Asc</option>
              </select>
            </div>
          )}
        </>
      )}
    </div>
  )
}
