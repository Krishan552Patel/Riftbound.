'use client'

import { use, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Plus, Minus, Trash2, Copy, Check } from 'lucide-react'
import { useDecks } from '@/hooks/useDecks'
import { useAllCards } from '@/hooks/useAllCards'
import { useRouter } from 'next/navigation'
import { filterCards, isFilterActive, getFilterOptions } from '@/lib/cardFilter'
import { formatPrice, getCardPrice } from '@/lib/pricing'
import FilterPanel, { type PanelFilters } from '@/components/cards/FilterPanel'
import SearchBar from '@/components/cards/SearchBar'
import RarityBadge from '@/components/cards/RarityBadge'
import BuilderCardTile, { type CardDisabledReason } from '@/components/decks/BuilderCardTile'
import DeckStats from '@/components/decks/DeckStats'
import DeckValidator, { MAIN_DECK_TYPES, type DeckEntry } from '@/components/decks/DeckValidator'
import { CardGridSkeleton } from '@/components/cards/CardGrid'
import type { Card } from '@/types'

const BUILDER_PAGE_SIZE = 40
const MAX_COPIES = 3
const SIDEBOARD_SIZE = 8
const TOTAL_RUNES = 12
const MAX_BATTLEFIELDS = 3

type DeckSection = 'main' | 'sideboard' | 'maybeboard' | 'legend' | 'battlefield' | 'runes'

const TYPE_ORDER = ['Champion', 'Unit', 'Gear', 'Spell', 'Equipment', 'Location']
function typeSort(a: string, b: string) {
  const ai = TYPE_ORDER.indexOf(a)
  const bi = TYPE_ORDER.indexOf(b)
  if (ai !== -1 && bi !== -1) return ai - bi
  if (ai !== -1) return -1
  if (bi !== -1) return 1
  return a.localeCompare(b)
}

function groupByType(entries: DeckEntry[]) {
  const groups = new Map<string, DeckEntry[]>()
  for (const entry of entries) {
    const type = entry.card.classification?.type ?? 'Other'
    if (!groups.has(type)) groups.set(type, [])
    groups.get(type)!.push(entry)
  }
  return [...groups.entries()].sort(([a], [b]) => typeSort(a, b))
}

const isCardSection = (s: DeckSection) => s === 'main' || s === 'sideboard' || s === 'maybeboard'

