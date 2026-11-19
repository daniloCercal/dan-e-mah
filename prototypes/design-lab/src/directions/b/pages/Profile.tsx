import { WallpaperPicker } from './WallpaperPicker'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { maellenNicknames, other, people, type PersonId } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { B } from '../store'
import { nameOf, useProfile } from '../lib/profile'
import { useSave } from '../lib/latency'
import { drawCover, loadImage, readFile, toJpeg, type Crop } from '../lib/media'
import { Mark } from '../components/Marks'
import { SaveButton, SaveError } from '../components/States'
import { IconBack } from '../components/icons'

const clamp = (v: number) => Math.max(-1, Math.min(1, v))
const VIEW = 240

/** Square crop: drag (or use the arrow keys) to position, slider to zoom. */
function PhotoEditor({ image, crop, setCrop }: { image: HTMLImageElement; crop: Crop; setCrop: (c: Crop) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ x: number; y: number; crop: Crop } | null>(null)

  useEffect(() => {
    if (canvas.current) drawCover(canvas.current, image, VIEW * 2, VIEW * 2, crop)
  }, [image, crop])

  // How far the picture can travel inside the square, in screen pixels, for the current zoom.
  const slack = () => {
    const scale = Math.max(VIEW / image.naturalWidth, VIEW / image.naturalHeight) * crop.zoom
    return { x: (image.naturalWidth * scale - VIEW) / 2, y: (image.naturalHeight * scale - VIEW) / 2 }
  }
  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, crop }
  }
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return
    const s = slack()
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    setCrop({
      zoom: crop.zoom,
      x: s.x > 0.5 ? clamp(drag.current.crop.x - dx / s.x) : 0,
      y: s.y > 0.5 ? clamp(drag.current.crop.y - dy / s.y) : 0,
    })
  }
  const key = (e: KeyboardEvent<HTMLCanvasElement>) => {
    const steps: Record<string, [number, number] | undefined> = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }
    const step = steps[e.key]
    if (!step) return
    e.preventDefault()
    setCrop({ zoom: crop.zoom, x: clamp(crop.x + step[0]), y: clamp(crop.y + step[1]) })
  }

  return (
    <div className="photo-edit">
      <canvas
        ref={canvas} className="photo-canvas" tabIndex={0} role="img"
        aria-label="Prévia da foto. Arraste ou use as setas para posicionar."
        onPointerDown={down} onPointerMove={move} onPointerUp={() => (drag.current = null)} onPointerCancel={() => (drag.current = null)} onKeyDown={key}
      />
      <label className="editor-label" htmlFor="zoom">Aproximar</label>
      <input
        id="zoom" className="slider" type="range" min={1} max={3} step={0.05} value={crop.zoom}
        style={{ ['--fill' as string]: `${((crop.zoom - 1) / 2) * 100}%` }}
        onChange={(e) => setCrop({ ...crop, zoom: Number(e.target.value) })}
      />
      <p className="quiet">Arraste a foto para escolher o que fica no círculo.</p>
    </div>
  )
}

