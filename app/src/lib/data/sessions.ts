import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { personOf, type Slot } from '@/lib/people'
import type { Session } from '@/lib/sessions'
import { requireViewer } from './viewer'

interface Row {
  id: number; game_id: number; played_on: string; minutes: number; note: string | null; moment: string | null
  session_participants: { user_id: string }[]
}

/** Newest first. Pass a game to get only its sessions. */
export async function listSessions(gameId?: number): Promise<Session[]> {
  const { me, partner } = await requireViewer()
  const slots = new Map<string, Slot>([[me.userId, me.slot]])
  if (partner) slots.set(partner.userId, partner.slot)
  const supabase = await createClient()
  let q = supabase.from('play_sessions')
    .select('id, game_id, played_on, minutes, note, moment, session_participants(user_id)')
    .order('played_on', { ascending: false }).order('id', { ascending: false }).limit(5000)
  if (gameId !== undefined) q = q.eq('game_id', gameId)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id, gameId: r.game_id, date: r.played_on, minutes: r.minutes, note: r.note, moment: r.moment,
    who: r.session_participants.flatMap((p) => { const s = slots.get(p.user_id); return s ? [personOf(s)] : [] }).sort(),
  }))
}
