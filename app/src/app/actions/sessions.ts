'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireViewer } from '@/lib/data/viewer'
import type { Person } from '@/lib/people'

type Result = { ok: true; id: number } | { ok: false; error: string }
const SAVE_ERROR = 'Não deu para salvar. Confira a conexão e tente de novo.'

export interface SessionInput {
  /** Present when editing. */
  id?: number
  gameId: number
  date: string
  minutes: number
  who: Person[]
  note?: string
  moment?: string
}

function refresh(gameId: number) {
  revalidatePath('/')
  revalidatePath('/diario')
  revalidatePath('/nos')
  revalidatePath(`/jogo/${gameId}`)
}

/** Creates or edits a session together with who played, in one database call. */
export async function saveSession(input: SessionInput): Promise<Result> {
  const { me, partner } = await requireViewer()
  const fail = (error: string): Result => ({ ok: false, error })
  if (!Number.isInteger(input.gameId) || input.gameId <= 0) return fail('Escolha o jogo.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(Date.parse(`${input.date}T12:00:00Z`))) return fail('Data inválida.')
  if (!Number.isInteger(input.minutes) || input.minutes < 1 || input.minutes > 1440) return fail('O tempo precisa ficar entre 1 minuto e 24 horas.')
  const who = [...new Set(input.who)].flatMap((p) => (p === me.person ? [me.userId] : partner && p === partner.person ? [partner.userId] : []))
  if (!who.length) return fail('Diga quem jogou.')
  const note = String(input.note ?? '').trim()
  const moment = String(input.moment ?? '').trim()
  if (note.length > 1000 || moment.length > 1000) return fail('O texto passou de 1000 letras.')
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('save_play_session', {
    p_id: input.id ?? null, p_game_id: input.gameId, p_played_on: input.date, p_minutes: input.minutes,
    p_note: note, p_moment: moment, p_who: who,
  })
  if (error) return fail(SAVE_ERROR)
  refresh(input.gameId)
  return { ok: true, id: Number(data) }
}

export async function removeSession(id: number, gameId: number): Promise<{ ok: boolean; error?: string }> {
  await requireViewer()
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: 'Sessão inválida.' }
  const supabase = await createClient()
  const { error } = await supabase.from('play_sessions').delete().eq('id', id)
  if (error) return { ok: false, error: SAVE_ERROR }
  refresh(gameId)
  return { ok: true }
}
