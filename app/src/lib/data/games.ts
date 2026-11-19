import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { personOf, type Person, type Slot, type Status } from '@/lib/people'
import { requireViewer } from './viewer'

export interface Mine { status: Status; wants: boolean; owned: boolean; finishedOn: string | null }
export type Marks = Record<Person, Mine>

export interface GameSummary {
  id: number
  title: string
  year: number | null
  developer: string | null
  cover: string | null
  shared: Status
  addedAt: string
  archived: boolean
  marks: Marks
}

export interface GameDetail extends GameSummary {
  description: string | null
  source: 'igdb' | 'manual'
  links: { id: number; store: string; url: string }[]
  coverPath: string | null
  tags: { id: number; kind: string; name: string }[]
}

export const blank = (): Mine => ({ status: 'lista', wants: false, owned: false, finishedOn: null })

interface StateRow { user_id: string; status: Status; wants: boolean; owned: boolean; finished_on: string | null }
interface GameRow {
  id: number; title: string; release_year: number | null; developer: string | null; cover_url: string | null
  cover_path: string | null; shared_status: Status; created_at: string; archived_at: string | null
  game_member_state: StateRow[]
}

const SUMMARY = 'id, title, release_year, developer, cover_url, cover_path, shared_status, created_at, archived_at, game_member_state(user_id, status, wants, owned, finished_on)'

/** Covers uploaded by hand live in a private bucket: they are shown through short-lived signed addresses. */
async function signCovers(paths: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  const unique = [...new Set(paths)]
  if (!unique.length) return out
  const supabase = await createClient()
  const { data } = await supabase.storage.from('capas').createSignedUrls(unique, 60 * 60)
  data?.forEach((d) => { if (d.path && d.signedUrl) out.set(d.path, d.signedUrl) })
  return out
}

function toSummary(r: GameRow, slots: Map<string, Slot>, signed: Map<string, string>): GameSummary {
  const marks: Marks = { danilo: blank(), maellen: blank() }
  for (const s of r.game_member_state ?? []) {
    const slot = slots.get(s.user_id)
    if (!slot) continue
    marks[personOf(slot)] = { status: s.status, wants: s.wants, owned: s.owned, finishedOn: s.finished_on }
  }
  return {
    id: r.id, title: r.title, year: r.release_year, developer: r.developer,
    cover: r.cover_url ?? (r.cover_path ? signed.get(r.cover_path) ?? null : null),
    shared: r.shared_status, addedAt: r.created_at, archived: !!r.archived_at, marks,
  }
}

async function slotMap(): Promise<Map<string, Slot>> {
  const { me, partner } = await requireViewer()
  const m = new Map<string, Slot>([[me.userId, me.slot]])
  if (partner) m.set(partner.userId, partner.slot)
  return m
}

/** Everything in the library, light enough to filter in the browser; archived games come flagged. */
export async function listGames(): Promise<GameSummary[]> {
  const supabase = await createClient()
  const [{ data, error }, slots] = await Promise.all([
    supabase.from('games').select(SUMMARY).is('removed_at', null).order('created_at', { ascending: false }).limit(5000),
    slotMap(),
  ])
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as unknown as GameRow[]
  const signed = await signCovers(rows.filter((r) => !r.cover_url && r.cover_path).map((r) => r.cover_path!))
  return rows.map((r) => toSummary(r, slots, signed))
}

export async function getGame(id: number): Promise<GameDetail | null> {
  const supabase = await createClient()
  const [{ data, error }, slots] = await Promise.all([
    supabase.from('games')
      .select(`${SUMMARY}, description, source, game_links(id, store, url), game_tags(tags(id, kind, name))`)
      .eq('id', id).is('removed_at', null).maybeSingle(),
    slotMap(),
  ])
  if (error) throw new Error(error.message)
  if (!data) return null
  const r = data as unknown as GameRow & {
    description: string | null; source: 'igdb' | 'manual'
    game_links: { id: number; store: string; url: string }[]
    game_tags: { tags: { id: number; kind: string; name: string } | null }[]
  }
  const signed = await signCovers(!r.cover_url && r.cover_path ? [r.cover_path] : [])
  return {
    ...toSummary(r, slots, signed),
    description: r.description, source: r.source, coverPath: r.cover_path,
    links: [...(r.game_links ?? [])].sort((a, b) => a.id - b.id),
    tags: (r.game_tags ?? []).flatMap((t) => (t.tags ? [t.tags] : [])),
  }
}

export interface Dupe { id: number; title: string; removed: boolean }

/** Is this catalog game (or a manual title + year) already in the club? Removed games count: they come back. */
export async function findDuplicate(by: { igdbId: number } | { title: string; year: number | null }): Promise<Dupe | null> {
  const supabase = await createClient()
  let q = supabase.from('games').select('id, title, removed_at')
  if ('igdbId' in by) q = q.eq('igdb_id', by.igdbId)
  else {
    const key = by.title.replace(/\s+/g, ' ').trim().toLowerCase()
    q = q.is('igdb_id', null).eq('title_key', key)
    q = by.year ? q.eq('release_year', by.year) : q.is('release_year', null)
  }
  const { data } = await q.limit(1)
  const row = data?.[0]
  return row ? { id: row.id, title: row.title, removed: !!row.removed_at } : null
}

export async function igdbIdsInLibrary(ids: number[]): Promise<Map<number, number>> {
  const out = new Map<number, number>()
  if (!ids.length) return out
  const supabase = await createClient()
  const { data } = await supabase.from('games').select('id, igdb_id').in('igdb_id', ids).is('removed_at', null)
  data?.forEach((r) => { if (r.igdb_id != null) out.set(Number(r.igdb_id), r.id) })
  return out
}

export const isMatch = (g: Pick<GameSummary, 'shared' | 'marks'>) =>
  g.marks.danilo.wants && g.marks.maellen.wants && g.shared !== 'zerado' && g.shared !== 'abandonado'
