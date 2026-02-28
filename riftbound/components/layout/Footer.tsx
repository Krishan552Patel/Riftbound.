export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-6 text-center text-sm text-zinc-500">
      <p>
        Card data via{' '}
        <a
          href="https://riftcodex.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline"
        >
          Riftcodex API
        </a>
        . Prices shown are placeholders — real pricing coming soon.
      </p>
      <p className="mt-1 text-xs text-zinc-600">
        Not affiliated with Riot Games. Riftbound is a trademark of Riot Games.
      </p>
    </footer>
  )
}
