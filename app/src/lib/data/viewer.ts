import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { personOf, type Member, type Slot } from '@/lib/people'
import { isLevel, isWallpaperId, noWallpaper, type WallChoice } from '@/lib/wallpaper'
import type { MascotId } from '@/components/Mascot'

export type ThemeChoice = 'light' | 'dark' | null
export interface Prefs { blindRatings: boolean; drawMode: 'fila' | 'pacote'; theme: ThemeChoice; wallpaper: WallChoice }

export interface Viewer {
  me: Member
  partner: Member | null
  /** The signed-in member's own preferences; the other one's are theirs. */
  prefs: Prefs
}

interface MemberRow {
  user_id: string; slot: Slot; display_name: string; mascot: MascotId | null; prefs: Record<string, unknown> | null
  photo_path: string | null; nicknames: string[] | null; use_nicknames: boolean
}

const toMember = (r: MemberRow, photos: Map<string, string>): Member => ({
  userId: r.user_id, slot: r.slot, person: personOf(r.slot), name: r.display_name, mascot: r.mascot,
  photo: r.photo_path ? photos.get(r.photo_path) ?? null : null, photoPath: r.photo_path,
  nicknames: r.nicknames ?? [], useNicknames: r.use_nicknames,
})

/** The signed-in member and the other one; null for visitors and for accounts that are not members. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const uid = data?.claims?.sub
  if (!uid) return null
  const { data: rows } = await supabase.from('members').select('user_id, slot, display_name, mascot, prefs, photo_path, nicknames, use_nicknames')
  const all = (rows ?? []) as MemberRow[]
  const me = all.find((r) => r.user_id === uid)
  if (!me) return null
  const other = all.find((r) => r.user_id !== uid)
  const p = me.prefs ?? {}
  const w = (p.wallpaper ?? {}) as { id?: unknown; level?: unknown }
  const prefs: Prefs = {
    blindRatings: p.blindRatings === true,
    drawMode: p.drawMode === 'pacote' ? 'pacote' : 'fila',
    theme: p.theme === 'light' || p.theme === 'dark' ? p.theme : null,
    wallpaper: { id: isWallpaperId(w.id) ? w.id : noWallpaper.id, level: isLevel(w.level) ? w.level : noWallpaper.level },
  }
  // Photos live in a private bucket: both members get short-lived signed addresses, one call for the two.
  const paths = all.flatMap((r) => (r.photo_path ? [r.photo_path] : []))
  const photos = new Map<string, string>()
  if (paths.length) {
    const { data: signed } = await supabase.storage.from('fotos').createSignedUrls(paths, 60 * 60)
    signed?.forEach((d) => { if (d.path && d.signedUrl) photos.set(d.path, d.signedUrl) })
  }
  return { me: toMember(me, photos), partner: other ? toMember(other, photos) : null, prefs }
})

/** For pages and actions: a member or the door. */
export async function requireViewer(): Promise<Viewer> {
  const v = await getViewer()
  if (!v) throw new Error('not a member')
  return v
}