export default function DeckBuilderPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params)
  const {
    decks, updateDeck, removeDeck, setDeckLegend,
    addCardToDeck, removeCardFromDeck,
    addCardToSideboard, removeCardFromSideboard,
    addCardToMaybeboard, removeCardFromMaybeboard,
    toggleBattlefield, setDeckRunes,
  } = useDecks()
  const router = useRouter()
  const deck = decks.find((d) => d.id === deckId)

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<PanelFilters>({})
  const [cardPage, setCardPage] = useState(1)
  const [deckName, setDeckName] = useState(deck?.name ?? '')
  const [editingName, setEditingName] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState<DeckSection>('main')

  const { data: allCards, isLoading: allCardsLoading } = useAllCards()

  const allCardsMap = useMemo(() => {
    if (!allCards) return new Map<string, Card>()
    return new Map(allCards.map((c) => [c.id, c]))
  }, [allCards])

  const legendCards = useMemo(
    () => (allCards ?? []).filter((c) => c.classification?.type === 'Legend').sort((a, b) => a.name.localeCompare(b.name)),
    [allCards]
  )

  const legendCard = deck?.legendId ? (allCardsMap.get(deck.legendId) ?? null) : null
  const legendDomains = useMemo(() => new Set(legendCard?.classification?.domain ?? []), [legendCard])
  const legendDomainsArray = useMemo(() => legendCard?.classification?.domain ?? [], [legendCard])

  const battlefieldCards = useMemo(
    () => (allCards ?? []).filter((c) => c.classification?.type === 'Battlefield').sort((a, b) => a.name.localeCompare(b.name)),
    [allCards]
  )

  const filterOptions = useMemo(() => (allCards ? getFilterOptions(allCards) : undefined), [allCards])
  const activeFilters = { ...filters, query: query || undefined }
  const inFilterMode = isFilterActive(activeFilters)

  const browseableCards = useMemo(
    () => (allCards ?? []).filter((c) => MAIN_DECK_TYPES.has(c.classification?.type ?? '')),
    [allCards]
  )

  const filteredCards = useMemo(() => {
    if (inFilterMode) return filterCards(browseableCards, activeFilters)
    return browseableCards
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browseableCards, inFilterMode, query, filters.type, filters.rarity, filters.domain, filters.set])

  const filteredLegends = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return legendCards
    return legendCards.filter((c) => c.name.toLowerCase().includes(q))
  }, [legendCards, query])

  const filteredBattlefields = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return battlefieldCards
    return battlefieldCards.filter((c) => c.name.toLowerCase().includes(q))
  }, [battlefieldCards, query])

  const totalCardPages = Math.max(1, Math.ceil(filteredCards.length / BUILDER_PAGE_SIZE))
  const pagedCards = filteredCards.slice((cardPage - 1) * BUILDER_PAGE_SIZE, cardPage * BUILDER_PAGE_SIZE)

  const combinedQtyMap = useMemo(() => {
    if (!deck) return {} as Record<string, number>
    const map: Record<string, number> = {}
    for (const c of deck.cards) map[c.cardId] = (map[c.cardId] ?? 0) + c.quantity
    for (const c of deck.sideboard ?? []) map[c.cardId] = (map[c.cardId] ?? 0) + c.quantity
    return map
  }, [deck])

  const sideTotal = useMemo(
    () => (deck?.sideboard ?? []).reduce((s, c) => s + c.quantity, 0),
    [deck]
  )

  const battlefieldIds = deck?.battlefieldIds ?? []
  const runeTotal = legendDomainsArray.reduce((s, d) => s + ((deck?.runes)?.[d] ?? 0), 0)

  function getDisabledReason(card: Card): CardDisabledReason | undefined {
    if (activeSection === 'legend') return undefined
    if (activeSection === 'battlefield') {
      if (!battlefieldIds.includes(card.id) && battlefieldIds.length >= MAX_BATTLEFIELDS) return 'limit'
      return undefined
    }
    if (activeSection === 'maybeboard') return undefined
    const combined = combinedQtyMap[card.id] ?? 0
    if (combined >= MAX_COPIES) return 'limit'
    if (activeSection === 'sideboard' && sideTotal >= SIDEBOARD_SIZE) return 'limit'
    if (legendDomains.size > 0) {
      const domains = card.classification?.domain ?? []
      if (domains.length > 0 && !domains.some((d) => legendDomains.has(d))) return 'domain'
    }
    return undefined
  }

  function handleAddCard(card: Card) {
    if (!deck) return
    if (activeSection === 'main') addCardToDeck(deck.id, card.id)
    else if (activeSection === 'sideboard') addCardToSideboard(deck.id, card.id)
    else if (activeSection === 'maybeboard') addCardToMaybeboard(deck.id, card.id)
    else if (activeSection === 'legend') setDeckLegend(deck.id, card.id)
    else if (activeSection === 'battlefield') toggleBattlefield(deck.id, card.id)
  }

  function addRune(domain: string) {
    if (!deck || runeTotal >= TOTAL_RUNES) return
    const current = deck.runes?.[domain] ?? 0
    setDeckRunes(deck.id, { ...(deck.runes ?? {}), [domain]: current + 1 })
  }

  function removeRune(domain: string) {
    if (!deck) return
    const current = deck.runes?.[domain] ?? 0
    if (current <= 0) return
    setDeckRunes(deck.id, { ...(deck.runes ?? {}), [domain]: current - 1 })
  }

  function resolveEntries(list: { cardId: string; quantity: number }[] | undefined): DeckEntry[] {
    return (list ?? [])
      .map((dc) => ({ card: allCardsMap.get(dc.cardId), quantity: dc.quantity }))
      .filter((e): e is DeckEntry => !!e.card)
  }

  const mainEntries = useMemo(() => resolveEntries(deck?.cards), [deck?.cards, allCardsMap])
  const sideEntries = useMemo(() => resolveEntries(deck?.sideboard), [deck?.sideboard, allCardsMap])
  const maybeEntries = useMemo(() => resolveEntries(deck?.maybeboard), [deck?.maybeboard, allCardsMap])

  const groupedMain = useMemo(() => groupByType(mainEntries), [mainEntries])
  const groupedSide = useMemo(() => groupByType(sideEntries), [sideEntries])
  const groupedMaybe = useMemo(() => groupByType(maybeEntries), [maybeEntries])

  const totalMainCards = mainEntries.reduce((s, e) => s + e.quantity, 0)
  const totalCards = totalMainCards + sideTotal + maybeEntries.reduce((s, e) => s + e.quantity, 0)

  const deckValue = useMemo(
    () => [...mainEntries, ...sideEntries].reduce((sum, { card, quantity }) => sum + getCardPrice(card).market * quantity, 0),
    [mainEntries, sideEntries]
  )

  const handleSaveName = () => {
    if (!deck || !deckName.trim()) return
    updateDeck({ ...deck, name: deckName.trim() })
    setEditingName(false)
  }

  const handleCopy = () => {
    if (!deck) return
    const sections = [
      { label: 'Main Deck', entries: mainEntries },
      ...(sideEntries.length > 0 ? [{ label: 'Sideboard', entries: sideEntries }] : []),
      ...(maybeEntries.length > 0 ? [{ label: 'Maybeboard', entries: maybeEntries }] : []),
    ]
    const lines = sections.flatMap(({ label, entries }) => [
      `// ${label}`,
      ...entries.map(({ card, quantity }) => `${quantity}x ${card.name} (${card.public_code})`),
      '',
    ])
    navigator.clipboard.writeText(lines.join('\n').trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!deck) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-zinc-400">Deck not found.</p>
        <Link href="/decks" className="text-amber-400 hover:underline">← Back to decks</Link>
      </div>
    )
  }

  const maybeCount = maybeEntries.reduce((s, e) => s + e.quantity, 0)

  const SECTION_TABS: { id: DeckSection; label: string; count: number }[] = [
    { id: 'main',        label: 'Main',    count: totalMainCards },
    { id: 'sideboard',   label: 'Side',    count: sideTotal },
    { id: 'maybeboard',  label: 'Maybe',   count: maybeCount },
    { id: 'legend',      label: 'Legend',  count: deck.legendId ? 1 : 0 },
    { id: 'battlefield', label: 'Fields',  count: battlefieldIds.length },
    { id: 'runes',       label: 'Runes',   count: runeTotal },
  ]

  function switchSection(id: DeckSection) {
    setActiveSection(id)
    setCardPage(1)
    if (!isCardSection(id)) setQuery('')
  }

  function getDeckQty(card: Card): number {
    if (activeSection === 'legend') return deck?.legendId === card.id ? 1 : 0
    if (activeSection === 'battlefield') return battlefieldIds.includes(card.id) ? 1 : 0
    return combinedQtyMap[card.id] ?? 0
  }

  const displayCards: Card[] =
    activeSection === 'legend' ? filteredLegends :
    activeSection === 'battlefield' ? filteredBattlefields :
    pagedCards

  const selectedBattlefields = battlefieldCards.filter((c) => battlefieldIds.includes(c.id))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/decks" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Decks
        </Link>
        <div className="flex items-center gap-2 flex-1">
          {editingName ? (
            <>
              <input
                type="text" value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') { setDeckName(deck.name); setEditingName(false) }
                }}
                className="rounded-md border border-amber-400 bg-zinc-900 px-3 py-1 text-lg font-bold text-white outline-none"
                autoFocus
              />
              <button onClick={handleSaveName} className="rounded-md bg-amber-400 px-3 py-1 text-sm font-medium text-zinc-900 hover:bg-amber-300">Save</button>
              <button onClick={() => { setDeckName(deck.name); setEditingName(false) }} className="text-sm text-zinc-500 hover:text-white">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditingName(true)} className="text-2xl font-bold text-white hover:text-amber-400 transition-colors">
              {deck.name}
            </button>
          )}
        </div>
        <span className="text-sm text-zinc-500">{totalCards} cards · {formatPrice(deckValue)} est.</span>
        <button onClick={() => { removeDeck(deck.id); router.push('/decks') }}
          className="text-zinc-600 hover:text-red-400 transition-colors" title="Delete deck">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] items-start">

        {/* ── Left: Unified Browser ── */}
        <div className="space-y-3">

          {/* Section tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {SECTION_TABS.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => switchSection(id)}
                className={[
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  activeSection === id
                    ? 'bg-amber-400 text-zinc-900'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white',
                ].join(' ')}
              >
                {label}
                {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
              </button>
            ))}
          </div>

          {/* Context hints */}
          {activeSection === 'sideboard' && (
            <p className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
              Adding to Sideboard — {sideTotal}/{SIDEBOARD_SIZE} cards. Must be exactly 0 or 8 to be legal.
            </p>
          )}
          {activeSection === 'maybeboard' && (
            <p className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-400 italic">
              Maybeboard — no copy or size limits. Cards here don't count toward deck rules.
            </p>
          )}
          {activeSection === 'legend' && (
            <p className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
              {legendCard
                ? `Current Legend: ${legendCard.name} — click another to replace.`
                : 'Click a Legend to set it. Your Legend determines which domains your deck can use.'}
            </p>
          )}
          {activeSection === 'battlefield' && (
            <p className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
              {battlefieldIds.length >= MAX_BATTLEFIELDS
                ? `${MAX_BATTLEFIELDS}/${MAX_BATTLEFIELDS} battlefields selected — click one to remove it.`
                : `${battlefieldIds.length}/${MAX_BATTLEFIELDS} selected — click to add or remove.`}
            </p>
          )}
          {activeSection === 'runes' && !legendCard && (
            <p className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
              Switch to the Legend tab and pick a Legend first — runes are split between your Legend's two domains.
            </p>
          )}

          {/* Search (all sections except Runes) */}
          {activeSection !== 'runes' && (
            <SearchBar
              onSearch={(q) => { setQuery(q); setCardPage(1) }}
              placeholder={
                activeSection === 'legend' ? 'Search legends…' :
                activeSection === 'battlefield' ? 'Search battlefields…' :
                'Search cards…'
              }
              isLoading={false}
            />
          )}

          {/* Filters (main/side/maybe only) */}
          {isCardSection(activeSection) && (
            <FilterPanel filters={filters} onChange={(f) => { setFilters(f); setCardPage(1) }} options={filterOptions} showSort={false} />
          )}

          {/* Card count label */}
          {isCardSection(activeSection) && <p className="text-xs text-zinc-500">{filteredCards.length} cards</p>}
          {activeSection === 'legend' && <p className="text-xs text-zinc-500">{filteredLegends.length} legend{filteredLegends.length !== 1 ? 's' : ''}</p>}
          {activeSection === 'battlefield' && <p className="text-xs text-zinc-500">{filteredBattlefields.length} battlefield{filteredBattlefields.length !== 1 ? 's' : ''}</p>}

          {/* Content area */}
          {allCardsLoading ? (
            <CardGridSkeleton count={12} />
          ) : activeSection === 'runes' ? (
            legendDomainsArray.length === 0 ? null : (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Rune deck — {runeTotal} / {TOTAL_RUNES} assigned</span>
                  <span className={`text-xs font-bold ${runeTotal === TOTAL_RUNES ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {runeTotal === TOTAL_RUNES ? 'Full' : `${TOTAL_RUNES - runeTotal} remaining`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {legendDomainsArray.map((domain) => (
                    <RuneTile
                      key={domain}
                      domain={domain}
                      count={deck.runes?.[domain] ?? 0}
                      runeTotal={runeTotal}
                      onAdd={() => addRune(domain)}
                      onRemove={() => removeRune(domain)}
                    />
                  ))}
                </div>

                {legendDomainsArray.length === 2 && (
                  <div>
                    <p className="mb-2 text-[10px] text-zinc-500 uppercase tracking-wide">Quick splits</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {[[6,6],[7,5],[5,7],[8,4],[4,8],[9,3],[3,9]].map(([a, b]) => {
                        const isActive =
                          (deck.runes?.[legendDomainsArray[0]] ?? 0) === a &&
                          (deck.runes?.[legendDomainsArray[1]] ?? 0) === b
                        return (
                          <button
                            key={`${a}-${b}`}
                            onClick={() => setDeckRunes(deck.id, { [legendDomainsArray[0]]: a, [legendDomainsArray[1]]: b })}
                            className={[
                              'rounded px-2.5 py-1 text-xs transition-colors',
                              isActive ? 'bg-amber-400 text-zinc-900 font-bold' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
                            ].join(' ')}
                          >
                            {a}/{b}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {displayCards.map((card) => (
                  <BuilderCardTile
                    key={card.id}
                    card={card}
                    deckQty={getDeckQty(card)}
                    onAdd={handleAddCard}
                    disabledReason={getDisabledReason(card)}
                  />
                ))}
              </div>

              {/* Pagination (main/side/maybe only) */}
              {isCardSection(activeSection) && totalCardPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button disabled={cardPage <= 1} onClick={() => setCardPage((p) => p - 1)}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    ← Prev
                  </button>
                  <span className="text-sm text-zinc-400">{cardPage} / {totalCardPages}</span>
                  <button disabled={cardPage >= totalCardPages} onClick={() => setCardPage((p) => p + 1)}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right: Sticky Status + Deck Panel ── */}
        <div className="lg:sticky lg:top-6 space-y-3">

          {/* Compact Legend */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Legend</span>
              <button onClick={() => switchSection('legend')} className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors">
                browse →
              </button>
            </div>
            {legendCard ? (
              <div className="flex items-center gap-2">
                {legendCard.media?.image_url && (
                  <div className="relative h-9 w-6 flex-shrink-0 overflow-hidden rounded">
                    <Image src={legendCard.media.image_url} alt={legendCard.name} fill sizes="24px" className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-white">{legendCard.name}</p>
                  <div className="mt-0.5 flex gap-1">
                    {(legendCard.classification?.domain ?? []).map((d) => (
                      <span key={d} className="rounded-full bg-amber-900/40 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">{d}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setDeckLegend(deck.id, null)} className="text-zinc-600 hover:text-red-400 transition-colors">✕</button>
              </div>
            ) : (
              <p className="text-xs text-zinc-600 italic">None selected</p>
            )}
          </div>

          {/* Compact Battlefields */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Battlefields
                <span className={`ml-1.5 font-normal ${battlefieldIds.length === MAX_BATTLEFIELDS ? 'text-emerald-400' : 'text-zinc-600'}`}>
                  {battlefieldIds.length}/{MAX_BATTLEFIELDS}
                </span>
              </span>
              <button onClick={() => switchSection('battlefield')} className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors">
                browse →
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedBattlefields.map((c) => (
                <div key={c.id} className="group relative">
                  <div className="relative h-14 w-10 overflow-hidden rounded border border-zinc-700">
                    {c.media?.image_url ? (
                      <Image src={c.media.image_url} alt={c.name} fill sizes="40px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-zinc-800 text-[8px] text-zinc-500 text-center px-0.5">{c.name}</div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleBattlefield(deck.id, c.id)}
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                  >✕</button>
                  <p className="mt-0.5 w-10 truncate text-center text-[8px] text-zinc-500">{c.name}</p>
                </div>
              ))}
              {Array.from({ length: MAX_BATTLEFIELDS - battlefieldIds.length }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => switchSection('battlefield')}
                  className="h-14 w-10 rounded border border-dashed border-zinc-700 flex items-center justify-center text-zinc-700 text-lg hover:border-amber-600 hover:text-amber-600 transition-colors"
                >+</button>
              ))}
            </div>
          </div>

          {/* Compact Rune Deck (only when legend has domains) */}
          {legendDomainsArray.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Rune Deck</span>
                <span className={`text-xs font-bold ${runeTotal === TOTAL_RUNES ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {runeTotal}/{TOTAL_RUNES}
                </span>
              </div>
              <div className="space-y-1.5">
                {legendDomainsArray.map((domain) => {
                  const count = deck.runes?.[domain] ?? 0
                  return (
                    <div key={domain} className="flex items-center gap-2">
                      <span className="w-14 text-[11px] text-zinc-400 truncate">{domain}</span>
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(count / TOTAL_RUNES) * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-amber-400 w-4 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
              <button onClick={() => switchSection('runes')} className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 transition-colors">
                edit runes →
              </button>
            </div>
          )}

          {/* Validator */}
          <DeckValidator
            mainEntries={mainEntries}
            sideEntries={sideEntries}
            legendCard={legendCard}
            battlefieldIds={deck.battlefieldIds ?? []}
            runes={deck.runes ?? {}}
          />

          {/* Stats */}
          <DeckStats entries={mainEntries} />

          {/* Deck list */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white">Deck List</h2>
              {mainEntries.length > 0 && (
                <button onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors">
                  {copied ? <><Check className="h-3 w-3 text-emerald-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                </button>
              )}
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              <SectionHeader label="Main Deck" count={totalMainCards} />
              {groupedMain.length === 0
                ? <EmptySection message="Switch to Main tab and click cards to add." />
                : groupedMain.map(([type, entries]) => (
                  <TypeGroup key={type} type={type} entries={entries} legendDomains={legendDomains}
                    onAdd={(id) => addCardToDeck(deck.id, id)}
                    onRemove={(id) => removeCardFromDeck(deck.id, id)}
                    maxCopies={MAX_COPIES} combinedQtyMap={combinedQtyMap}
                  />
                ))
              }

              <SectionHeader
                label="Sideboard"
                count={sideTotal}
                sublabel={sideTotal > 0 && sideTotal !== SIDEBOARD_SIZE ? `(${sideTotal}/${SIDEBOARD_SIZE} — must be 0 or 8)` : `(${sideTotal}/${SIDEBOARD_SIZE})`}
                warn={sideTotal > 0 && sideTotal !== SIDEBOARD_SIZE}
              />
              {groupedSide.length === 0
                ? <EmptySection message={`Switch to Side tab to add. Max ${SIDEBOARD_SIZE} cards.`} />
                : groupedSide.map(([type, entries]) => (
                  <TypeGroup key={type} type={type} entries={entries} legendDomains={legendDomains}
                    onAdd={(id) => addCardToSideboard(deck.id, id)}
                    onRemove={(id) => removeCardFromSideboard(deck.id, id)}
                    maxCopies={MAX_COPIES} combinedQtyMap={combinedQtyMap}
                  />
                ))
              }

              <SectionHeader label="Maybeboard" count={maybeCount} sublabel="(no limits)" />
              {groupedMaybe.length === 0
                ? <EmptySection message="Switch to Maybe tab to add cards here." />
                : groupedMaybe.map(([type, entries]) => (
                  <TypeGroup key={type} type={type} entries={entries} legendDomains={new Set()}
                    onAdd={(id) => addCardToMaybeboard(deck.id, id)}
                    onRemove={(id) => removeCardFromMaybeboard(deck.id, id)}
                    maxCopies={Infinity} combinedQtyMap={{}}
                  />
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label, count, sublabel, warn }: {
  label: string; count: number; sublabel?: string; warn?: boolean
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/60 border-t border-zinc-700/50">
      <span className="text-xs font-bold text-zinc-200">{label}</span>
      <span className={`text-xs ${warn ? 'text-amber-400' : 'text-zinc-500'}`}>
        {sublabel ?? `(${count})`}
      </span>
    </div>
  )
}

function EmptySection({ message }: { message: string }) {
  return <p className="px-3 py-2 text-xs text-zinc-600 italic">{message}</p>
}

function TypeGroup({ type, entries, legendDomains, onAdd, onRemove, maxCopies, combinedQtyMap }: {
  type: string
  entries: DeckEntry[]
  legendDomains: Set<string>
  onAdd: (cardId: string) => void
  onRemove: (cardId: string) => void
  maxCopies: number
  combinedQtyMap: Record<string, number>
}) {
  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/30 sticky top-0">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{type}</span>
        <span className="text-[10px] text-zinc-700">({entries.reduce((s, e) => s + e.quantity, 0)})</span>
      </div>
      {entries.map(({ card, quantity }) => {
        const isIllegal = legendDomains.size > 0 && (() => {
          const domains = card.classification?.domain ?? []
          return domains.length > 0 && !domains.some((d) => legendDomains.has(d))
        })()
        const combined = combinedQtyMap[card.id] ?? quantity
        const atLimit = combined >= maxCopies

        return (
          <div key={card.id}
            className={`flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/30 transition-colors ${isIllegal ? 'bg-red-950/20' : ''}`}
          >
            {card.media?.image_url && (
              <div className="relative h-8 w-6 flex-shrink-0 overflow-hidden rounded">
                <Image src={card.media.image_url} alt={card.name} fill sizes="24px" className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`truncate text-xs font-medium ${isIllegal ? 'text-red-300' : 'text-zinc-100'}`}>{card.name}</p>
              <RarityBadge rarity={card.classification?.rarity ?? ''} />
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => onRemove(card.id)}
                className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-white transition-colors">
                <Minus className="h-3 w-3" />
              </button>
              <span className={`w-4 text-center text-xs font-bold ${atLimit ? 'text-zinc-400' : 'text-amber-400'}`}>
                {quantity}
              </span>
              <button onClick={() => onAdd(card.id)} disabled={atLimit}
                className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RuneTile({ domain, count, runeTotal, onAdd, onRemove }: {
  domain: string
  count: number
  runeTotal: number
  onAdd: () => void
  onRemove: () => void
}) {
  const canAdd = runeTotal < TOTAL_RUNES
  const canRemove = count > 0

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900/70 overflow-hidden">
      {/* Clickable art area — clicking adds 1 rune */}
      <button
        onClick={onAdd}
        disabled={!canAdd}
        className={[
          'relative w-full flex items-center justify-center group transition-colors',
          'aspect-[3/2]',
          canAdd ? 'cursor-pointer hover:bg-amber-900/20' : 'cursor-not-allowed opacity-50',
        ].join(' ')}
        title={canAdd ? `Add 1 ${domain} rune` : 'Rune deck is full (12/12)'}
      >
        <span className="text-6xl font-black text-zinc-700 select-none group-hover:text-amber-800 transition-colors">
          {domain[0]}
        </span>
        {canAdd && (
          <span className="absolute top-2 right-2.5 text-xl text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">+</span>
        )}
        <span className={`absolute top-2 left-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${count > 0 ? 'bg-amber-400 text-zinc-900' : 'bg-zinc-800 text-zinc-500'}`}>
          {count}/{TOTAL_RUNES}
        </span>
      </button>

      {/* Domain name + pip bar + +/- controls */}
      <div className="px-3 pb-3 pt-2 space-y-1.5">
        <p className="text-xs font-semibold text-white">{domain} Rune</p>
        <div className="flex gap-0.5">
          {Array.from({ length: TOTAL_RUNES }).map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < count ? 'bg-amber-400' : 'bg-zinc-800'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={onRemove}
            disabled={!canRemove}
            className="flex h-6 w-6 items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="flex-1 text-center text-sm font-bold text-amber-400">{count}</span>
          <button
            onClick={onAdd}
            disabled={!canAdd}
            className="flex h-6 w-6 items-center justify-center rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
