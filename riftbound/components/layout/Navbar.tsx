'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, BookOpen, Library, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/cards', label: 'Cards', icon: Layers },
  { href: '/collection', label: 'Collection', icon: Library },
  { href: '/decks', label: 'Decks', icon: Swords },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
          <BookOpen className="h-5 w-5 text-amber-400" />
          <span className="text-amber-400">Rift</span>
          <span>Codex</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-amber-400/10 text-amber-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
