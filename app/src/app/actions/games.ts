'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireViewer } from '@/lib/data/viewer'
import { findDuplicate } from '@/lib/data/games'
import { catalogByGameId, catalogBySteamApp, CatalogDown, type CatalogGame } from '@/lib/igdb'
import { parseLink, steamAppId } from '@/lib/links'
import { allStatuses, isFinished, type Status } from '@/lib/people'
import type { MascotId } from '@/components/Mascot'

type Fail = { ok: false; error: string }
type Done<T = object> = { ok: true } & T
export type Result<T = object> = Done<T> | Fail

const fail = (error: string): Fail => ({ ok: false, error })
const SAVE_ERROR = 'Não deu para salvar. Confira a conexão e tente de novo.'

export type CoverInput = { kind: 'upload'; path: string } | { kind: 'url'; url: string } | null

function validCover(c: CoverInput | undefined): CoverInput | undefined | 'bad' {
  if (c === undefined || c === null) return c
  if (c.kind === 'upload') return /^[0-9a-f-]{36}\.webp$/.test(c.path) ? c : 'bad'
  return /^https:\/\/\S+$/.test(c.url) && c.url.length <= 500 ? c : 'bad'
}

function refresh(id?: number) {
  revalidatePath('/')
  revalidatePath('/biblioteca')
  if (id) revalidatePath(`/jogo/${id}`)
}

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Writes the signed-in person's own row for a game: the only row they are allowed to write. */
async function writeMine(gameId: number, patch: { status?: Status; wants?: boolean; finished_on?: string | null }) {
  const { me } = await requireViewer()
  const supabase = await createClient()
  return supabase.from('game_member_state').upsert({ game_id: gameId, user_id: me.userId, ...patch }, { onConflict: 'game_id,user_id' })
}

const today = () => new Date().toISOString().slice(0, 10)

export interface AddInput {
  igdbId?: number
  manual?: { title: string; year?: number | null; developer?: string; cover?: CoverInput; links?: string[] }
  shared: Status
  wants: boolean
}

export async function addGame(input: AddInput): Promise<Result<{ id: number; restored: boolean }> | { ok: false; error: string; duplicateId?: number }> {
  const { me } = await requireViewer()
  const shared: Status = (['lista', 'jogando', 'zerado'] as const).includes(input.shared as 'lista') ? input.shared : 'lista'
  const wants = input.wants === true
  const supabase = await createClient()

  let catalog: CatalogGame | null = null
  if (input.igdbId !== undefined) {
    if (!Number.isInteger(input.igdbId) || input.igdbId <= 0) return fail('Jogo inválido.')
    const dupe = await findDuplicate({ igdbId: input.igdbId })
    if (dupe && !dupe.removed) return { ok: false, error: `${dupe.title} já está na biblioteca.`, duplicateId: dupe.id }
    try {
      catalog = await catalogByGameId(input.igdbId)
    } catch (e) {
      if (e instanceof CatalogDown) return fail('O catálogo não respondeu agora. Tente de novo ou cadastre à mão.')
      throw e
    }
    if (!catalog) return fail('Não achamos esse jogo no catálogo.')
  }

  const m = input.manual
  const title = text(m?.title, 200) || catalog?.title || ''
  if (!title) return fail('Falta o título.')
  const year = m ? (Number.isInteger(m.year) && m.year! >= 1950 && m.year! <= 2100 ? m.year! : catalog?.year ?? null) : catalog?.year ?? null
  const cover = validCover(m?.cover)
  if (cover === 'bad') return fail('A capa enviada não é válida.')
  const links: string[] = []
  for (const l of m?.links ?? []) {
    const p = parseLink(l)
    if (!p) return fail('Um dos links de loja não é válido.')
    if (!links.includes(p.url)) links.push(p.url)
  }
  const steamLink = links.map(steamAppId).find((x) => x !== undefined)
  if (catalog?.steamAppId && !links.some((l) => steamAppId(l) === catalog.steamAppId)) links.push(`https://store.steampowered.com/app/${catalog.steamAppId}`)

  if (!catalog) {
    const dupe = await findDuplicate({ title, year })
    if (dupe && !dupe.removed) return { ok: false, error: `${dupe.title} já está na biblioteca.`, duplicateId: dupe.id }
    if (dupe) return restore(dupe.id, shared, wants)
  } else {
    const dupe = await findDuplicate({ igdbId: catalog.igdbId })
    if (dupe) return restore(dupe.id, shared, wants)
  }

  const row = {
    title, release_year: year,
    developer: text(m?.developer, 120) || catalog?.developer || null,
    description: catalog?.description ?? null,
    source: catalog ? 'igdb' : 'manual',
    igdb_id: catalog?.igdbId ?? null,
    steam_app_id: catalog?.steamAppId ?? steamLink ?? null,
    cover_url: cover?.kind === 'url' ? cover.url : cover ? null : catalog?.cover ?? null,
    cover_path: cover?.kind === 'upload' ? cover.path : null,
    shared_status: shared,
    added_by: me.userId,
  }
  let ins = await supabase.from('games').insert(row).select('id').single()
  // A Steam id already taken by another entry must not block the add; the link is kept anyway.
  if (ins.error?.code === '23505' && row.steam_app_id) ins = await supabase.from('games').insert({ ...row, steam_app_id: null }).select('id').single()
  if (ins.error || !ins.data) return ins.error?.code === '23505' ? fail('Esse jogo já está na biblioteca.') : fail(SAVE_ERROR)
  const id = ins.data.id as number

  if (links.length) {
    await supabase.from('game_links').insert(links.map((url) => ({ game_id: id, url, store: parseLink(url)!.store })))
  }
  if (catalog?.tags.length) {
    const { data: tags } = await supabase.from('tags').select('id, kind, slug').in('slug', catalog.tags.map((t) => t.slug))
    const ids = (tags ?? []).filter((t) => catalog!.tags.some((c) => c.kind === t.kind && c.slug === t.slug)).map((t) => ({ game_id: id, tag_id: t.id }))
    if (ids.length) await supabase.from('game_tags').insert(ids)
  }
  await writeMine(id, mineFor(shared, wants))
  refresh(id)
  return { ok: true, id, restored: false }
}

