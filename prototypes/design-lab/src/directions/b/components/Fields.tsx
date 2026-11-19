import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useClub } from '../store'
import { loadImage, parseLink, readFile, toJpeg } from '../lib/media'
import { Cover } from './Marks'
import { IconClose, IconPlus } from './icons'

/** One message at the bottom, with an optional "Desfazer". Leaves by itself after a few seconds. */
export function ToastHost() {
  const { toast, dismissToast } = useClub()
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(dismissToast, toast.undo ? 8000 : 4000)
    return () => window.clearTimeout(t)
  }, [toast, dismissToast])
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.text}</span>
          {toast.undo && (
            <button type="button" className="toast-undo" onClick={() => { toast.undo?.(); dismissToast() }}>Desfazer</button>
          )}
          <button type="button" className="toast-x" onClick={dismissToast} aria-label="Fechar aviso"><IconClose size={18} /></button>
        </div>
      )}
    </div>
  )
}

/** In-page confirmation for destructive actions. Focus goes to the safe choice. */
export function Confirm({ title, children, action, onConfirm, onCancel }: { title: string; children: ReactNode; action: string; onConfirm: () => void; onCancel: () => void }) {
  const cancel = useRef<HTMLButtonElement>(null)
  useEffect(() => cancel.current?.focus(), [])
  return (
    <div className="confirm-box" role="alertdialog" aria-label={title} onKeyDown={(e) => e.key === 'Escape' && onCancel()}>
      <p><strong>{title}</strong> {children}</p>
      <div className="editor-actions">
        <button type="button" className="btn btn--ink" onClick={onConfirm}>{action}</button>
        <button type="button" className="btn btn--plain" ref={cancel} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

/** "Nova tag": a chip that turns into a small field. Enter creates, Escape gives up. */
export function NewTag({ onCreate }: { onCreate: (tag: string) => void }) {
  const { addCustomTag } = useClub()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const submit = () => {
    const tag = addCustomTag(text)
    if (tag) onCreate(tag)
    setText('')
    setOpen(false)
  }
  if (!open) {
    return (
      <button type="button" className="chip chip--new" onClick={() => setOpen(true)}>
        <IconPlus size={16} />
        Nova tag
      </button>
    )
  }
  return (
    <span className="newtag">
      <input
        type="text" value={text} maxLength={28} autoFocus aria-label="Nome da nova tag" placeholder="Nome da tag"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); submit() }
          if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) }
        }}
      />
      <button type="button" className="btn btn--ink btn--small" disabled={!text.trim()} onClick={submit}>Criar</button>
      <button type="button" className="iconbtn iconbtn--small" onClick={() => setOpen(false)} aria-label="Desistir da nova tag"><IconClose size={18} /></button>
    </span>
  )
}

/** Store links as buttons that open in a new tab. */
export function StoreLinks({ links }: { links: string[] }) {
  const parsed = links.map(parseLink).filter((l) => l !== undefined)
  if (!parsed.length) return null
  return (
    <ul className="storelinks">
      {parsed.map((l) => (
        <li key={l.url}>
          <a className="btn btn--plain btn--small" href={l.url} target="_blank" rel="noopener noreferrer">
            {l.label === 'Outra loja' ? l.host : l.label}
            <span className="sr-only"> (abre em outra aba)</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5H5v14h14v-4M13 5h6v6M19 5l-8 8" /></svg>
          </a>
        </li>
      ))}
    </ul>
  )
}

/** Paste a store link: it is recognised and labelled; several allowed, each removable. */
export function LinksEditor({ links, onChange }: { links: string[]; onChange: (links: string[]) => void }) {
  const id = useId()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const add = () => {
    const link = parseLink(text)
    if (!link) return setError('Esse endereço não parece um link. Cole o endereço completo da página do jogo, como store.steampowered.com/app/620.')
    if (links.includes(link.url)) return setError('Esse link já está na lista.')
    onChange([...links, link.url])
    setText('')
    setError('')
  }
  return (
    <div className="field">
      <label htmlFor={id} className="editor-label">Links de lojas (opcional)</label>
      <div className="inline-add">
        <input
          id={id} type="url" inputMode="url" value={text} placeholder="Cole o link da loja" aria-describedby={error ? `${id}-e` : undefined} aria-invalid={!!error}
          onChange={(e) => { setText(e.target.value); setError('') }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
        <button type="button" className="btn btn--plain" disabled={!text.trim()} onClick={add}>Adicionar link</button>
      </div>
      {error && <p className="field-error" id={`${id}-e`} role="alert">{error}</p>}
      {links.length > 0 && (
        <ul className="linklist">
          {links.map((url) => {
            const l = parseLink(url)
            return (
              <li key={url}>
                <span className="tag tag--store">{l?.label ?? 'Outra loja'}</span>
                <span className="linklist-host">{l?.host}</span>
                <button type="button" className="iconbtn iconbtn--small" onClick={() => onChange(links.filter((x) => x !== url))} aria-label={`Remover link ${l?.label ?? ''} ${l?.host ?? ''}`}>
                  <IconClose size={18} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Cover of a game: a photo from the phone (cut to 2:3 in the browser) or an image address. */
export function CoverPicker({ title, value, steamId = 0, onChange }: { title: string; value: string | undefined; steamId?: number; onChange: (cover: string | undefined) => void }) {
  const id = useId()
  const file = useRef<HTMLInputElement>(null)
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const fromFile = async (f: File | undefined) => {
    if (!f) return
    setError('')
    setBusy(true)
    try {
      onChange(toJpeg(await loadImage(await readFile(f)), 400, 600))
    } catch {
      setError('Não deu para abrir essa imagem. Tente outra foto, em JPG ou PNG.')
    }
    setBusy(false)
  }
  const fromAddress = async () => {
    const text = address.trim()
    if (!/^https?:\/\/\S+\.\S+/i.test(text)) return setError('Cole o endereço completo da imagem, começando com https://.')
    setError('')
    setBusy(true)
    try {
      await loadImage(text)
      onChange(text)
      setAddress('')
    } catch {
      setError('Não foi possível carregar a imagem desse endereço. Confira o link ou envie uma foto.')
    }
    setBusy(false)
  }

  return (
    <div className="field coverpick">
      <span className="editor-label" id={`${id}-l`}>Capa (opcional)</span>
      <div className="coverpick-row">
        <Cover game={{ steamId, title: title || 'Sem título' }} src={value} describe />
        <div className="coverpick-side" aria-busy={busy}>
          <input ref={file} className="sr-only" type="file" accept="image/*" aria-labelledby={`${id}-l`} tabIndex={-1} onChange={(e) => { void fromFile(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className="btn btn--plain" onClick={() => file.current?.click()}>{value ? 'Trocar por outra foto' : 'Escolher foto do aparelho'}</button>
          <label htmlFor={id} className="quiet">ou cole o endereço de uma imagem</label>
          <div className="inline-add">
            <input id={id} type="url" inputMode="url" value={address} placeholder="https://" onChange={(e) => { setAddress(e.target.value); setError('') }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void fromAddress() } }} />
            <button type="button" className="btn btn--plain" disabled={!address.trim() || busy} onClick={() => void fromAddress()}>Usar</button>
          </div>
          {value && <button type="button" className="link" onClick={() => onChange(undefined)}>Tirar a capa</button>}
        </div>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  )
}
