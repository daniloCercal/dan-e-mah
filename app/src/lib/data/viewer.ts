import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { personOf, type Member, type Slot } from '@/lib/people'
import type { MascotId } from '@/components/Mascot'

export interface Viewer {
  me: Member
  partner: Member | null
}

interface MemberRow { user_id: string; slot: Slot; display_name: string; mascot: MascotId | null }

const toMember = (r: MemberRow): Member => ({
  userId: r.user_id, slot: r.slot, person: personOf(r.slot), name: r.display_name, mascot: r.mascot,
})

/** The signed-in member and the other one; null for visitors and for accounts that are not members. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const uid = data?.claims?.sub
  if (!uid) return null
  const { data: rows } = await supabase.from('members').select('user_id, slot, display_name, mascot')
  const all = (rows ?? []) as MemberRow[]
  const me = all.find((r) => r.user_id === uid)
  if (!me) return null
  const other = all.find((r) => r.user_id !== uid)
  return { me: toMember(me), partner: other ? toMember(other) : null }
})

/** For pages and actions: a member or the door. */
export async function requireViewer(): Promise<Viewer> {
  const v = await getViewer()
  if (!v) throw new Error('not a member')
  return v
}
