import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { jointAverage, type Game } from '../../../data/games'
import {
  activeChips, applyFilters, countActive, readFilters, savedFilters, sortLabels, useLibraryFilters, writeFilters,
  type FilterState, type Sort,
} from '../../../lib/filters'
import { useViewer } from '../../../lib/viewer'
import { FilterSheet } from '../FilterSheet'
import { GameCard } from '../GameCard'
import { lastSession, useStore } from '../store'
import { Cover, Icon, Score, StatusTag } from '../ui'

function sameFilters(a: FilterState, b: FilterState) {
  const strip = (f: FilterState) => writeFilters({ ...f, q: '', view: 'grade', sort: 'recentes' }).toString()
  return strip(a) === strip(b)
}

function ScoreRows({ list, ranked }: { list: Game[]; ranked: boolean }) {
  return (
    <div className="c-table">
      <div className="c-table__head" aria-hidden="true">
        <span />
        <span>Jogo</span>
        <span>D</span>
        <span>M</span>
        <span>Dupla</span>
      </div>
      <ul>
      {list.map((g, i) => {
        const d = g.personal.danilo.review?.rating
        const m = g.personal.maellen.review?.rating
        return (
          <li key={g.id}>
          <Link to={`/c/jogo/${g.id}`} className="c-row">
            <Cover game={g} decorative />
            <span>
              <span className="c-row__title">
                {ranked && <span className="c-num c-row__pos">{i + 1}º</span>}
                {g.title}
              </span>
              <StatusTag status={g.shared} />
            </span>
            <span className="c-num"><span className="c-sr">Danilo: </span><Score value={d} /></span>
            <span className="c-num"><span className="c-sr">Maellen: </span><Score value={m} /></span>
            <span className="c-num c-num--joint"><span className="c-sr">Dupla: </span><Score value={jointAverage(g)} /></span>
          </Link>
          </li>
        )
      })}
      </ul>
    </div>
  )
}