function mineFor(shared: Status, wants: boolean) {
  return {
    wants,
    status: (shared === 'lista' && wants ? 'quero' : shared) as Status,
    finished_on: isFinished(shared) ? today() : null,
  }
}

/** A removed game that is added again comes back with everything it had. */
async function restore(id: number, shared: Status, wants: boolean): Promise<Result<{ id: number; restored: boolean }>> {
  const supabase = await createClient()
  const { error } = await supabase.from('games').update({ removed_at: null, archived_at: null }).eq('id', id)
  if (error) return fail(SAVE_ERROR)
  await writeMine(id, mineFor(shared, wants))
  refresh(id)
  return { ok: true, id, restored: true }
}

/** Manual form: a pasted Steam link is matched against the catalog; nothing is invented when there is no match. */
export async function lookupSteam(url: string): Promise<Result<{ game: { igdbId: number; title: string; year: number | null; developer: string | null; cover: string | null } | null; inLibraryId: number | null }>> {
  await requireViewer()
  const app = steamAppId(String(url))
  if (app === undefined) return fail('Não parece um link de jogo da Steam.')
  try {
    const g = await catalogBySteamApp(app)
    if (!g) return { ok: true, game: null, inLibraryId: null }
    const dupe = await findDuplicate({ igdbId: g.igdbId })
    return {
      ok: true,
      game: { igdbId: g.igdbId, title: g.title, year: g.year, developer: g.developer, cover: g.cover },
      inLibraryId: dupe && !dupe.removed ? dupe.id : null,
    }
  } catch (e) {
    if (e instanceof CatalogDown) return fail('O catálogo não respondeu agora.')
    throw e
  }
}

export async function setWants(id: number, wants: boolean): Promise<Result> {
  const { error } = await writeMine(id, { wants: wants === true })
  if (error) return fail(SAVE_ERROR)
  refresh(id)
  return { ok: true }
}

