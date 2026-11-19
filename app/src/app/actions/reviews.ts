'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireViewer } from '@/lib/data/viewer'

type Result = { ok: true } | { ok: false; error: string }
const SAVE_ERROR = 'Não deu para salvar. Confira a conexão e tente de novo.'

export interface ReviewInput { rating: number; comment: string; recommends: boolean; wouldReplay: boolean }

/** Writes the signed-in person's own rating for a game; the database refuses anyone else's. */
export async function rateGame(gameId: number, input: ReviewInput): Promise<Result> {
  const { me } = await requireViewer()
  if (!Number.isInteger(gameId) || gameId <= 0) return { ok: false, error: 'Jogo inválido.' }
  const rating = Number(input?.rating)
  if (!Number.isFinite(rating) || rating < 0 || rating > 10 || rating * 2 !== Math.trunc(rating * 2)) return { ok: false, error: 'A nota vai de 0 a 10, de meio em meio ponto.' }
  const comment = typeof input.comment === 'string' ? input.comment.trim().slice(0, 2000) : ''
  const supabase = await createClient()
  const { error } = await supabase.from('reviews').upsert({
    game_id: gameId, user_id: me.userId, rating, comment: comment || null,
    recommends: input.recommends === true, would_replay: input.wouldReplay === true,
  }, { onConflict: 'game_id,user_id' })
  if (error) return { ok: false, error: SAVE_ERROR }
  revalidatePath('/')
  revalidatePath('/biblioteca')
  revalidatePath('/nos')
  revalidatePath(`/jogo/${gameId}`)
  return { ok: true }
}

export async function removeMyRating(gameId: number): Promise<Result> {
  const { me } = await requireViewer()
  if (!Number.isInteger(gameId) || gameId <= 0) return { ok: false, error: 'Jogo inválido.' }
  const supabase = await createClient()
  const { error } = await supabase.from('reviews').delete().eq('game_id', gameId).eq('user_id', me.userId)
  if (error) return { ok: false, error: SAVE_ERROR }
  revalidatePath('/biblioteca')
  revalidatePath('/nos')
  revalidatePath(`/jogo/${gameId}`)
  return { ok: true }
}
