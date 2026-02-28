import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SwrProvider } from '@/providers/SwrProvider'

export const metadata: Metadata = {
  title: 'Riftbound Card Tracker',
  description: 'Browse, collect, and build decks for the Riftbound TCG. Powered by the Riftcodex API.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-zinc-950 text-zinc-100 antialiased">
        <SwrProvider>
          <Navbar />
          <main className="mx-auto min-h-screen max-w-7xl px-4 py-6">
            {children}
          </main>
          <Footer />
        </SwrProvider>
      </body>
    </html>
  )
}
