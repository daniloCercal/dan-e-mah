'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { parseLink } from '@/lib/links'
import type { CoverInput } from '@/app/actions/games'
import { Cover } from './Cover'
import { IconClose } from './icons'

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

/** Store links as buttons that open in a new tab. */
export function StoreLinks({ links }: { links: string[] }) {
  const parsed = links.map(parseLink).filter((l) => l !== undefined)
  if (!parsed.length) return null
  return (
    <ul className="storelinks">
      {parsed.map((l) => (
        <li key={l.url}>
          <a className="btn btn--plain btn--small" href={l.url} target="_blank" rel="noopener noreferrer">
            {l.store === 'outra' ? l.host : l.label}
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
    if (!link) return setError('Esse endereço não parece um link seguro. Cole o endereço completo da página do jogo, começando com https://, como store.steampowered.com/app/620.')
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

export interface PickedCover { input: CoverInput; preview: string }

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image failed to load'))
    img.src = src
  })
}

/** Cuts the photo to 2:3 and shrinks it (covers need at most 600 px of width) as WebP. */
async function toWebp(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const w = 400
    const h = 600
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no canvas')
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.85))
    if (!blob) throw new Error('encode failed')
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Cover of a game: a photo from the phone (sent to the private covers bucket) or the address of an image. */
export function CoverPicker({ title, value, fallback, onChange }: {
  title: string
  value: PickedCover | undefined
  /** The cover the game has when no own cover is picked (the catalog's one). */
  fallback?: string | null
  onChange: (cover: PickedCover | undefined) => void
}) {
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
      const blob = await toWebp(f)
      const path = `${crypto.randomUUID()}.webp`
      const { error: up } = await createClient().storage.from('capas').upload(path, blob, { contentType: 'image/webp' })
      if (up) throw up
      onChange({ input: { kind: 'upload', path }, preview: URL.createObjectURL(blob) })
    } catch {
      setError('Não deu para enviar essa imagem. Tente outra foto, em JPG ou PNG, e confira a conexão.')
    }
    setBusy(false)
  }
  const fromAddress = async () => {
    const text = address.trim()
    if (!/^https:\/\/\S+\.\S+$/i.test(text) || text.length > 500) return setError('Cole o endereço completo da imagem, começando com https://.')
    setError('')
    setBusy(true)
    try {
      await loadImage(text)
      onChange({ input: { kind: 'url', url: text }, preview: text })
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
        <Cover title={title || 'Sem título'} src={value?.preview ?? fallback} describe />
        <div className="coverpick-side" aria-busy={busy}>
          <input ref={file} className="sr-only" type="file" accept="image/*" aria-labelledby={`${id}-l`} tabIndex={-1} onChange={(e) => { void fromFile(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className="btn btn--plain" disabled={busy} onClick={() => file.current?.click()}>{value ? 'Trocar por outra foto' : 'Escolher foto do aparelho'}</button>
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
