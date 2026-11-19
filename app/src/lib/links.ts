export type Store = 'steam' | 'epic' | 'gog' | 'xbox' | 'playstation' | 'nintendo' | 'itch' | 'outra'

const stores: [RegExp, Store, string][] = [
  [/(^|\.)steampowered\.com$|(^|\.)steamcommunity\.com$/, 'steam', 'Steam'],
  [/(^|\.)epicgames\.com$/, 'epic', 'Epic Games'],
  [/(^|\.)gog\.com$/, 'gog', 'GOG'],
  [/(^|\.)xbox\.com$/, 'xbox', 'Xbox'],
  [/(^|\.)playstation\.com$/, 'playstation', 'PlayStation'],
  [/(^|\.)nintendo\.(com|com\.br|pt|es)$/, 'nintendo', 'Nintendo'],
  [/(^|\.)itch\.io$/, 'itch', 'itch.io'],
]

export const storeLabels: Record<Store, string> = {
  steam: 'Steam', epic: 'Epic Games', gog: 'GOG', xbox: 'Xbox', playstation: 'PlayStation',
  nintendo: 'Nintendo', itch: 'itch.io', outra: 'Outra loja',
}

export interface StoreLink { url: string; store: Store; label: string; host: string }

/** Parses an address typed by a person. Only https survives (the database requires it); a bare domain gets https. */
export function parseLink(raw: string): StoreLink | undefined {
  const text = raw.trim()
  if (!text || /\s/.test(text) || text.length > 500) return undefined
  if (/^[a-z][a-z0-9+.-]*:/i.test(text) && !/^https:\/\//i.test(text)) return undefined
  let url: URL
  try {
    url = new URL(/^https:\/\//i.test(text) ? text : `https://${text}`)
  } catch {
    return undefined
  }
  if (url.protocol !== 'https:' || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(url.hostname)) return undefined
  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  const hit = stores.find(([re]) => re.test(host))
  const out = url.toString()
  if (out.length > 500) return undefined
  return { url: out, store: hit?.[1] ?? 'outra', label: hit?.[2] ?? 'Outra loja', host }
}

export function steamAppId(url: string): number | undefined {
  const m = /store\.steampowered\.com\/app\/(\d+)/i.exec(url)
  return m ? Number(m[1]) : undefined
}
