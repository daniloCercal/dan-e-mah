import { useEffect, useRef, useState } from 'react'
import { nameOf } from '../lib/profile'
import { Link, useSearchParams } from 'react-router-dom'
import { normalize, searchCatalog, statusLabels, type Game, type Status } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { B, useClub, type GameExtra } from '../store'
import { NewTag, StoreLinks } from '../components/Fields'
import ManualForm from './ManualForm'
import { Overlap } from '../components/Overlap'
import { Cover } from '../components/Marks'
import { IconCheck, IconSearch } from '../components/icons'
import { Busy, Loader, SkRow } from '../components/Loading'
import { SaveButton, SaveError } from '../components/States'
import { useSave, wait } from '../lib/latency'

type Step = 'buscar' | 'confirmar' | 'salvo'
const steps: { id: Step; label: string }[] = [
  { id: 'buscar', label: 'Buscar' },
  { id: 'confirmar', label: 'Confirmar e ajustar' },
  { id: 'salvo', label: 'Pronto' },
]
const startStatuses: Status[] = ['lista', 'jogando', 'zerado']

export default function AddGame() {
  const { viewer, partner } = useViewer()
  const { inLibrary, addGame, customTags } = useClub()
  const [params] = useSearchParams()
  const [step, setStep] = useState<Step>('buscar')
  const [text, setText] = useState(() => params.get('q') ?? '')
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [manual, setManual] = useState(() => params.get('manual') === '1')
  const [extra, setExtra] = useState<GameExtra>({})
  const [picked, setPicked] = useState<Game | null>(null)
  const [status, setStatus] = useState<Status>('lista')
  const [wants, setWants] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [mTitle, setMTitle] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const [found, setFound] = useState<{ status: 'idle' | 'searching' | 'done' | 'error'; results: Game[] }>({ status: 'idle', results: [] })
  const [attempt, setAttempt] = useState(0)
  const saving = useSave()

  useEffect(() => {
    const t = setTimeout(() => setQuery(text), 250)
    return () => clearTimeout(t)
  }, [text])

  // Move focus to the heading of each moment so keyboard and screen reader users follow along.
  useEffect(() => {
    if (step !== 'buscar') heading.current?.focus()
  }, [step])

  // The catalog answers after a wait; a newer query cancels the older answer.
  useEffect(() => {
    if (normalize(query).length < 2) {
      setFound({ status: 'idle', results: [] })
      return
    }
    let cancelled = false
    setFound({ status: 'searching', results: [] })
    void wait('search').then(() => {
      if (cancelled) return
      // Prototype trigger for the failure state.
      if (normalize(query) === 'erro') setFound({ status: 'error', results: [] })
      else setFound({ status: 'done', results: searchCatalog(query) })
    })
    return () => {
      cancelled = true
    }
  }, [query, attempt])

  const results = found.results
  const searched = found.status === 'done'
  const typing = normalize(text).length >= 2 && (text !== query || found.status === 'searching')

  const pick = (g: Game, more: GameExtra = {}) => {
    setPicked(g)
    setExtra(more)
    setStatus('lista')
    setWants(false)
    setTags([])
    setStep('confirmar')
  }
  const restart = () => {
    setPicked(null)
    setManual(false)
    setText('')
    setQuery('')
    setMTitle('')
    setStep('buscar')
  }
  const save = () => {
    if (!picked) return
    const game = picked
    void saving.run(() => {
      addGame({
        ...game, shared: status, custom: tags,
        personal: { ...game.personal, [viewer]: { ...game.personal[viewer], wants, status: status === 'lista' && wants ? 'quero' : status } },
      }, extra)
      setStep('salvo')
    })
  }

  return (
    <div className="page add">
      <h1 className="h1">Adicionar jogo</h1>
      <ol className="steps" aria-label="Etapas">
        {steps.map((s, i) => (
          <li key={s.id} aria-current={s.id === step ? 'step' : undefined} data-done={steps.findIndex((x) => x.id === step) > i || undefined}>
            <span className="steps-n">{i + 1}</span>
            {s.label}
          </li>
        ))}
      </ol>

      {step === 'buscar' && !manual && (
        <section className="add-step" aria-label="Buscar jogo">
          <label className="search search--big">
            <span className="sr-only">Nome do jogo</span>
            <IconSearch size={22} />
            <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Nome do jogo. Tente “cel”, “out” ou “it”" autoComplete="off" autoFocus />
          </label>
          <p className="quiet search-status" role="status">
            {typing && <><Loader size={16} /> Procurando “{text.trim()}”</>}
            {!typing && found.status === 'idle' && 'Digite pelo menos duas letras. Para testar: “cel”, “out” ou “it”.'}
            {!typing && searched && results.length > 0 && `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`}
            {!typing && searched && results.length === 0 && `Nada com “${query}”.`}
            {!typing && found.status === 'error' && 'A busca não respondeu.'}
          </p>

          {typing && <Busy label="Procurando no catálogo"><SkRow /><SkRow /><SkRow /></Busy>}

          {!typing && found.status === 'error' && (
            <div className="alert alert--block" role="alert">
              <h2 className="h3">Não deu para buscar no catálogo</h2>
              <p>O catálogo de jogos não respondeu agora. A sua biblioteca não foi afetada. Tente de novo em instantes ou cadastre o jogo do seu jeito.</p>
              <div className="editor-actions">
                <button type="button" className="btn btn--both" onClick={() => setAttempt((n) => n + 1)}>Tentar de novo</button>
                <button type="button" className="btn btn--plain" onClick={() => { setMTitle(''); setManual(true) }}>Cadastrar manualmente</button>
              </div>
            </div>
          )}

          {!typing && results.length > 0 && (
            <ul className="rows">
              {results.map((g) => {
                const have = inLibrary(g.id)
                const body = (
                  <>
                    <Cover game={g} />
                    <span className="row-text">
                      <span className="row-title">{g.title}</span>
                      <span className="row-meta">{g.year}, {g.developer}</span>
                      {have && <span className="row-meta row-have"><IconCheck size={16} /> Já está na biblioteca</span>}
                    </span>
                    <span className="row-go">{have ? 'Abrir' : 'Escolher'}</span>
                  </>
                )
                return (
                  <li key={g.id}>
                    {have ? (
                      <Link className="row row--have" to={`${B}/jogo/${g.id}`}>{body}</Link>
                    ) : (
                      <button type="button" className="row" onClick={() => pick(g)}>{body}</button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {!typing && searched && results.length === 0 && (
            <div className="empty empty--left">
              <h2 className="h2">Não achamos esse</h2>
              <p>Confira se o nome está certo ou cadastre do seu jeito. Só o título é obrigatório.</p>
              <button type="button" className="btn btn--both" onClick={() => { setMTitle(text.trim()); setManual(true) }}>Cadastrar manualmente</button>
            </div>
          )}
          {!(searched && results.length === 0) && found.status !== 'error' && (
            <button type="button" className="link" onClick={() => { setMTitle(text.trim()); setManual(true) }}>Não achei, quero cadastrar manualmente</button>
          )}
        </section>
      )}

      {step === 'buscar' && manual && (
        <ManualForm initialTitle={mTitle} onReady={pick} onCancel={() => setManual(false)} />
      )}

      {step === 'confirmar' && picked && (
        <section className="add-step" aria-labelledby="h-confirma">
          <h2 className="h2" id="h-confirma" tabIndex={-1} ref={heading}>É esse aqui?</h2>
          <div className="confirm">
            <Cover game={picked} src={extra.cover} eager />
            <div className="confirm-text">
              <p className="confirm-title">{picked.title}</p>
              <p className="quiet">{picked.year ? `${picked.year}, ` : ''}{picked.developer}</p>
              {picked.description && <p>{picked.description}</p>}
              {extra.links && <StoreLinks links={extra.links} />}
              {picked.genres.length + picked.modes.length > 0 && (
                <ul className="tags">
                  {[...picked.genres, ...picked.modes].map((t) => <li key={t} className="tag">{t}</li>)}
                </ul>
              )}
            </div>
          </div>

          {saving.failed && <SaveError>O jogo e os ajustes que você escolheu continuam aqui. Confira a conexão e tente de novo.</SaveError>}
          <div className="editor-actions">
            <SaveButton type="button" className="btn btn--both btn--big" pending={saving.pending} failed={saving.failed} label="Salvar na biblioteca" onClick={save} />
            <button type="button" className="btn btn--plain" disabled={saving.pending} onClick={restart}>Escolher outro</button>
          </div>
          <p className="sr-only" role="status">{saving.pending ? 'Salvando o jogo' : ''}</p>

          <div className="optional">
            <h3 className="h3">Se quiser, já ajuste (opcional)</h3>
            <fieldset className="field">
              <legend className="editor-label">Situação de nós dois</legend>
              <div className="chips">
                {startStatuses.map((s) => (
                  <button key={s} type="button" className={status === s ? 'chip chip--on' : 'chip'} aria-pressed={status === s} onClick={() => setStatus(s)}>
                    {status === s && <IconCheck size={16} />}
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="field">
              <legend className="editor-label">Você quer jogar?</legend>
              <button type="button" className={wants ? 'chip chip--on' : 'chip'} aria-pressed={wants} onClick={() => setWants(!wants)}>
                {wants && <IconCheck size={16} />}
                Quero jogar
              </button>
            </fieldset>
            <fieldset className="field">
              <legend className="editor-label">Nossas tags</legend>
              <div className="chips">
                {customTags.map((t) => {
                  const on = tags.includes(t)
                  return (
                    <button key={t} type="button" className={on ? 'chip chip--on' : 'chip'} aria-pressed={on} onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])}>
                      {on && <IconCheck size={16} />}
                      {t}
                    </button>
                  )
                })}
                <NewTag onCreate={(t) => setTags((cur) => (cur.includes(t) ? cur : [...cur, t]))} />
              </div>
            </fieldset>
          </div>
        </section>
      )}

      {step === 'salvo' && picked && (
        <section className="add-step saved-card" aria-labelledby="h-salvo">
          <Cover game={picked} src={extra.cover} tilt="b" />
          <div>
            <h2 className="h2" id="h-salvo" tabIndex={-1} ref={heading}>{picked.title} entrou para o clube</h2>
            <div className="saved-want">
              <Overlap danilo={viewer === 'danilo' && wants} maellen={viewer === 'maellen' && wants} size={44} label={wants ? `${nameOf(viewer)} quer jogar` : 'Ninguém marcou que quer jogar ainda'} />
              <p>{wants ? `Você já marcou que quer jogar. Falta ${partner === 'maellen' ? 'a Maellen' : 'o Danilo'} dizer o mesmo.` : 'Está na lista de vocês, sem ninguém marcado ainda.'}</p>
            </div>
            <div className="editor-actions">
              <Link className="btn btn--ink" to={`${B}/jogo/${picked.id}`}>Abrir o jogo</Link>
              <button type="button" className="btn btn--plain" onClick={restart}>Adicionar outro</button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
