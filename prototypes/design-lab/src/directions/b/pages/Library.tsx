import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatRating, jointAverage, statusLabels, type Game } from '../../../data/games'
import { activeChips, applyFilters, countActive, sortLabels, useLibraryFilters, type Sort } from '../../../lib/filters'
import { useViewer } from '../../../lib/viewer'
import { finishedBy, useClub } from '../store'
import { Cover, GameCard, Mark } from '../components/Marks'
import { IconClose, IconFilter, IconGrid, IconList, IconSearch, PairGlyph } from '../components/icons'
import { GameLink } from '../components/GameLink'
import { Busy, SkCard, SkRow } from '../components/Loading'
import { useLoaded } from '../lib/latency'
import FilterPanel from './FilterPanel'
import { ArchivedList, SavedBar, SelectBar, SelectItem } from './LibraryExtras'

function ListRow({ game }: { game: Game }) {
  const avg = jointAverage(game)
  const d = finishedBy(game, 'danilo')
  const m = finishedBy(game, 'maellen')
  return (
    <GameLink className="row row--lib" id={game.id} slot="lista">
      <Cover game={game} />
      <span className="row-text">
        <span className="row-title">{game.title}</span>
        <span className="row-meta">{game.year}, {game.developer}</span>
        <span className="row-meta row-state">
          {statusLabels[game.shared]}
          {d && <Mark person="danilo" size={20} />}
          {m && <Mark person="maellen" size={20} />}
          {(d || m) && <span>{d && m ? 'zeramos juntos' : 'zerou'}</span>}
        </span>
      </span>
      {avg !== undefined && (
        <span className="row-score">
          <PairGlyph size={12} />
          <span className="sr-only">Nota de nós dois</span>
          {formatRating(avg)}
        </span>
      )}
    </GameLink>
  )
}

