import { NextResponse, type NextRequest } from 'next/server'
import { getViewer } from '@/lib/data/viewer'
import { igdbIdsInLibrary } from '@/lib/data/games'
import { CatalogDown, searchCatalog } from '@/lib/igdb'

// Per person and per server instance: enough to stop a runaway loop without a shared store.
const hits = new Map<string, number[]>()
const LIMIT = 40
const WINDOW = 60_000

function allowed(user: string): boolean {
  const now = Date.now()
  const recent = (hits.get(user) ?? []).filter((t) => now - t < WINDOW)
  if (recent.length >= LIMIT) { hits.set(user, recent); return false }
  recent.push(now)
  hits.set(user, recent)
  return true
}

export async function GET(request: NextRequest) {
  const viewer = await getViewer()
  if (!viewer) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!allowed(viewer.me.userId)) return NextResponse.json({ error: 'slow-down' }, { status: 429 })

  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100)
  if (q.length < 2) return NextResponse.json({ results: [] })

  try {
    const found = await searchCatalog(q)
    const have = await igdbIdsInLibrary(found.map((g) => g.igdbId))
    return NextResponse.json({
      results: found.map((g) => ({
        igdbId: g.igdbId, title: g.title, year: g.year, developer: g.developer, cover: g.cover,
        description: g.description, tags: g.tags.length, inLibraryId: have.get(g.igdbId) ?? null,
      })),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    if (e instanceof CatalogDown) return NextResponse.json({ error: 'catalog-down' }, { status: 503 })
    throw e
  }
}
