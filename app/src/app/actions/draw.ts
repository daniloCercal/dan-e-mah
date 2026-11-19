'use server'

import { createClient } from '@/lib/supabase/server'
import { requireViewer } from '@/lib/data/viewer'

export type DrawResult =
  | { ok: true; pickedId: number | null; poolIds: number[] }
  | { ok: false; error: string }

export interface DrawInput { onlyMatches: boolean; moods: string[]; modes: string[]; exceptId: number | null }

const slugs = (v: unknown): string[] | null => {
  if (!Array.isArray(v) || v.length > 30) return null
  return v.every((s) => typeof s === 'string' && /^[a-z0-9-]{1,40}$/.test(s)) ? (v as string[]) : null
}

/** The game is chosen here, in the database, before the screen plays anything; the animation only shows this answer. */
export async function drawGame(input: DrawInput): Promise<DrawResult> {
  await requireViewer()
  const moods = slugs(input?.moods)
  const modes = slugs(input?.modes)
  if (!moods || !modes) return { ok: false, error: 'Filtro inválido.' }
  const exceptId = Number.isInteger(input.exceptId) && (input.exceptId as number) > 0 ? input.exceptId : null
  const args = { only_matches: input.onlyMatches === true, mood_slugs: moods, mode_slugs: modes }
  const supabase = await createClient()
  const [pick, pool] = await Promise.all([
    supabase.rpc('draw_pick', { ...args, except_id: exceptId }),
    supabase.rpc('draw_candidates', args),
  ])
  if (pick.error || pool.error) return { ok: false, error: 'Não deu para sortear agora. Confira a conexão e tente de novo.' }
  return { ok: true, pickedId: pick.data === null ? null : Number(pick.data), poolIds: ((pool.data ?? []) as number[]).map(Number) }
}
