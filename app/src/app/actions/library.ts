'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireViewer } from '@/lib/data/viewer'
import { allStatuses, type Status } from '@/lib/people'
import { slugify, type Tag, type TagKind } from '@/lib/filters'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }
const fail = (error: string) => ({ ok: false as const, error })
const SAVE_ERROR = 'Não deu para salvar. Confira a conexão e tente de novo.'
const ids = (v: unknown): number[] => (Array.isArray(v) ? [...new Set(v.filter((x): x is number => Number.isInteger(x) && x > 0))].slice(0, 500) : [])

function refresh() {
  revalidatePath('/')
  revalidatePath('/biblioteca')
  revalidatePath('/sortear')
}

/** A tag of our own. An existing one with the same name is reused, never duplicated. */
export async function createTag(name: string): Promise<Result<{ tag: Tag }>> {
  const { me } = await requireViewer()
  const clean = String(name ?? '').replace(/\s+/g, ' ').trim().slice(0, 28)
  const slug = slugify(clean)
  if (!clean || !slug) return fail('Dê um nome para a tag.')
  const supabase = await createClient()
  const found = await supabase.from('tags').select('id, kind, name, slug').eq('kind', 'nossa').eq('slug', slug).maybeSingle()
  let row = found.data
  if (!row) {
    const ins = await supabase.from('tags').insert({ kind: 'nossa', name: clean, slug, created_by: me.userId }).select('id, kind, name, slug').single()
    if (ins.error || !ins.data) return fail(SAVE_ERROR)
    row = ins.data
  }
  revalidatePath('/biblioteca')
  return { ok: true, tag: { id: row.id, kind: row.kind as TagKind, name: row.name, slug: row.slug } }
}

export async function setGameTag(gameId: number, tagId: number, on: boolean): Promise<Result> {
  await requireViewer()
  if (!Number.isInteger(gameId) || !Number.isInteger(tagId)) return fail('Tag inválida.')
  const supabase = await createClient()
  const { error } = on
    ? await supabase.from('game_tags').upsert({ game_id: gameId, tag_id: tagId }, { onConflict: 'game_id,tag_id', ignoreDuplicates: true })
    : await supabase.from('game_tags').delete().eq('game_id', gameId).eq('tag_id', tagId)
  if (error) return fail(SAVE_ERROR)
  refresh()
  revalidatePath(`/jogo/${gameId}`)
  return { ok: true }
}

export async function tagGames(gameIds: number[], tagId: number): Promise<Result> {
  await requireViewer()
  const list = ids(gameIds)
  if (!list.length || !Number.isInteger(tagId)) return fail('Escolha jogos e uma tag.')
  const supabase = await createClient()
  const { error } = await supabase.from('game_tags').upsert(list.map((game_id) => ({ game_id, tag_id: tagId })), { onConflict: 'game_id,tag_id', ignoreDuplicates: true })
  if (error) return fail(SAVE_ERROR)
  refresh()
  return { ok: true }
}

export async function setSharedStatusMany(gameIds: number[], status: Status): Promise<Result> {
  await requireViewer()
  const list = ids(gameIds)
  if (!list.length || !allStatuses.includes(status)) return fail('Situação inválida.')
  const supabase = await createClient()
  const { error } = await supabase.from('games').update({ shared_status: status }).in('id', list)
  if (error) return fail(SAVE_ERROR)
  refresh()
  return { ok: true }
}

export async function setArchivedMany(gameIds: number[], on: boolean): Promise<Result> {
  await requireViewer()
  const list = ids(gameIds)
  if (!list.length) return fail('Escolha jogos.')
  const supabase = await createClient()
  const { error } = await supabase.from('games').update({ archived_at: on ? new Date().toISOString() : null }).in('id', list)
  if (error) return fail(SAVE_ERROR)
  refresh()
  return { ok: true }
}

export async function saveFilter(name: string, query: string): Promise<Result<{ id: number }>> {
  const { me } = await requireViewer()
  const label = String(name ?? '').trim().slice(0, 28)
  const q = String(query ?? '').slice(0, 1000)
  if (!label) return fail('Dê um nome para o atalho.')
  if (!q || !/^[\w%.,~*()!'=&+-]*$/.test(q)) return fail('Esse filtro não pode ser salvo.')
  const supabase = await createClient()
  // Saving a name that exists replaces its filter.
  const have = await supabase.from('saved_filters').select('id').ilike('name', label.replace(/[%_\\]/g, '\\$&')).maybeSingle()
  const res = have.data
    ? await supabase.from('saved_filters').update({ query: q }).eq('id', have.data.id).select('id').single()
    : await supabase.from('saved_filters').insert({ name: label, query: q, created_by: me.userId }).select('id').single()
  if (res.error || !res.data) return fail(SAVE_ERROR)
  revalidatePath('/biblioteca')
  return { ok: true, id: res.data.id }
}

export async function removeFilter(id: number): Promise<Result> {
  await requireViewer()
  if (!Number.isInteger(id)) return fail('Atalho inválido.')
  const supabase = await createClient()
  const { error } = await supabase.from('saved_filters').delete().eq('id', id)
  if (error) return fail(SAVE_ERROR)
  revalidatePath('/biblioteca')
  return { ok: true }
}
