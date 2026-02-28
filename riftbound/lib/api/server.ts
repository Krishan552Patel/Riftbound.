/**
 * Server-side upstream fetch helper used by all API route handlers.
 * Uses Next.js data cache (next.revalidate) to deduplicate upstream requests
 * across all users within the revalidation window.
 */

const BASE_URL = process.env.RIFTCODEX_API_BASE ?? 'https://api.riftcodex.com'

export async function upstreamFetch<T>(
  path: string,
  revalidateSeconds: number = 300,
): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    next: { revalidate: revalidateSeconds },
    headers: {
      Accept: 'application/json',
      'User-Agent': 'riftbound-tracker/1.0',
    },
  })

  if (!res.ok) {
    throw new Error(
      `Riftcodex upstream error: ${res.status} ${res.statusText} for ${path}`,
    )
  }

  return res.json() as Promise<T>
}
