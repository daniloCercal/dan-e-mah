'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireViewer } from '@/lib/data/viewer'
import { isLevel, isWallpaperId } from '@/lib/wallpaper'

type Result = { ok: true } | { ok: false; error: string }

/** Only known keys, validated: preferences are the person's own row and nothing else is stored there. */
export async function setPrefs(patch: {
  blindRatings?: boolean
  drawMode?: 'fila' | 'pacote'
  theme?: 'light' | 'dark' | null
  wallpaper?: { id?: string; level?: string }
}): Promise<Result> {
  const { me } = await requireViewer()
  const next: Record<string, unknown> = {}
  if (patch.blindRatings !== undefined) next.blindRatings = patch.blindRatings === true
  if (patch.drawMode !== undefined) {
    if (patch.drawMode !== 'fila' && patch.drawMode !== 'pacote') return { ok: false, error: 'Jeito de sortear inválido.' }
    next.drawMode = patch.drawMode
  }
  if (patch.theme !== undefined) {
    if (patch.theme !== null && patch.theme !== 'light' && patch.theme !== 'dark') return { ok: false, error: 'Tema inválido.' }
    next.theme = patch.theme
  }
  const supabase = await createClient()
  const { data } = await supabase.from('members').select('prefs').eq('user_id', me.userId).single()
  const prev = (data?.prefs ?? {}) as Record<string, unknown>
  if (patch.wallpaper) {
    const w = patch.wallpaper
    if ((w.id !== undefined && !isWallpaperId(w.id)) || (w.level !== undefined && !isLevel(w.level))) return { ok: false, error: 'Papel de parede inválido.' }
    const old = (prev.wallpaper ?? {}) as { id?: string; level?: string }
    next.wallpaper = { id: w.id ?? old.id ?? 'liso', level: w.level ?? old.level ?? 'normal' }
  }
  const { error } = await supabase.from('members').update({ prefs: { ...prev, ...next } }).eq('user_id', me.userId)
  if (error) return { ok: false, error: 'Não deu para salvar. Confira a conexão e tente de novo.' }
  revalidatePath('/', 'layout')
  return { ok: true }
}