export default function Library() {
  const { viewer } = useViewer()
  const store = useStore()
  const { filters, set, toggle, clear } = useLibraryFilters()
  const [sheet, setSheet] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)

  // Search is typed locally and pushed to the URL after a short pause.
  const [text, setText] = useState(filters.q)
  const pushed = useRef(filters.q)
  useEffect(() => {
    if (text === pushed.current) return
    const t = setTimeout(() => {
      pushed.current = text
      set((f) => ({ ...f, q: text }))
    }, 250)
    return () => clearTimeout(t)
  }, [text, set])
  useEffect(() => {
    if (filters.q !== pushed.current) {
      pushed.current = filters.q
      setText(filters.q)
    }
  }, [filters.q])

  const results = useMemo(() => applyFilters(store.library, filters, viewer), [store.library, filters, viewer])
  const chips = activeChips(filters, viewer)
  const active = countActive(filters)

  // Empty state: which single filter, once removed, brings games back?
  const rescues = useMemo(() => {
    if (results.length) return []
    const options = chips.map((c) => ({ label: c.label, apply: c.remove, n: applyFilters(store.library, c.remove(filters), viewer).length }))
    if (filters.q) options.push({ label: `a busca “${filters.q}”`, apply: (f) => ({ ...f, q: '' }), n: applyFilters(store.library, { ...filters, q: '' }, viewer).length })
    return options.filter((o) => o.n > 0).sort((a, b) => b.n - a.n).slice(0, 3)
  }, [results.length, chips, filters, store.library, viewer])

  const clearAll = () => {
    setText('')
    pushed.current = ''
    set((f) => ({ ...readFilters(new URLSearchParams()), view: f.view, sort: f.sort }))
  }

  return (
    <div className={`c-lib ${sheet ? 'c-lib--panel' : ''}`}>
      <section className="c-wrap c-page c-lib__top">
        <h1 className="c-h1">Biblioteca</h1>

        <div className="c-lib__controls">
          <div className="c-search">
            <Icon name="search" size={20} />
            <label className="c-sr" htmlFor="c-lib-q">Buscar na biblioteca</label>
            <input
              id="c-lib-q" className="c-input" type="search" placeholder="Buscar por título ou estúdio" value={text}
              onChange={(e) => setText(e.target.value)} autoComplete="off" enterKeyHint="search"
            />
          </div>
          <div className="c-lib__bar">
            <button ref={trigger} type="button" className="c-btn" onClick={() => setSheet(true)} aria-haspopup="dialog" aria-expanded={sheet}>
              <Icon name="sliders" size={20} /> Filtros
              {active > 0 && <span className="c-lib__badge c-num" aria-label={`${active} ativos`}>{active}</span>}
            </button>
            <div className="c-seg c-lib__view" role="group" aria-label="Modo de exibição">
              <button type="button" aria-pressed={filters.view === 'grade'} onClick={() => set((f) => ({ ...f, view: 'grade' }))} aria-label="Grade de capas">
                <Icon name="grid" size={20} />
              </button>
              <button type="button" aria-pressed={filters.view === 'lista'} onClick={() => set((f) => ({ ...f, view: 'lista' }))} aria-label="Lista compacta">
                <Icon name="list" size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="c-lib__saved">
          <span className="c-lib__saved-label" id="c-saved-label">Atalhos</span>
          <ul className="c-lib__rail" aria-labelledby="c-saved-label">
            {savedFilters.map((s) => {
              const target = readFilters(new URLSearchParams(s.query))
              const on = sameFilters(target, filters)
              return (
                <li key={s.name}>
                  <button
                    type="button" className="c-chip" aria-pressed={on}
                    onClick={() => set((f) => (on ? { ...readFilters(new URLSearchParams()), view: f.view, sort: f.sort, q: f.q } : { ...target, view: f.view, sort: f.sort, q: f.q }))}
                  >
                    {s.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="c-lib__status">
          <p aria-live="polite">
            <span className="c-num c-lib__n">{results.length}</span>{' '}
            {results.length === 1 ? 'jogo' : 'jogos'}
            {active > 0 || filters.q ? ` de ${store.library.length}` : ''}
          </p>
          <label className="c-sr" htmlFor="c-lib-sort">Ordenar por</label>
          <select id="c-lib-sort" className="c-select c-lib__sort" value={filters.sort} onChange={(e) => set((f) => ({ ...f, sort: e.target.value as Sort }))}>
            {(Object.keys(sortLabels) as Sort[]).map((s) => <option key={s} value={s}>{sortLabels[s]}</option>)}
          </select>
        </div>

        {(chips.length > 0 || filters.q) && (
          <div className="c-lib__active">
            {chips.length > 0 && (
              <ul className="c-chips" aria-label="Filtros ativos">
                {chips.map((c) => (
                  <li key={c.key}>
                    <button type="button" className="c-chip c-chip--remove" onClick={() => set(c.remove)} aria-label={`Remover filtro ${c.label}`}>
                      {c.label} <Icon name="close" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="c-link" onClick={clearAll}>Limpar tudo</button>
          </div>
        )}
      </section>

      <section className="c-wrap c-lib__results">
        {results.length === 0 ? (
          <div className="c-empty">
            <h2 className="c-h2">Nenhuma carta com essa combinação</h2>
            {rescues.length > 0 ? (
              <>
                <p className="c-lead">Tirando um destes, o baralho volta:</p>
                <ul className="c-stack">
                  {rescues.map((r) => (
                    <li key={r.label}>
                      <button type="button" className="c-btn" onClick={() => { if (r.label.startsWith('a busca')) { setText(''); pushed.current = '' } set(r.apply) }}>
                        Tirar {r.label}
                        <span className="c-empty__n"><span className="c-num">{r.n}</span> {r.n === 1 ? 'jogo' : 'jogos'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="c-lead">Nem tirando um filtro só resolve. Melhor começar de novo.</p>
            )}
            <button type="button" className="c-link" onClick={clearAll}>Limpar todos os filtros</button>
          </div>
        ) : filters.view === 'lista' ? (
          <ScoreRows list={results} ranked={filters.sort === 'nota'} />
        ) : (
          <div className="c-grid">
            {results.map((g, i) => <GameCard key={g.id} game={g} last={lastSession(store, g.id)} eager={i < 4} />)}
          </div>
        )}
      </section>

      <FilterSheet
        open={sheet} onClose={() => setSheet(false)} filters={filters} set={set} toggle={toggle} clear={clear}
        count={results.length} viewer={viewer} triggerRef={trigger}
      />
    </div>
  )
}
