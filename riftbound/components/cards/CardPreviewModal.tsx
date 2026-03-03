'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import type { Card } from '@/types'
import RarityBadge from './RarityBadge'

interface CardPreviewModalProps {
  card: Card
  onClose: () => void
}

export default function CardPreviewModal({ card, onClose }: CardPreviewModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const domains = card.classification?.domain ?? []
  const hasStats =
    card.attributes?.energy !== null ||
    card.attributes?.might !== null ||
    card.attributes?.power !== null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950/80 text-zinc-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Card image */}
        {card.media?.image_url ? (
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={card.media.image_url}
              alt={card.media?.accessibility_text || card.name}
              fill
              sizes="320px"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="aspect-[3/4] w-full bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-600 text-sm">No image</span>
          </div>
        )}

        {/* Details */}
        <div className="p-4 space-y-3">
          {/* Name + type */}
          <div>
            <h2 className="text-base font-bold text-white">{card.name}</h2>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-400">{card.classification?.type}</span>
              {card.classification?.supertype && (
                <span className="text-xs text-zinc-500">· {card.classification.supertype}</span>
              )}
              <RarityBadge rarity={card.classification?.rarity ?? ''} />
            </div>
          </div>

          {/* Domains */}
          {domains.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {domains.map((d) => (
                <span key={d} className="rounded-full bg-amber-900/40 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                  {d}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          {hasStats && (
            <div className="flex gap-4 text-xs border-t border-zinc-800 pt-2.5">
              {card.attributes?.energy !== null && (
                <span className="text-zinc-400">Energy <span className="font-bold text-amber-400">{card.attributes.energy}</span></span>
              )}
              {card.attributes?.might !== null && (
                <span className="text-zinc-400">Might <span className="font-bold text-amber-400">{card.attributes.might}</span></span>
              )}
              {card.attributes?.power !== null && (
                <span className="text-zinc-400">Power <span className="font-bold text-amber-400">{card.attributes.power}</span></span>
              )}
            </div>
          )}

          {/* Card text */}
          {card.text?.plain && (
            <p className="text-xs text-zinc-300 leading-relaxed border-t border-zinc-800 pt-2.5 whitespace-pre-line">
              {card.text.plain}
            </p>
          )}

          {/* Footer */}
          <p className="text-[10px] text-zinc-600 border-t border-zinc-800 pt-2">
            {[card.set?.label, card.public_code, card.media?.artist].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
    </div>
  )
}
