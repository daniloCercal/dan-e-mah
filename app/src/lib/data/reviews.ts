import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { type Person } from '@/lib/people'
import { requireViewer } from './viewer'

export interface Review { rating: number; comment: string | null; recommends: boolean; wouldReplay: boolean; ratedAt: string }
export interface GameReviews {
  danilo: Review | null
  maellen: Review | null
  /** True when the other person has rated but the rating is hidden from you (blind ratings, you have not rated yet). */
  partnerRated: boolean
}

interface Row { user_id: string; rating: number; comment: string | null; recommends: boolean; would_replay: boolean; updated_at: string }

/** Only what the database lets this person read: with blind ratings on, the other rating stays out until they rate. */
export async function getReviews(gameId: number): Promise<GameReviews> {
  const { me, partner } = await requireViewer()
  const supabase = await createClient()
  const { data, error } = await supabase.from('reviews').select('user_id, rating, comment, recommends, would_replay, updated_at').eq('game_id', gameId)
  if (error) throw new Error(error.message)
  const out: GameReviews = { danilo: null, maellen: null, partnerRated: false }
  for (const r of (data ?? []) as Row[]) {
    const person: Person | null = r.user_id === me.userId ? me.person : partner && r.user_id === partner.userId ? partner.person : null
    if (!person) continue
    out[person] = { rating: Number(r.rating), comment: r.comment, recommends: r.recommends, wouldReplay: r.would_replay, ratedAt: r.updated_at }
  }
  const theirs = partner ? out[partner.person] : null
  if (partner && !theirs) {
    const { data: act } = await supabase.from('activity').select('id').eq('kind', 'rated').eq('game_id', gameId).eq('actor', partner.userId).limit(1)
    out.partnerRated = !!act?.length
  }
  return out
}
