'use client'

import { useRef, useState, type FormEvent } from 'react'
import { saveProfile } from '@/app/actions/profile'
import { Mark } from '@/components/Marks'
import { SaveButton, SaveError } from '@/components/States'
import { initialOf, type Person } from '@/lib/people'
import { useSave } from '@/lib/useSave'
import { loadImage, readFile, toJpegBlob, type Crop } from '@/lib/media'
import { PhotoEditor } from './PhotoEditor'

interface Props { person: Person; name: string; hasPhoto: boolean; nicknames: string[]; useNicknames: boolean }

/** Photo (with crop), name and nicknames: one form, one save. */
export function ProfileForm({ person, name: savedName, hasPhoto, nicknames: savedNicknames, useNicknames: savedUse }: Props) {
  const file = useRef<HTMLInputElement>(null)
  const saving = useSave()
  const [name, setName] = useState(savedName)
  const [nicknames, setNicknames] = useState(savedNicknames.join('\n'))
  const [use, setUse] = useState(savedUse)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [crop, setCrop] = useState<Crop>({ zoom: 1, x: 0, y: 0 })
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const pick = async (f: File | undefined) => {
    if (!f) return
    setError('')
    setDone(false)
    try {
      setImage(await loadImage(await readFile(f)))
      setCrop({ zoom: 1, x: 0, y: 0 })
      setRemoved(false)
    } catch {
      setError('Não deu para abrir essa imagem. Tente outra foto, em JPG ou PNG.')
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setDone(false)
    const res = await saving.run(async () => {
      const form = new FormData()
      form.set('name', name)
      form.set('nicknames', nicknames)
      if (use) form.set('useNicknames', 'on')
      if (image) {
        const blob = await toJpegBlob(image, 320, crop)
        if (!blob) return { ok: false as const, error: 'Não deu para preparar a foto. Tente outra.' }
        form.set('photo', blob, 'foto.jpg')
      } else if (removed) form.set('removePhoto', 'on')
      return saveProfile(form)
    })
    if (res?.ok) {
      setImage(null)
      setRemoved(false)
      setDone(true)
    }
  }

  const current = hasPhoto && !removed

  return (
    <form className="editor profile-form" onSubmit={(e) => void submit(e)} aria-busy={saving.pending}>
      <fieldset className="field">
        <legend className="editor-label">Foto de perfil</legend>
        <input ref={file} className="sr-only" type="file" accept="image/*" tabIndex={-1} aria-label="Escolher foto de perfil" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = '' }} />
        {image ? (
          <PhotoEditor image={image} crop={crop} setCrop={setCrop} />
        ) : (
          <p className="quiet">
            {current ? 'A foto aparece no lugar da inicial, sempre dentro do anel da sua cor, e o outro sócio também a vê.' : `Sem foto, o clube mostra a sua inicial, ${initialOf(person)}. Com foto, ela aparece dentro do anel da sua cor.`}
          </p>
        )}
        <div className="editor-actions">
          <button type="button" className="btn btn--plain" onClick={() => file.current?.click()}>{image || current ? 'Escolher outra foto' : 'Escolher foto'}</button>
          {image && <button type="button" className="btn btn--plain" onClick={() => setImage(null)}>Desistir desta foto</button>}
          {!image && current && <button type="button" className="btn btn--plain" onClick={() => { setRemoved(true); setDone(false) }}>Remover foto</button>}
        </div>
        {removed && <p className="quiet" role="status">A foto sai quando você salvar. Volta a aparecer a inicial {initialOf(person)}.</p>}
        {error && <p className="field-error" role="alert">{error}</p>}
      </fieldset>

      <div className="field">
        <label htmlFor="p-nome" className="editor-label">Nome que aparece</label>
        <input id="p-nome" type="text" value={name} maxLength={24} required onChange={(e) => { setName(e.target.value); setDone(false) }} />
      </div>

      <fieldset className="field">
        <legend className="editor-label">Apelidos</legend>
        <label htmlFor="p-apelidos" className="sr-only">Apelidos, um por linha</label>
        <textarea id="p-apelidos" rows={4} value={nicknames} placeholder="Um apelido por linha" onChange={(e) => { setNicknames(e.target.value); setDone(false) }} />
        <label className="switch">
          <input type="checkbox" checked={use} onChange={(e) => { setUse(e.target.checked); setDone(false) }} />
          <span className="switch-ui" aria-hidden="true" />
          Usar apelidos nas saudações
        </label>
        <p className="quiet">Ligado, o início sorteia um apelido a cada visita. Desligado, usa o seu nome. Até 8 apelidos.</p>
      </fieldset>

      {saving.failed && <SaveError>{saving.error ?? ''} O que você escolheu continua aqui.</SaveError>}
      <div className="editor-actions">
        <SaveButton pending={saving.pending} failed={saving.failed} label="Salvar perfil" />
      </div>
      <p className="saved-msg" role="status">{saving.pending ? 'Salvando o perfil' : done ? 'Perfil salvo.' : ''}</p>
    </form>
  )
}

/** The big avatar at the top of the page. */
export function ProfileMark({ person }: { person: Person }) {
  return <Mark person={person} size={96} named={false} />
}
