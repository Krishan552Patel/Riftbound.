'use client'

import { SWRConfig } from 'swr'

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 60_000,
        revalidateIfStale: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}
