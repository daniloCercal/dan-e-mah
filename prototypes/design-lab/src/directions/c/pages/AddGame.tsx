import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { normalize, other, searchCatalog, statusLabels, taxonomy, type Game, type Status } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { addToLibrary, todayIso, useStore } from '../store'
import { Chip, Cover, Icon } from '../ui'

type Step = 'search' | 'confirm' | 'saved'
const startStatuses: Status[] = ['lista', 'quero', 'jogando', 'zerado']
const tagOptions = [...taxonomy.custom, ...taxonomy.moods]

function Steps({ step }: { step: Step }) {
  const at = step === 'search' ? 0 : step === 'confirm' ? 1 : 3
  const items = ['Buscar', 'Confirmar', 'Personalizar (opcional)']
  return (
    <ol className="c-steps" aria-label="Etapas">
      {items.map((label, i) => (
        <li key={label} aria-current={i === at ? 'step' : undefined} data-done={i < at || undefined}>
          <span className="c-num">{i + 1}</span> {label}
        </li>
      ))}
    </ol>
  )
}

function manualGame(title: string, year: string, developer: string): Game {
  const blank = { status: 'lista' as Status, wants: false, owned: false }
  return {
    id: `manual-${normalize(title).replace(/[^a-z0-9]+/g, '-')}`, steamId: 0, title: title.trim(), year: Number(year) || new Date().getFullYear(),
    developer: developer.trim() || 'Estúdio não informado', description: 'Cadastrado manualmente por vocês.',
    genres: [], modes: [], traits: [], moods: [], custom: [], shared: 'lista',
    personal: { danilo: { ...blank }, maellen: { ...blank } }, addedAt: todayIso(), inLibrary: false,
  }
}