export default function Profile() {
  const { id } = useParams()
  const { viewer } = useViewer()
  const person: PersonId = id === 'danilo' || id === 'maellen' ? id : viewer
  const mine = person === viewer
  const profile = useProfile()
  const saving = useSave()
  const file = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(() => nameOf(person))
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [crop, setCrop] = useState<Crop>({ zoom: 1, x: 0, y: 0 })
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setName(nameOf(person))
    setImage(null)
    setRemoved(false)
    setDone(false)
  }, [person])

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
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setDone(false)
    const photo = image ? toJpeg(image, 256, 256, crop) : undefined
    void saving.run(() => {
      if (photo) profile.setPhoto(person, photo)
      else if (removed) profile.setPhoto(person, undefined)
      profile.setName(person, name.trim())
      setImage(null)
      setRemoved(false)
      setDone(true)
    })
  }
  const current = removed ? undefined : profile.photos[person]
  const partner = other(person)

  return (
    <div className="page profile" data-person={person}>
      <Link className="backbtn" to={`${B}/nos`}><IconBack size={20} />Nós</Link>
      <header className="profile-head">
        <Mark person={person} size={96} named={false} />
        <div>
          <h1 className="h1">{mine ? 'Seu perfil' : `Perfil de ${nameOf(person)}`}</h1>
          <p className="quiet">{nameOf(person)}, inicial {people[person].initial}. {mine ? 'Só você muda o que está aqui.' : `Só ${person === 'maellen' ? 'a Maellen muda o dela' : 'o Danilo muda o dele'}.`}</p>
        </div>
      </header>

      {!mine ? (
        <p className="profile-other">
          <Link className="btn btn--plain" to={`${B}/perfil`}>Abrir o meu perfil</Link>
        </p>
      ) : (
        <form className="editor profile-form" onSubmit={submit} aria-busy={saving.pending}>
          <fieldset className="field">
            <legend className="editor-label">Foto de perfil</legend>
            <input ref={file} className="sr-only" type="file" accept="image/*" tabIndex={-1} aria-label="Escolher foto de perfil" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = '' }} />
            {image ? (
              <PhotoEditor image={image} crop={crop} setCrop={setCrop} />
            ) : (
              <p className="quiet">
                {current ? 'A foto aparece no lugar da inicial, sempre dentro do anel da sua cor.' : 'Sem foto, o clube mostra a sua inicial. Com foto, ela aparece dentro do anel da sua cor.'}
              </p>
            )}
            <div className="editor-actions">
              <button type="button" className="btn btn--plain" onClick={() => file.current?.click()}>{image || current ? 'Escolher outra foto' : 'Escolher foto'}</button>
              {image && <button type="button" className="btn btn--plain" onClick={() => setImage(null)}>Desistir desta foto</button>}
              {!image && current && <button type="button" className="btn btn--plain" onClick={() => { setRemoved(true); setDone(false) }}>Remover foto</button>}
            </div>
            {removed && <p className="quiet" role="status">A foto sai quando você salvar. Volta a aparecer a inicial {people[person].initial}.</p>}
            {error && <p className="field-error" role="alert">{error}</p>}
          </fieldset>

          <div className="field">
            <label htmlFor="p-nome" className="editor-label">Nome que aparece</label>
            <input id="p-nome" type="text" value={name} maxLength={24} required onChange={(e) => { setName(e.target.value); setDone(false) }} />
          </div>

          {person === 'maellen' && (
            <fieldset className="field">
              <legend className="editor-label">Apelidos</legend>
              <ul className="tags">
                {maellenNicknames.map((n) => <li key={n} className="tag">{n}</li>)}
              </ul>
              <label className="switch">
                <input type="checkbox" checked={profile.useNicknames} onChange={(e) => profile.setUseNicknames(e.target.checked)} />
                <span className="switch-ui" aria-hidden="true" />
                Usar apelidos nas saudações
              </label>
              <p className="quiet">Ligado, o início sorteia um apelido a cada visita. Desligado, usa o seu nome.</p>
            </fieldset>
          )}

          {saving.failed && <SaveError>A foto e o nome que você escolheu continuam aqui. Confira a conexão e tente de novo.</SaveError>}
          <div className="editor-actions">
            <SaveButton pending={saving.pending} failed={saving.failed} label="Salvar perfil" />
          </div>
          <p className="saved-msg" role="status">{saving.pending ? 'Salvando o perfil' : done ? 'Perfil salvo.' : ''}</p>
        </form>
      )}

      {mine && <WallpaperPicker person={person} />}

      <p className="profile-partner">
        <Link className="member-link" to={`${B}/perfil/${partner}`} data-person={partner}>
          <Mark person={partner} size={36} named={false} />
          Ver o perfil de {nameOf(partner)}
        </Link>
      </p>
    </div>
  )
}