export default function Library() {
  const { viewer } = useViewer()
  const { games } = useClub()
  const ready = useLoaded('biblioteca')
  const { filters, set, toggle, clear } = useLibraryFilters()
  const [params] = useSearchParams()
  const [open, setOpen] = useState(() => params.get('filtros') === '1')
  const [selecting, setSelecting] = useState(() => params.get('selecionar') === '1')
  const [picked, setPicked] = useState<string[]>([])
  const stopSelecting = useCallback(() => { setSelecting(false); setPicked([]) }, [])
  const [text, setText] = useState(filters.q)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setOpen(false), [])

  // Search is debounced; the URL stays the source of truth.
  useEffect(() => setText(filters.q), [filters.q])
  useEffect(() => {
    if (text === filters.q) return
    const t = setTimeout(() => set((prev) => ({ ...prev, q: text })), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  const results = useMemo(() => applyFilters(games, filters, viewer), [games, filters, viewer])
  const chips = activeChips(filters, viewer)
  const active = countActive(filters)

  // Empty state: find the single filter whose removal brings back the most games.
  const hint = useMemo(() => {
    if (results.length) return undefined
    let best: { label: string; count: number; apply: () => void } | undefined
    for (const chip of chips) {
      const count = applyFilters(games, chip.remove(filters), viewer).length
      if (count > (best?.count ?? 0)) best = { label: chip.label, count, apply: () => set(chip.remove) }
    }
    if (filters.q) {
      const count = applyFilters(games, { ...filters, q: '' }, viewer).length
      if (count > (best?.count ?? 0)) best = { label: `a busca “${filters.q}”`, count, apply: () => set((p) => ({ ...p, q: '' })) }
    }
    return best
  }, [results.length, chips, games, filters, viewer, set])

  const isSaved = (query: string) => {
    const want = new URLSearchParams(query)
    return [...want.entries()].every(([k, v]) => params.get(k) === v) && active === [...want.values()].join(',').split(',').length
  }

  return (
    <div className="page lib">
      <div className="lib-head">
        <h1 className="h1">Biblioteca</h1>
        <p className="quiet">{ready ? `${games.length} jogos no clube` : 'Abrindo a estante'}</p>
      </div>

      <div className="lib-tools">
        <label className="search">
          <span className="sr-only">Buscar na biblioteca</span>
          <IconSearch size={20} />
          <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Buscar por título ou estúdio" autoComplete="off" />
        </label>
        <button ref={trigger} type="button" className="btn btn--plain lib-filter" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
          <IconFilter size={20} />
          Filtros
          {active > 0 && <span className="count" aria-label={`${active} ativos`}>{active}</span>}
        </button>
        <label className="select">
          <span className="sr-only">Ordenar por</span>
          <select value={filters.sort} onChange={(e) => set((p) => ({ ...p, sort: e.target.value as Sort }))}>
            {(Object.keys(sortLabels) as Sort[]).map((s) => <option key={s} value={s}>{sortLabels[s]}</option>)}
          </select>
        </label>
      </div>

      <SavedBar filters={filters} active={active} isSaved={isSaved} />

      <div className="lib-status">
        <p className="lib-count" role="status">
          {ready ? (
            <>
              <strong>{results.length}</strong>{' '}
              {active > 0 || filters.q ? `de ${games.length} jogos` : results.length === 1 ? 'jogo' : 'jogos'}
            </>
          ) : (
            'Carregando os jogos'
          )}
        </p>
        {(active > 0 || filters.q) && <button type="button" className="link" onClick={clear}>Limpar tudo</button>}
        {ready && results.length > 0 && (
          <button type="button" className="link lib-select" aria-pressed={selecting} onClick={() => (selecting ? stopSelecting() : setSelecting(true))}>
            {selecting ? 'Cancelar seleção' : 'Selecionar'}
          </button>
        )}
        <div className="seg" role="group" aria-label="Modo de exibição">
          <button type="button" aria-pressed={filters.view === 'grade'} onClick={() => set((p) => ({ ...p, view: 'grade' }))}>
            <IconGrid size={20} /><span className="sr-only">Grade</span>
          </button>
          <button type="button" aria-pressed={filters.view === 'lista'} onClick={() => set((p) => ({ ...p, view: 'lista' }))}>
            <IconList size={20} /><span className="sr-only">Lista</span>
          </button>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="active-chips" aria-label="Filtros ativos">
          {chips.map((c) => (
            <li key={c.key}>
              <button type="button" className="chip chip--on chip--x" onClick={() => set(c.remove)} aria-label={`Remover filtro ${c.label}`}>
                {c.label}
                <IconClose size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!ready ? (
        <Busy label="Carregando a biblioteca">
          {filters.view === 'lista' ? (
            <div className="rows rows--lib">{[0, 1, 2, 3, 4, 5].map((i) => <SkRow key={i} />)}</div>
          ) : (
            <div className="grid">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <SkCard key={i} />)}</div>
          )}
        </Busy>
      ) : results.length === 0 ? (
        <div className="empty">
          <PairGlyph size={36} />
          <h2 className="h2">Nenhum jogo com esses filtros</h2>
          <p>A Mahdame é exigente, mas assim também não sobra nada.</p>
          {hint && (
            <p>
              Sem <strong>{hint.label}</strong> {hint.count === 1 ? 'aparece 1 jogo' : `aparecem ${hint.count} jogos`}.
            </p>
          )}
          <div className="empty-actions">
            {hint && <button type="button" className="btn btn--both" onClick={hint.apply}>Tirar {hint.label}</button>}
            <button type="button" className="btn btn--plain" onClick={clear}>Limpar tudo</button>
          </div>
        </div>
      ) : selecting ? (
        <ul className={filters.view === 'lista' ? 'rows rows--lib' : 'grid'} aria-label="Escolha os jogos">
          {results.map((g) => (
            <li key={g.id}>
              <SelectItem game={g} list={filters.view === 'lista'} on={picked.includes(g.id)} toggle={() => setPicked((cur) => (cur.includes(g.id) ? cur.filter((x) => x !== g.id) : [...cur, g.id]))} />
            </li>
          ))}
        </ul>
      ) : filters.view === 'lista' ? (
        <ul className="rows rows--lib">
          {results.map((g) => <li key={g.id}><ListRow game={g} /></li>)}
        </ul>
      ) : (
        <ul className="grid">
          {results.map((g, i) => <li key={g.id}><GameCard game={g} eager={i < 6} /></li>)}
        </ul>
      )}

      {ready && !selecting && <ArchivedList />}
      {selecting && <SelectBar ids={picked.filter((id) => results.some((g) => g.id === id))} onDone={stopSelecting} />}

      <FilterPanel open={open} onClose={close} trigger={trigger} count={results.length} filters={filters} set={set} toggle={toggle} clear={clear} />
    </div>
  )
}