export default function AddGame() {
  const { viewer } = useViewer()
  const store = useStore()
  const [step, setStep] = useState<Step>('search')
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [manual, setManual] = useState(false)
  const [manualFields, setManualFields] = useState({ title: '', year: '', developer: '' })
  const [chosen, setChosen] = useState<Game | null>(null)
  const [status, setStatus] = useState<Status>('lista')
  const [wants, setWants] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setQuery(text), 250)
    return () => clearTimeout(t)
  }, [text])

  // Each moment replaces the previous one in place; move focus to its heading.
  useEffect(() => {
    if (step !== 'search') heading.current?.focus()
  }, [step])

  const results = searchCatalog(query)
  const owned = (g: Game) => store.library.some((x) => x.id === g.id)

  const choose = (g: Game) => {
    setChosen(g)
    setStatus('lista')
    setWants(false)
    setTags([])
    setStep('confirm')
  }
  const reset = () => {
    setStep('search')
    setChosen(null)
    setManual(false)
    setText('')
    setQuery('')
    setManualFields({ title: '', year: '', developer: '' })
  }
  const save = () => {
    if (!chosen) return
    const mine = { ...chosen.personal[viewer], status, wants }
    const moods = tags.filter((t) => (taxonomy.moods as readonly string[]).includes(t))
    const custom = tags.filter((t) => (taxonomy.custom as readonly string[]).includes(t))
    addToLibrary({
      ...chosen, shared: status, addedAt: todayIso(),
      moods: [...new Set([...chosen.moods, ...moods])], custom: [...new Set([...chosen.custom, ...custom])],
      personal: { ...chosen.personal, [viewer]: mine, [other(viewer)]: chosen.personal[other(viewer)] },
    })
    setStep('saved')
  }

  return (
    <div className="c-add">
      <section className="c-wrap c-page">
        <h1 className="c-h1">Adicionar jogo</h1>
        <Steps step={step} />
      </section>

      {step === 'search' && (
        <section className="c-wrap c-add__search">
          {!manual ? (
            <>
              <div className="c-search">
                <Icon name="search" size={20} />
                <label className="c-sr" htmlFor="c-add-q">Nome do jogo</label>
                <input
                  id="c-add-q" className="c-input" type="search" value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Nome do jogo (tente “cel”, “out” ou “it”)" autoComplete="off" enterKeyHint="search" autoFocus
                />
              </div>
              {query.trim().length < 2 ? (
                <p className="c-muted">Digite pelo menos duas letras. Neste protótipo, “cel”, “out” e “it” trazem resultados.</p>
              ) : results.length === 0 ? (
                <div className="c-empty">
                  <h2 className="c-h2">Nada com “{query}”</h2>
                  <p className="c-lead">Confira a grafia ou cadastre o jogo por conta própria.</p>
                  <button type="button" className="c-btn c-btn--primary" onClick={() => { setManual(true); setManualFields((f) => ({ ...f, title: query })) }}>
                    Cadastrar manualmente
                  </button>
                </div>
              ) : (
                <>
                  <p aria-live="polite"><span className="c-num">{results.length}</span> {results.length === 1 ? 'resultado' : 'resultados'}</p>
                  <ul className="c-add__results">
                    {results.map((g) => (
                      <li key={g.id}>
                        {owned(g) ? (
                          <Link to={`/c/jogo/${g.id}`} className="c-result c-result--owned">
                            <Cover game={g} decorative />
                            <span className="c-result__body">
                              <strong>{g.title}</strong>
                              <span className="c-muted">{g.developer}, {g.year}</span>
                              <span className="c-result__flag"><Icon name="check" size={16} /> Já está na biblioteca</span>
                              <span className="c-result__cta">Abrir a página</span>
                            </span>
                          </Link>
                        ) : (
                          <button type="button" className="c-result" onClick={() => choose(g)}>
                            <Cover game={g} decorative />
                            <span className="c-result__body">
                              <strong>{g.title}</strong>
                              <span className="c-muted">{g.developer}, {g.year}</span>
                              <span className="c-result__cta">Escolher este</span>
                            </span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <button type="button" className="c-link" onClick={() => { setManual(true); setManualFields((f) => ({ ...f, title: text })) }}>
                Não achei, quero cadastrar manualmente
              </button>
            </>
          ) : (
            <form
              className="c-add__manual"
              onSubmit={(e) => { e.preventDefault(); if (manualFields.title.trim()) choose(manualGame(manualFields.title, manualFields.year, manualFields.developer)) }}
            >
              <h2 className="c-h2">Cadastro manual</h2>
              <div className="c-field">
                <label className="c-label" htmlFor="c-m-title">Título</label>
                <input id="c-m-title" className="c-input" required value={manualFields.title} onChange={(e) => setManualFields({ ...manualFields, title: e.target.value })} autoFocus />
              </div>
              <div className="c-field">
                <label className="c-label" htmlFor="c-m-year">Ano <span className="c-muted">(opcional)</span></label>
                <input id="c-m-year" className="c-input" inputMode="numeric" pattern="[0-9]{4}" value={manualFields.year} onChange={(e) => setManualFields({ ...manualFields, year: e.target.value })} />
              </div>
              <div className="c-field">
                <label className="c-label" htmlFor="c-m-dev">Estúdio <span className="c-muted">(opcional)</span></label>
                <input id="c-m-dev" className="c-input" value={manualFields.developer} onChange={(e) => setManualFields({ ...manualFields, developer: e.target.value })} />
              </div>
              <div className="c-editor__actions">
                <button type="submit" className="c-btn c-btn--primary">Continuar</button>
                <button type="button" className="c-btn c-btn--quiet" onClick={() => setManual(false)}>Voltar para a busca</button>
              </div>
            </form>
          )}
        </section>
      )}

      {step === 'confirm' && chosen && (
        <>
          <section className="c-block c-block--surface c-add__confirm">
            <div className="c-wrap c-confirm">
              <Cover game={chosen} eager decorative />
              <div className="c-stack">
                <h2 className="c-h2" ref={heading} tabIndex={-1}>{chosen.title}</h2>
                <p className="c-muted">{chosen.developer}, {chosen.year}</p>
                <p>{chosen.description}</p>
                {(chosen.genres.length > 0 || chosen.modes.length > 0) && (
                  <p className="c-muted">{[...chosen.genres, ...chosen.modes].join(', ')}</p>
                )}
                <button type="button" className="c-link" onClick={() => setStep('search')}>Não é esse, voltar para a busca</button>
              </div>
            </div>
          </section>
          <section className="c-block c-add__custom">
            <div className="c-wrap c-stack">
              <h2 className="c-h3">Se quiser, já deixe do seu jeito</h2>
              <div className="c-field" role="group" aria-labelledby="c-a-st">
                <span className="c-label" id="c-a-st">Estado</span>
                <div className="c-chips">
                  {startStatuses.map((s) => <Chip key={s} pressed={status === s} onClick={() => setStatus(s)}>{statusLabels[s]}</Chip>)}
                </div>
              </div>
              <div className="c-field" role="group" aria-labelledby="c-a-w">
                <span className="c-label" id="c-a-w">Vontade</span>
                <div className="c-chips"><Chip pressed={wants} onClick={() => setWants(!wants)}>Eu quero jogar</Chip></div>
              </div>
              <div className="c-field" role="group" aria-labelledby="c-a-t">
                <span className="c-label" id="c-a-t">Tags</span>
                <div className="c-chips">
                  {tagOptions.map((t) => (
                    <Chip key={t} pressed={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>{t}</Chip>
                  ))}
                </div>
              </div>
              <div className="c-add__save">
                <button type="button" className="c-btn c-btn--primary c-btn--big c-btn--block" onClick={save}>Salvar na biblioteca</button>
              </div>
            </div>
          </section>
        </>
      )}

      {step === 'saved' && chosen && (
        <section className="c-block c-block--menta c-add__saved">
          <div className="c-wrap c-confirm">
            <motion.div initial={{ y: -80, rotate: -8, opacity: 0 }} animate={{ y: 0, rotate: -3, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
              <Cover game={chosen} eager decorative />
            </motion.div>
            <div className="c-stack">
              <h2 className="c-h2" ref={heading} tabIndex={-1}>{chosen.title} entrou no baralho</h2>
              <p>Salvo como “{statusLabels[status]}”{wants ? ', com o seu “quero jogar”' : ''}.</p>
              <div className="c-editor__actions">
                <Link to={`/c/jogo/${chosen.id}`} className="c-btn c-btn--ink">Abrir o jogo</Link>
                <button type="button" className="c-btn c-btn--onlight" onClick={reset}>Adicionar outro</button>
              </div>
              <Link to="/c/biblioteca" className="c-link">Ir para a biblioteca</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
