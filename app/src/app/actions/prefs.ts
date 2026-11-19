'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireViewer } from '@/lib/data/viewer'

type Result = { ok: true } | { ok: false; error: string }

/** Only known keys, validated: preferences are the person's own row and nothing else is stored there. */
export async function setPrefs(patch: { blindRatings?: boolean; drawMode?: 'fila' | 'pacote' }): Promise<Result> {
  const { me } = await requireViewer()
  const next: Record<string, unknown> = {}
  if (patch.blindRatings !== undefined) next.blindRatings = patch.blindRatings === true
  if (patch.drawMode !== undefined) {
    if (patch.drawMode !== 'fila' && patch.drawMode !== 'pacote') return { ok: false, error: 'Jeito de sortear inválido.' }
    next.drawMode = patch.drawMode
  }
  const supabase = await createClient()
  const { data } = await supabase.from('members').select('prefs').eq('user_id', me.userId).single()
  const { error } = await supabase.from('members').update({ prefs: { ...(data?.prefs ?? {}), ...next } }).eq('user_id', me.userId)
  if (error) return { ok: false, error: 'Não deu para salvar. Confira a conexão e tente de novo.' }
  revalidatePath('/', 'layout')
  return { ok: true }
}
