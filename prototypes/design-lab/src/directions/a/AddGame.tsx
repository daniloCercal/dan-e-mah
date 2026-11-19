import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { normalize, searchCatalog, statusLabels, taxonomy, type Game, type Status } from '../../data/games'
import { useViewer } from '../../lib/viewer'
import { addGame, todayIso, useLibrary } from './store'
import { Chip, Icon, PageHead, Poster, base, useFrom } from './ui'

const startStatuses: Status[] = ['lista', 'quero', 'jogando', 'pausado', 'zerado']

function manualGame(title: string, year: string, developer: string): Game {
  const blank = { status: 'lista' as Status, wants: false, owned: false }
  return {
    id: `${normalize(title).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'jogo'}-manual`,
    steamId: 0, title: title.trim(), year: Number(year) || 0, developer: developer.trim(), description: '',
    genres: [], modes: [], traits: [], moods: [], custom: [], shared: 'lista',
    personal: { danilo: { ...blank }, maellen: { ...blank } }, addedAt: todayIso(), inLibrary: false,
  }
}

export default function AddGame() {
  const { viewer } = useViewer()
  const library = useLibrary()
  const inLibrary = new Set(library.map((g) => g.id))
  const from = useFrom()

  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Game | null>(null)
  const [manual, setManual] = useState(false)
  const [saved, setSaved] = useState<Game | null>(null)

  const [status, setStatus] = useState<Status>('lista')
  const [wants, setWants] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [manualFields, setManualFields] = useState({ title: '', year: '', developer: '' })

  const confirmRef = useRef<HTMLHeadingElement>(null)
  const savedRef = useRef<HTMLHeadingElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text), 250)
    return () => clearTimeout(timer)
  }, [text])
  useEffect(() => { if (picked || manual) confirmRef.current?.focus() }, [picked, manual])
  useEffect(() => { if (saved) savedRef.current?.focus() }, [saved])

  const results = searchCatalog(query)
  const searched = normalize(query).length >= 2
  const step = saved ? 3 : picked || manual ? 2 : 1

  function reset() {
    setText(''); setQuery(''); setPicked(null); setManual(false); setSaved(null)
    setStatus('lista'); setWants(false); setTags([]); setManualFields({ title: '', year: '', developer: '' })
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  function backToSearch() {
    setPicked(null); setManual(false)
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  function save(event: FormEvent) {
    event.preventDefault()
    const source = manual ? manualGame(manualFields.title, manualFields.year, manualFields.developer) : picked
    if (!source || !source.title) return
    const game: Game = {
      ...source, shared: status, custom: tags, addedAt: todayIso(), inLibrary: true,
      personal: { ...source.personal, [viewer]: { ...source.personal[viewer], wants, status: status === 'lista' && wants ? 'quero' : status } },
    }
    addGame(game)
    setSaved(game)
  }

  return (
    <div className="page add">
      <PageHead title="Adicionar jogo" />
      <ol className="steps" aria-label="Etapas">
        {['Buscar', 'Confirmar', 'Salvo'].map((label, i) => (
          <li key={label} aria-current={step === i + 1 ? 'step' : undefined}>{label}</li>
        ))}
      </ol>

      {step === 1 && (
        <section aria-label="Buscar jogo">
          <label className="search search--big">
            <span className="sr-only">Nome do jogo</span>
            <Icon name="search" size={22} />
            <input
              ref={searchRef} type="search" value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Nome do jogo: tente “cel”, “out” ou “it”" autoComplete="off" enterKeyHint="search"
            />
          </label>
          <p className="quiet help">Os resultados aparecem enquanto você digita, a partir de duas letras.</p>

          <div aria-live="polite">
            {searched && results.length > 0 && (
              <ul className="results">
                {results.map((g) => (
                  <li key={g.id} className="result">
                    <span className="result-poster"><Poster game={g} decorative /></span>
                    <span className="result-text">
                      <span className="result-title">{g.title}</span>
                      <span className="quiet">{g.year}, {g.developer}</span>
                      {inLibrary.has(g.id) && <span className="result-flag">Já está na biblioteca</span>}
                    </span>
                    {inLibrary.has(g.id) ? (
                      <Link className="btn btn--ghost btn--small" to={`${base}/jogo/${g.id}`} state={from} aria-label={`Abrir ${g.title}, que já está na biblioteca`}>
                        Abrir
                      </Link>
                    ) : (
                      <button type="button" className="btn btn--line btn--small" onClick={() => setPicked(g)} aria-label={`Escolher ${g.title}`}>
                        Escolher
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {searched && results.length === 0 && (
              <div className="empty empty--inline">
                <h2 className="empty-title">Nada em cartaz com “{query.trim()}”</h2>
                <p className="lede">Confira a grafia ou cadastre o jogo à mão. Só o título é obrigatório.</p>
              </div>
            )}
          </div>

          <button type="button" className="link-btn manual-link" onClick={() => { setManualFields((f) => ({ ...f, title: searched && !results.length ? query.trim() : f.title })); setManual(true) }}>
            Não achei: cadastrar manualmente
          </button>
        </section>
      )}

      {step === 2 && (
        <form className="confirm" onSubmit={save}>
          <button type="button" className="back back--inline" onClick={backToSearch}>
            <Icon name="back" size={20} /> Voltar para a busca
          </button>

          {picked && (
            <div className="confirm-card">
              <div className="confirm-poster"><Poster game={picked} eager /></div>
              <div>
                <h2 className="confirm-title" tabIndex={-1} ref={confirmRef}>{picked.title}</h2>
                <dl className="facts">
                  <div><dt>Lançamento</dt><dd>{picked.year}</dd></div>
                  <div><dt>Estúdio</dt><dd>{picked.developer}</dd></div>
                  <div><dt>Gênero</dt><dd>{picked.genres.join(', ')}</dd></div>
                  <div><dt>Modo de jogo</dt><dd>{picked.modes.join(', ')}</dd></div>
                </dl>
                <p className="about">{picked.description}</p>
                <p className="quiet">Esses dados vêm do catálogo e não são editados aqui.</p>
              </div>
            </div>
          )}

          {manual && (
            <div className="manual">
              <h2 className="confirm-title" tabIndex={-1} ref={confirmRef}>Cadastrar manualmente</h2>
              <label className="field">
                <span className="field-label">Título (obrigatório)</span>
                <input type="text" required value={manualFields.title} onChange={(e) => setManualFields((f) => ({ ...f, title: e.target.value }))} />
              </label>
              <div className="form-pair">
                <label className="field">
                  <span className="field-label">Ano, se souber</span>
                  <input type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={manualFields.year} onChange={(e) => setManualFields((f) => ({ ...f, year: e.target.value }))} />
                </label>
                <label className="field">
                  <span className="field-label">Estúdio, se souber</span>
                  <input type="text" value={manualFields.developer} onChange={(e) => setManualFields((f) => ({ ...f, developer: e.target.value }))} />
                </label>
              </div>
            </div>
          )}

          <details className="group optional">
            <summary>
              <span className="group-title">Personalizar antes de salvar</span>
              <span className="group-count">opcional</span>
              <Icon name="chevron" size={20} />
            </summary>
            <div className="optional-body">
              <label className="field">
                <span className="field-label">Estado da dupla</span>
                <span className="select select--field">
                  <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                    {startStatuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                  </select>
                  <Icon name="chevron" size={18} />
                </span>
              </label>
              <label className="check">
                <input type="checkbox" checked={wants} onChange={(e) => setWants(e.target.checked)} />
                <span>Eu quero jogar</span>
              </label>
              <div>
                <p className="field-label">Nossas tags</p>
                <div className="chips">
                  {taxonomy.custom.map((tag) => (
                    <Chip key={tag} pressed={tags.includes(tag)} onClick={() => setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]))}>
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </details>

          <div className="confirm-actions">
            <button type="submit" className="btn btn--amber">Salvar na biblioteca</button>
          </div>
        </form>
      )}

      {saved && (
        <section className="saved-moment" aria-label="Jogo salvo">
          <div className="confirm-card">
            <div className="confirm-poster"><Poster game={saved} eager /></div>
            <div>
              <h2 className="confirm-title" tabIndex={-1} ref={savedRef}>{saved.title} entrou em cartaz</h2>
              <p className="lede">
                Está na biblioteca como “{statusLabels[saved.shared]}”
                {saved.personal[viewer].wants ? ', com o seu “quero jogar” marcado' : ''}.
              </p>
              <p className="btn-row">
                <Link className="btn btn--light" to={`${base}/jogo/${saved.id}`} state={from}>Abrir a página do jogo</Link>
                <button type="button" className="btn btn--line" onClick={reset}>Adicionar outro</button>
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
