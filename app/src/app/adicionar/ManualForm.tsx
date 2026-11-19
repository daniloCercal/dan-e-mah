'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { lookupSteam } from '@/app/actions/games'
import { steamAppId } from '@/lib/links'
import { CoverPicker, LinksEditor, type PickedCover } from '@/components/Fields'
import { Loader } from '@/components/Loading'

export interface Draft {
  igdbId?: number
  title: string
  year: number | null
  developer: string
  description?: string | null
  catalogCover?: string | null
  cover?: PickedCover
  links: string[]
}

type SteamState =
  | { status: 'idle' | 'looking' | 'missing' | 'down' }
  | { status: 'found'; title: string }
  | { status: 'have'; title: string; id: number }

/** Manual registration: only the title is required. Cover and store links are optional. */
export function ManualForm({ initialTitle, onReady, onCancel }: { initialTitle: string; onReady: (d: Draft) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(initialTitle)
  const [year, setYear] = useState('')
  const [dev, setDev] = useState('')
  const [cover, setCover] = useState<PickedCover>()
  const [links, setLinks] = useState<string[]>([])
  const [steam, setSteam] = useState<SteamState>({ status: 'idle' })
  const [base, setBase] = useState<{ igdbId: number; catalogCover: string | null }>()

  const steamLink = links.find((l) => steamAppId(l) !== undefined)

  const fill = async () => {
    if (!steamLink) return
    setSteam({ status: 'looking' })
    try {
      const res = await lookupSteam(steamLink)
      if (!res.ok) return setSteam({ status: 'down' })
      if (!res.game) return setSteam({ status: 'missing' })
      if (res.inLibraryId) return setSteam({ status: 'have', title: res.game.title, id: res.inLibraryId })
      setBase({ igdbId: res.game.igdbId, catalogCover: res.game.cover })
      setTitle(res.game.title)
      setYear(res.game.year ? String(res.game.year) : '')
      setDev(res.game.developer ?? '')
      setSteam({ status: 'found', title: res.game.title })
    } catch {
      setSteam({ status: 'down' })
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onReady({
      igdbId: base?.igdbId, title: title.trim(), year: Number(year) || null, developer: dev.trim(),
      catalogCover: base?.catalogCover ?? null, cover, links,
    })
  }

  return (
    <form className="add-step editor" onSubmit={submit} aria-label="Cadastrar manualmente">
      <h2 className="h2">Cadastrar manualmente</h2>
      <p className="quiet">Só o título é obrigatório. O resto pode ficar para depois.</p>

      <div className="field">
        <label htmlFor="m-titulo" className="editor-label">Título</label>
        <input id="m-titulo" type="text" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="m-ano" className="editor-label">Ano (opcional)</label>
          <input id="m-ano" type="text" inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))} />
        </div>
        <div className="field">
          <label htmlFor="m-dev" className="editor-label">Estúdio (opcional)</label>
          <input id="m-dev" type="text" maxLength={120} value={dev} onChange={(e) => setDev(e.target.value)} />
        </div>
      </div>

      <CoverPicker title={title} value={cover} fallback={base?.catalogCover} onChange={setCover} />
      <LinksEditor links={links} onChange={(next) => { setLinks(next); setSteam({ status: 'idle' }) }} />

      {steamLink && (
        <div className="steam-offer" aria-busy={steam.status === 'looking'}>
          {steam.status === 'idle' && (
            <>
              <p><strong>Esse link é da Steam.</strong> Dá para puxar título, ano e estúdio de lá.</p>
              <button type="button" className="btn btn--both" onClick={() => void fill()}>Preencher com os dados da Steam</button>
            </>
          )}
          {steam.status === 'looking' && <p className="search-status" role="status"><Loader size={16} /> Buscando a Steam</p>}
          {steam.status === 'found' && <p role="status"><strong>Preenchido com os dados de {steam.title}.</strong> Confira e mude o que quiser antes de continuar.</p>}
          {steam.status === 'missing' && (
            <p role="alert"><strong>Não achamos esse jogo no catálogo.</strong> O link fica guardado mesmo assim. Preencha o título e o resto à mão.</p>
          )}
          {steam.status === 'down' && (
            <p role="alert"><strong>O catálogo não respondeu agora.</strong> O link fica guardado. Dá para tentar de novo ou preencher à mão.</p>
          )}
          {steam.status === 'have' && (
            <p role="status">
              <strong>{steam.title} já está na biblioteca.</strong>{' '}
              <Link href={`/jogo/${steam.id}`}>Abrir o jogo</Link>
            </p>
          )}
        </div>
      )}

      <div className="editor-actions">
        <button type="submit" className="btn btn--ink">Continuar</button>
        <button type="button" className="btn btn--plain" onClick={onCancel}>Voltar para a busca</button>
      </div>
    </form>
  )
}
