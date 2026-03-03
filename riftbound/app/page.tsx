'use client'

import Link from 'next/link'
import { BookOpen, Layers, Library, Swords, ArrowRight, TrendingUp } from 'lucide-react'
import { useAllCards } from '@/hooks/useAllCards'
import { useMemo } from 'react'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
      <div className="text-3xl font-bold text-amber-400">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="mt-1 text-sm text-zinc-400">{label}</div>
    </div>
  )
}

const FEATURE_CARDS = [
  {
    href: '/cards',
    icon: Layers,
    title: 'Browse Cards',
    description: 'Search and filter all Riftbound cards. Track prices across multiple stores.',
  },
  {
    href: '/collection',
    icon: Library,
    title: 'My Collection',
    description: 'Keep track of cards you own and monitor your collection value.',
  },
  {
    href: '/decks',
    icon: Swords,
    title: 'Deck Builder',
    description: 'Build and manage decks with full rule validation and sideboard support.',
  },
]

export default function HomePage() {
  const { data: allCards } = useAllCards()

  const stats = useMemo(() => {
    if (!allCards) return null
    const sets = new Set(allCards.map((c) => c.set?.set_id).filter(Boolean))
    return {
      cards: allCards.length,
      sets: sets.size,
    }
  }, [allCards])

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 pt-16 text-center">
        <div className="flex items-center gap-3">
          <BookOpen className="h-10 w-10 text-amber-400" />
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="text-amber-400">Rift</span>
            <span className="text-white">Codex</span>
          </h1>
        </div>
        <p className="max-w-xl text-lg text-zinc-400">
          The all-in-one tracker for Riftbound TCG — browse every card, compare prices across
          stores, build decks, and manage your collection.
        </p>
        <Link
          href="/cards"
          className="flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          Browse All Cards <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total Cards" value={stats?.cards ?? '—'} />
        <StatCard label="Sets" value={stats?.sets ?? '—'} />
        <StatCard label="Price Stores" value={3} />
      </section>

      {/* Feature nav cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURE_CARDS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-amber-400/40 hover:bg-zinc-800"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-400/10 p-2">
                <Icon className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="font-semibold text-white">{title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
            <div className="mt-auto flex items-center gap-1 text-xs font-medium text-amber-400 opacity-0 transition-opacity group-hover:opacity-100">
              Get started <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </section>

      {/* Latest activity teaser */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <TrendingUp className="h-4 w-4 text-amber-400" />
          <span>Price tracking across multiple stores</span>
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          Compare card prices from TCGPlayer, Card Kingdom, and more. Find the best deals for
          your collection and deck builds.
        </p>
        <Link
          href="/cards"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-400 hover:text-amber-300"
        >
          Start browsing <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  )
}