export async function setMyStatus(id: number, status: Status): Promise<Result> {
  if (!allStatuses.includes(status)) return fail('Situação inválida.')
  const supabase = await createClient()
  const { me } = await requireViewer()
  const { data: cur } = await supabase.from('game_member_state').select('finished_on').eq('game_id', id).eq('user_id', me.userId).maybeSingle()
  const finished_on = isFinished(status) ? cur?.finished_on ?? today() : null
  const { error } = await writeMine(id, { status, finished_on })
  if (error) return fail(SAVE_ERROR)
  refresh(id)
  return { ok: true }
}

export async function setSharedStatus(id: number, status: Status): Promise<Result> {
  if (!allStatuses.includes(status)) return fail('Situação inválida.')
  await requireViewer()
  const supabase = await createClient()
  const { error } = await supabase.from('games').update({ shared_status: status }).eq('id', id)
  if (error) return fail(SAVE_ERROR)
  refresh(id)
  return { ok: true }
}

export interface EditInput { title: string; cover: CoverInput | undefined; links: string[] }

/** `cover: undefined` leaves the cover alone, `null` takes the own cover away (the catalog's one comes back). */
export async function updateGame(id: number, input: EditInput): Promise<Result> {
  await requireViewer()
  const title = text(input.title, 200)
  if (!title) return fail('Falta o título.')
  const cover = validCover(input.cover)
  if (cover === 'bad') return fail('A capa enviada não é válida.')
  const links: string[] = []
  for (const l of input.links ?? []) {
    const p = parseLink(l)
    if (!p) return fail('Um dos links de loja não é válido.')
    if (!links.includes(p.url)) links.push(p.url)
  }
  const supabase = await createClient()
  const { data: game } = await supabase.from('games').select('igdb_id').eq('id', id).maybeSingle()
  if (!game) return fail('Esse jogo não existe mais.')

  const patch: Record<string, unknown> = { title }
  if (cover !== undefined) {
    if (cover === null) {
      patch.cover_path = null
      if (game.igdb_id) {
        const c = await catalogByGameId(Number(game.igdb_id)).catch(() => null)
        patch.cover_url = c?.cover ?? null
      } else patch.cover_url = null
    } else {
      patch.cover_path = cover.kind === 'upload' ? cover.path : null
      patch.cover_url = cover.kind === 'url' ? cover.url : null
    }
  }
  const up = await supabase.from('games').update(patch).eq('id', id)
  if (up.error) return up.error.code === '23505' ? fail('Já existe outro jogo com esse título e ano.') : fail(SAVE_ERROR)

  const { data: have } = await supabase.from('game_links').select('id, url').eq('game_id', id)
  const drop = (have ?? []).filter((h) => !links.includes(h.url)).map((h) => h.id)
  if (drop.length) await supabase.from('game_links').delete().in('id', drop)
  const add = links.filter((u) => !(have ?? []).some((h) => h.url === u))
  if (add.length) await supabase.from('game_links').insert(add.map((url) => ({ game_id: id, url, store: parseLink(url)!.store })))
  refresh(id)
  return { ok: true }
}

export async function setArchived(id: number, on: boolean): Promise<Result> {
  await requireViewer()
  const supabase = await createClient()
  const { error } = await supabase.from('games').update({ archived_at: on ? new Date().toISOString() : null }).eq('id', id)
  if (error) return fail(SAVE_ERROR)
  refresh(id)
  return { ok: true }
}

/** Hides the game; the undo in the toast (or adding it again) brings it back with every note and state. */
export async function setRemoved(id: number, on: boolean): Promise<Result> {
  await requireViewer()
  const supabase = await createClient()
  const { error } = await supabase.from('games').update({ removed_at: on ? new Date().toISOString() : null }).eq('id', id)
  if (error) return fail(SAVE_ERROR)
  refresh(id)
  return { ok: true }
}

export async function setMascot(id: MascotId): Promise<Result> {
  if (id !== 'fantasma' && id !== 'roxinha') return fail('Mascote inválido.')
  const { me } = await requireViewer()
  const supabase = await createClient()
  const { error } = await supabase.from('members').update({ mascot: id }).eq('user_id', me.userId)
  if (error) return fail(SAVE_ERROR)
  revalidatePath('/', 'layout')
  return { ok: true }
}
