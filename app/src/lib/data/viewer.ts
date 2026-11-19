import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { personOf, type Member, type Slot } from '@/lib/people'
import type { MascotId } from '@/components/Mascot'

export interface Prefs { blindRatings: boolean; drawMode: 'fila' | 'pacote' }

export interface Viewer {
  me: Member
  partner: Member | null
  /** The signed-in member's own preferences; the other one's are theirs. */
  prefs: Prefs
}

interface MemberRow { user_id: string; slot: Slot; display_name: string; mascot: MascotId | null; prefs: Record<string, unknown> | null }

const toMember = (r: MemberRow): Member => ({
  userId: r.user_id, slot: r.slot, person: personOf(r.slot), name: r.display_name, mascot: r.mascot,
})

/** The signed-in member and the other one; null for visitors and for accounts that are not members. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const uid = data?.claims?.sub
  if (!uid) return null
  const { data: rows } = await supabase.from('members').select('user_id, slot, display_name, mascot, prefs')
  const all = (rows ?? []) as MemberRow[]
  const me = all.find((r) => r.user_id === uid)
  if (!me) return null
  const other = all.find((r) => r.user_id !== uid)
  const p = me.prefs ?? {}
  const prefs: Prefs = { blindRatings: p.blindRatings === true, drawMode: p.drawMode === 'pacote' ? 'pacote' : 'fila' }
  return { me: toMember(me), partner: other ? toMember(other) : null, prefs }
})

/** For pages and actions: a member or the door. */
export async function requireViewer(): Promise<Viewer> {
  const v = await getViewer()
  if (!v) throw new Error('not a member')
  return v
}
