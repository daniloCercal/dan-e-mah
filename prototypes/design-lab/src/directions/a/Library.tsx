import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatRating, jointAverage, people, type Game } from '../../data/games'
import {
  activeChips, applyFilters, countActive, readFilters, savedFilters, sortLabels, useLibraryFilters, writeFilters,
  type FilterState, type Sort,
} from '../../lib/filters'
import { useViewer } from '../../lib/viewer'
import FilterPanel from './FilterPanel'
import { useLibrary } from './store'
import { Icon, PageHead, PosterCard, StatusTag, base, useFrom, useOpenGame } from './ui'

/** Compares only what a saved filter defines, ignoring sort and view. */
function filterKey(f: FilterState): string {
  return writeFilters({ ...f, q: '', sort: 'recentes', view: 'grade' }).toString()
}

export default function Library() {
  const { viewer } = useViewer()
  const { filters, set, toggle, clear } = useLibraryFilters()
  const library = useLibrary()
  const results = applyFilters(library, filters, viewer)
  const chips = activeChips(filters, viewer)
  const active = countActive(filters)
  const [panelOpen, setPanelOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)

  // Debounced search: the field answers at once, the URL follows 250ms later.
  const [text, setText] = useState(filters.q)
  const sent = useRef(filters.q)
  useEffect(() => {
    if (filters.q !== sent.current) {
      sent.current = filters.q
      setText(filters.q)
    }
  }, [filters.q])
  useEffect(() => {
    if (text === sent.current) return
    const timer = setTimeout(() => {
      sent.current = text
      set((prev) => ({ ...prev, q: text }))
    }, 250)
    return () => clearTimeout(timer)
  }, [text, set])

  const currentKey = filterKey(filters)
  const viewSuffix = filters.view === 'lista' ? '&ver=lista' : ''

  return (
    <div className="page library">
      <PageHead title="Biblioteca" />

      <div className="tools">
        <label className="search">
          <span className="sr-only">Buscar na biblioteca</span>
          <Icon name="search" size={20} />
          <input
            type="search" value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Buscar por título ou estúdio" autoComplete="off" enterKeyHint="search"
          />
        </label>

        <div className="tools-row">
          <button
            type="button" className="btn btn--line tools-filter" ref={trigger} onClick={() => setPanelOpen(true)}
            aria-haspopup="dialog" aria-expanded={panelOpen}
          >
            <Icon name="filters" size={20} /> Filtros
            {active > 0 && <span className="badge" aria-label={`${active} ${active === 1 ? 'filtro ativo' : 'filtros ativos'}`}>{active}</span>}
          </button>


          <div className="toggle" role="group" aria-label="Modo de exibição">
            <button type="button" aria-pressed={filters.view === 'grade'} aria-label="Ver em grade de capas" onClick={() => set((p) => ({ ...p, view: 'grade' }))}>
              <Icon name="grid" size={20} />
            </button>
            <button type="button" aria-pressed={filters.view === 'lista'} aria-label="Ver em lista" onClick={() => set((p) => ({ ...p, view: 'lista' }))}>
              <Icon name="list" size={20} />
            </button>
          </div>
        </div>

        <nav className="saved" aria-label="Filtros salvos">
          <span className="saved-label">Salvos</span>
          <ul>
            {savedFilters.map((s) => {
              const on = filterKey(readFilters(new URLSearchParams(s.query))) === currentKey
              return (
                <li key={s.name}>
                  <Link to={`${base}/biblioteca?${s.query}${viewSuffix}`} replace aria-current={on ? 'true' : undefined}>{s.name}</Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      <div className="status-line">
        <p className="count" aria-live="polite">
          {results.length} {results.length === 1 ? 'jogo' : 'jogos'}
          {active > 0 || filters.q ? ' no recorte' : ' na biblioteca'}
        </p>
        <label className="select select--tag tools-sort">
          <span className="sr-only">Ordenar por</span>
          <select value={filters.sort} onChange={(e) => set((p) => ({ ...p, sort: e.target.value as Sort }))}>
            {(Object.keys(sortLabels) as Sort[]).map((s) => <option key={s} value={s}>{sortLabels[s]}</option>)}
          </select>
          <Icon name="chevron" size={18} />
        </label>
      </div>

      {(chips.length > 0 || filters.q) && (
        <ul className="active-chips" aria-label="Filtros ativos">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button type="button" className="chip chip--remove" onClick={() => set((p) => chip.remove(p))} aria-label={`Remover filtro ${chip.label}`}>
                {chip.label} <Icon name="close" size={16} />
              </button>
            </li>
          ))}
          <li><button type="button" className="link-btn clear-all" onClick={clear}>Limpar tudo</button></li>
        </ul>
      )}

      {results.length === 0 ? (
        <EmptyState filters={filters} library={library} viewer={viewer} set={set} clear={clear} />
      ) : filters.view === 'lista' ? (
        <Programme games={results} />
      ) : (
        <ul className="grid">
          {results.map((g, i) => <li key={g.id}><PosterCard game={g} eager={i < 6} /></li>)}
        </ul>
      )}

      {panelOpen && (
        <FilterPanel
          filters={filters} set={set} toggle={toggle} clear={clear} resultCount={results.length} viewer={viewer}
          onClose={() => setPanelOpen(false)} triggerRef={trigger}
        />
      )}
    </div>
  )
}

function Programme({ games }: { games: Game[] }) {
  const open = useOpenGame()
  const state = useFrom()
  return (
    <table className="programme">
      <thead>
        <tr>
          <th scope="col">Título</th>
          <th scope="col" className="col-year">Ano</th>
          <th scope="col" className="col-status">Estado</th>
          <th scope="col" className="col-num">{people.danilo.name}</th>
          <th scope="col" className="col-num">{people.maellen.name}</th>
          <th scope="col" className="col-num col-avg">Média</th>
        </tr>
      </thead>
      <tbody>
        {games.map((g) => {
          const d = g.personal.danilo.review?.rating
          const m = g.personal.maellen.review?.rating
          const avg = jointAverage(g)
          return (
            <tr key={g.id}>
              <th scope="row">
                <Link to={`${base}/jogo/${g.id}`} state={state} onClick={(e) => open(g, e)}>{g.title}</Link>
                <span className="programme-sub">{g.year} <StatusTag status={g.shared} /></span>
              </th>
              <td className="col-year">{g.year}</td>
              <td className="col-status"><StatusTag status={g.shared} /></td>
              <td className="col-num">{d === undefined ? <span aria-label="sem nota">–</span> : formatRating(d)}</td>
              <td className="col-num">{m === undefined ? <span aria-label="sem nota">–</span> : formatRating(m)}</td>
              <td className="col-num col-avg">{avg === undefined ? <span aria-label="sem média">–</span> : formatRating(avg)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function EmptyState({
  filters, library, viewer, set, clear,
}: {
  filters: FilterState
  library: Game[]
  viewer: 'danilo' | 'maellen'
  set: (next: FilterState | ((prev: FilterState) => FilterState)) => void
  clear: () => void
}) {
  const chips = activeChips(filters, viewer)
  const suggestions = chips
    .map((chip) => ({ chip, count: applyFilters(library, chip.remove(filters), viewer).length }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
  const withoutSearch = filters.q ? applyFilters(library, { ...filters, q: '' }, viewer).length : 0
  const anyOf = filters.logic === 'e' ? applyFilters(library, { ...filters, logic: 'ou' }, viewer).length : 0

  return (
    <div className="empty">
      <h2 className="empty-title">Nenhum jogo nesse recorte</h2>
      <p className="lede">
        {suggestions.length || withoutSearch || anyOf
          ? 'A combinação ficou estreita demais. Um ajuste pequeno já traz jogos de volta:'
          : 'Nada na biblioteca combina com isso. Comece de novo com a biblioteca inteira.'}
      </p>
      <ul className="empty-list">
        {withoutSearch > 0 && (
          <li>
            <button type="button" className="btn btn--line" onClick={() => set((p) => ({ ...p, q: '' }))}>
              Apagar a busca “{filters.q}”
            </button>
            <span className="quiet">{withoutSearch} {withoutSearch === 1 ? 'jogo aparece' : 'jogos aparecem'}</span>
          </li>
        )}
        {suggestions.map(({ chip, count }) => (
          <li key={chip.key}>
            <button type="button" className="btn btn--line" onClick={() => set((p) => chip.remove(p))}>
              Tirar “{chip.label}”
            </button>
            <span className="quiet">{count} {count === 1 ? 'jogo aparece' : 'jogos aparecem'}</span>
          </li>
        ))}
        {anyOf > 0 && (
          <li>
            <button type="button" className="btn btn--line" onClick={() => set((p) => ({ ...p, logic: 'ou' }))}>
              Aceitar qualquer uma das marcadas
            </button>
            <span className="quiet">{anyOf} {anyOf === 1 ? 'jogo aparece' : 'jogos aparecem'}</span>
          </li>
        )}
      </ul>
      <button type="button" className="link-btn" onClick={clear}>Limpar tudo</button>
    </div>
  )
}
