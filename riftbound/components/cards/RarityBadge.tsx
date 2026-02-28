import { cn } from '@/lib/utils'

const RARITY_STYLES: Record<string, string> = {
  Common: 'bg-zinc-700 text-zinc-300',
  Uncommon: 'bg-emerald-900/60 text-emerald-400',
  Rare: 'bg-blue-900/60 text-blue-400',
  Epic: 'bg-purple-900/60 text-purple-400',
  Legendary: 'bg-amber-900/60 text-amber-400',
}

export default function RarityBadge({ rarity }: { rarity: string }) {
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-xs font-semibold',
        RARITY_STYLES[rarity] ?? 'bg-zinc-700 text-zinc-300'
      )}
    >
      {rarity}
    </span>
  )
}
