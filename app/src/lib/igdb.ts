import 'server-only'

export interface CatalogGame {
  igdbId: number
  title: string
  year: number | null
  developer: string | null
  description: string | null
  cover: string | null
  steamAppId: number | null
  tags: { kind: 'genero' | 'modo' | 'caracteristica'; slug: string }[]
  popularity: number
}

export class CatalogDown extends Error {}

const FIELDS = [
  'name', 'summary', 'first_release_date', 'total_rating_count', 'cover.image_id',
  'involved_companies.developer', 'involved_companies.company.name',
  'genres.name', 'themes.name', 'game_modes.name',
  'multiplayer_modes.onlinecoop', 'multiplayer_modes.offlinecoop', 'multiplayer_modes.splitscreen',
  'external_games.external_game_source', 'external_games.uid',
].join(',')

// Main games, remakes, remasters, expanded editions and ports; never DLC, mods, bundles or other versions of a game.
const WHERE = 'game_type = (0,4,8,9,10,11) & version_parent = null'

const GENRES: Record<string, string> = {
  Shooter: 'tiro', Platform: 'plataforma', Puzzle: 'puzzle', Adventure: 'aventura', 'Role-playing (RPG)': 'rpg',
  Strategy: 'estrategia', 'Real Time Strategy (RTS)': 'estrategia', 'Turn-based strategy (TBS)': 'estrategia',
  Simulator: 'simulacao', Fighting: 'luta', Racing: 'corrida', Sport: 'esporte', Music: 'musica',
  'Visual Novel': 'visual-novel', "Hack and slash/Beat 'em up": 'acao',
}
const THEMES: Record<string, [CatalogGame['tags'][number]['kind'], string]> = {
  Horror: ['genero', 'terror'], Survival: ['genero', 'sobrevivencia'], Action: ['genero', 'acao'],
  'Open world': ['caracteristica', 'mundo-aberto'], Party: ['genero', 'festa'],
}

let token: { value: string; until: number } | null = null

async function getToken(): Promise<string> {
  if (token && token.until > Date.now() + 60_000) return token.value
  const id = process.env.TWITCH_CLIENT_ID
  const secret = process.env.TWITCH_CLIENT_SECRET
  if (!id || !secret) throw new CatalogDown('catalog credentials missing')
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}&grant_type=client_credentials`,
    { method: 'POST', signal: AbortSignal.timeout(6000), cache: 'no-store' },
  )
  if (!res.ok) throw new CatalogDown(`token ${res.status}`)
  const body = (await res.json()) as { access_token: string; expires_in: number }
  token = { value: body.access_token, until: Date.now() + body.expires_in * 1000 }
  return token.value
}

async function post(endpoint: 'games' | 'external_games', body: string): Promise<unknown[]> {
  try {
    const run = async () => fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID ?? '', Authorization: `Bearer ${await getToken()}`, Accept: 'application/json' },
      body, signal: AbortSignal.timeout(8000), cache: 'no-store',
    })
    let res = await run()
    if (res.status === 401) { token = null; res = await run() }
    if (!res.ok) throw new CatalogDown(`igdb ${res.status}`)
    return (await res.json()) as unknown[]
  } catch (e) {
    throw e instanceof CatalogDown ? e : new CatalogDown(e instanceof Error ? e.message : 'catalog failed')
  }
}

interface Raw {
  id: number; name: string; summary?: string; first_release_date?: number; total_rating_count?: number
  cover?: { image_id: string }
  involved_companies?: { developer?: boolean; company?: { name?: string } }[]
  genres?: { name: string }[]; themes?: { name: string }[]; game_modes?: { name: string }[]
  multiplayer_modes?: { onlinecoop?: boolean; offlinecoop?: boolean; splitscreen?: boolean }[]
  external_games?: { external_game_source?: number; uid?: string }[]
}

function map(r: Raw): CatalogGame {
  const seen = new Set<string>()
  const tags: CatalogGame['tags'] = []
  const add = (kind: CatalogGame['tags'][number]['kind'], slug: string | undefined) => {
    if (!slug || seen.has(`${kind}:${slug}`)) return
    seen.add(`${kind}:${slug}`)
    tags.push({ kind, slug })
  }
  r.genres?.forEach((g) => add('genero', GENRES[g.name]))
  r.themes?.forEach((t) => { const m = THEMES[t.name]; if (m) add(m[0], m[1]) })
  if (r.game_modes?.some((m) => m.name === 'Single player')) add('modo', 'single-player')
  for (const m of r.multiplayer_modes ?? []) {
    if (m.onlinecoop) add('modo', 'coop-online')
    if (m.offlinecoop) add('modo', 'coop-local')
    if (m.splitscreen) add('modo', 'tela-dividida')
  }
  const dev = r.involved_companies?.find((c) => c.developer)?.company?.name ?? null
  const steam = r.external_games?.find((e) => e.external_game_source === 1)?.uid
  const steamId = steam && /^\d+$/.test(steam) ? Number(steam) : null
  return {
    igdbId: r.id, title: r.name,
    year: r.first_release_date ? new Date(r.first_release_date * 1000).getUTCFullYear() : null,
    developer: dev, description: r.summary?.slice(0, 2000) ?? null,
    cover: r.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${r.cover.image_id}.jpg` : null,
    steamAppId: steamId, tags, popularity: r.total_rating_count ?? 0,
  }
}

export const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/**
 * The catalog's own relevance order puts obscure namesakes first (a search for "portal" opens with "Portal Maze 2"),
 * so we ask for many results and rank them: exact title, then titles that start with the words, then the rest,
 * each group by how many people rated the game.
 */
export function rank(list: CatalogGame[], q: string): CatalogGame[] {
  const n = normalize(q)
  const tier = (g: CatalogGame) => {
    const t = normalize(g.title)
    return t === n ? 0 : t.startsWith(n) ? 1 : t.includes(n) ? 2 : 3
  }
  return [...list].sort((a, b) => tier(a) - tier(b) || b.popularity - a.popularity)
}

const esc = (s: string) => s.replace(/[\\"]/g, ' ')

export async function searchCatalog(q: string): Promise<CatalogGame[]> {
  const raw = (await post('games', `search "${esc(q)}"; fields ${FIELDS}; where ${WHERE}; limit 50;`)) as Raw[]
  return rank(raw.map(map), q).slice(0, 12)
}

export async function catalogByGameId(id: number): Promise<CatalogGame | null> {
  const raw = (await post('games', `fields ${FIELDS}; where id = ${Math.trunc(id)}; limit 1;`)) as Raw[]
  return raw[0] ? map(raw[0]) : null
}

/** A Steam link pasted in the manual form: find the same game in the catalog by its Steam id. */
export async function catalogBySteamApp(appId: number): Promise<CatalogGame | null> {
  const rows = (await post('external_games', `fields game; where external_game_source = 1 & uid = "${Math.trunc(appId)}"; limit 1;`)) as { game?: number }[]
  const gameId = rows[0]?.game
  return gameId ? catalogByGameId(gameId) : null
}
