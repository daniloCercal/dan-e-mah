import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { catalog, normalize, type Game, type Status } from '../../../data/games'
import { B, useClub, type GameExtra } from '../store'
import { wait } from '../lib/latency'
import { steamAppId } from '../lib/media'
import { CoverPicker, LinksEditor } from '../components/Fields'
import { Loader } from '../components/Loading'

function blankGame(title: string, year: string, developer: string): Game {
  const blank = { status: 'lista' as Status, wants: false, owned: false }
  return {
    id: `manual-${normalize(title).replace(/[^a-z0-9]+/g, '-')}`,
    steamId: 0, title, year: Number(year) || 0, developer: developer || 'Estúdio não informado', description: '',
    genres: [], modes: [], traits: [], moods: [], custom: [], shared: 'lista',
    personal: { danilo: { ...blank }, maellen: { ...blank } },
    addedAt: new Date().toISOString().slice(0, 10), inLibrary: false,
  }
}

type SteamState = { status: 'idle' | 'looking' | 'missing' } | { status: 'found'; game: Game } | { status: 'have'; game: Game }

/** Manual registration: only the title is required. Cover and store links are optional. */
export default function ManualForm({ initialTitle, onReady, onCancel }: { initialTitle: string; onReady: (game: Game, extra: GameExtra) => void; onCancel: () => void }) {
  const { inLibrary } = useClub()
  const [title, setTitle] = useState(initialTitle)
  const [year, setYear] = useState('')
  const [dev, setDev] = useState('')
  const [cover, setCover] = useState<string>()
  const [links, setLinks] = useState<string[]>([])
  const [steam, setSteam] = useState<SteamState>({ status: 'idle' })
  const [base, setBase] = useState<Game>()

  const steamLink = links.find((l) => steamAppId(l) !== undefined)
  const appId = steamLink ? steamAppId(steamLink) : undefined

  const fill = async () => {
    setSteam({ status: 'looking' })
    await wait('search')
    // Mock of the Steam lookup: only games that exist in the mock catalog can be "found". Nothing is invented.
    const hit = catalog.find((g) => g.steamId === appId)
    if (!hit) return setSteam({ status: 'missing' })
    if (inLibrary(hit.id)) return setSteam({ status: 'have', game: hit })
    setBase(hit)
    setTitle(hit.title)
    setYear(String(hit.year))
    setDev(hit.developer)
    setSteam({ status: 'found', game: hit })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const game = base
      ? { ...base, title: title.trim(), year: Number(year) || base.year, developer: dev.trim() || base.developer }
      : blankGame(title.trim(), year, dev.trim())
    onReady(game, { cover, links })
  }

  return (
    <form className="add-step editor" onSubmit={submit} aria-label="Cadastrar manualmente">
      <h2 className="h2">Cadastrar manualmente</h2>
      <p className="quiet">Só o título é obrigatório. O resto pode ficar para depois.</p>

      <div className="field">
        <label htmlFor="m-titulo" className="editor-label">Título</label>
        <input id="m-titulo" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="m-ano" className="editor-label">Ano (opcional)</label>
          <input id="m-ano" type="text" inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))} />
        </div>
        <div className="field">
          <label htmlFor="m-dev" className="editor-label">Estúdio (opcional)</label>
          <input id="m-dev" type="text" value={dev} onChange={(e) => setDev(e.target.value)} />
        </div>
      </div>

      <CoverPicker title={title} value={cover} onChange={setCover} />
      <LinksEditor links={links} onChange={(next) => { setLinks(next); setSteam({ status: 'idle' }) }} />

      {appId !== undefined && (
        <div className="steam-offer" aria-busy={steam.status === 'looking'}>
          {steam.status === 'idle' && (
            <>
              <p><strong>Esse link é da Steam.</strong> Dá para puxar título, ano, estúdio e gêneros de lá.</p>
              <button type="button" className="btn btn--both" onClick={() => void fill()}>Preencher com os dados da Steam</button>
            </>
          )}
          {steam.status === 'looking' && <p className="search-status" role="status"><Loader size={16} /> Buscando na Steam</p>}
          {steam.status === 'found' && <p role="status"><strong>Preenchido com os dados da Steam.</strong> Confira e mude o que quiser antes de continuar.</p>}
          {steam.status === 'missing' && (
            <p role="alert"><strong>Não achamos esse jogo na Steam.</strong> O link fica guardado mesmo assim. Preencha o título e o resto à mão.</p>
          )}
          {steam.status === 'have' && (
            <p role="status">
              <strong>{steam.game.title} já está na biblioteca.</strong>{' '}
              <Link to={`${B}/jogo/${steam.game.id}`}>Abrir o jogo</Link>
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
