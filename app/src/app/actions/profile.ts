'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireViewer } from '@/lib/data/viewer'

type Result = { ok: true } | { ok: false; error: string }

const MAX_PHOTO = 400 * 1024
const MAX_NICKNAMES = 8

/** The whole profile form in one save: name, nicknames, and the photo (a cropped JPEG made in the browser, or its removal). */
export async function saveProfile(form: FormData): Promise<Result> {
  const { me } = await requireViewer()
  const name = String(form.get('name') ?? '').replace(/\s+/g, ' ').trim()
  if (name.length < 1 || name.length > 24) return { ok: false, error: 'O nome precisa ter de 1 a 24 letras.' }

  const nicknames = [...new Set(String(form.get('nicknames') ?? '').split('\n').map((n) => n.replace(/\s+/g, ' ').trim()).filter(Boolean))]
  if (nicknames.length > MAX_NICKNAMES) return { ok: false, error: `Use no máximo ${MAX_NICKNAMES} apelidos.` }
  if (nicknames.some((n) => n.length > 24)) return { ok: false, error: 'Cada apelido pode ter até 24 letras.' }

  const supabase = await createClient()
  const patch: Record<string, unknown> = { display_name: name, nicknames, use_nicknames: form.get('useNicknames') === 'on' }
  const oldPath = me.photoPath
  let newPath: string | null | undefined

  const photo = form.get('photo')
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO) return { ok: false, error: 'A foto ficou grande demais. Tente outra.' }
    const bytes = new Uint8Array(await photo.arrayBuffer())
    if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) return { ok: false, error: 'A foto precisa ser um JPEG.' }
    newPath = `${me.userId}/foto-${Date.now()}.jpg`
    const { error } = await supabase.storage.from('fotos').upload(newPath, bytes, { contentType: 'image/jpeg', cacheControl: '3600' })
    if (error) return { ok: false, error: 'Não deu para enviar a foto. Confira a conexão e tente de novo.' }
    patch.photo_path = newPath
  } else if (form.get('removePhoto') === 'on') {
    newPath = null
    patch.photo_path = null
  }

  const { error } = await supabase.from('members').update(patch).eq('user_id', me.userId)
  if (error) {
    if (newPath) await supabase.storage.from('fotos').remove([newPath])
    return { ok: false, error: 'Não deu para salvar. Confira a conexão e tente de novo.' }
  }
  if (newPath !== undefined && oldPath) await supabase.storage.from('fotos').remove([oldPath])
  revalidatePath('/', 'layout')
  return { ok: true }
}
