'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { GameSummary } from '@/lib/data/games'
import type { SavedFilter } from '@/lib/data/tags'
import { useMember } from '@/lib/member'
import { formatRating, isFinished, jointAverage, statusLabels } from '@/lib/people'
import {
  activeChips, applyFilters, countActive, readFilters, sortLabels, writeFilters,
  type FilterState, type Sort, type Tag, type TagGroup,
} from '@/lib/filters'
import { Cover } from '@/components/Cover'
import { MascotMoment } from '@/components/MascotMoment'
import { GameLink } from '@/components/GameLink'
import { GameCard, Mark } from '@/components/Marks'
import { IconClose, IconFilter, IconGrid, IconList, IconSearch, PairGlyph } from '@/components/icons'
import FilterPanel from './FilterPanel'
import { SavedBar, SelectBar, SelectItem } from './LibraryExtras'

function ListRow({ game }: { game: GameSummary }) {
  const d = isFinished(game.marks.danilo.status)
  const m = isFinished(game.marks.maellen.status)
  const avg = jointAverage(game)
  return (
    <GameLink className="row row--lib" id={game.id} slot="lista">
      <Cover title={game.title} src={game.cover} />
      <span className="row-text">
        <span className="row-title">{game.title}</span>
        <span className="row-meta">{[game.year, game.developer].filter(Boolean).join(', ') || 'Sem detalhes'}</span>
        <span className="row-meta row-state">
          {statusLabels[game.shared]}
          {d && <Mark person="danilo" size={20} />}
          {m && <Mark person="maellen" size={20} />}
          {(d || m) && <span>{d && m ? 'zeramos juntos' : 'zerou'}</span>}
        </span>
      </span>
      {avg !== null && (
        <span className="row-score">
          <PairGlyph size={12} />
          <span className="sr-only">Nota de nós dois</span>
          {formatRating(avg)}
        </span>
      )}
    </GameLink>
  )
}

export function LibraryView({ games, tags, saved }: { games: GameSummary[]; tags: Tag[]; saved: SavedFilter[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const member = useMember()
  const me = member?.person ?? 'danilo'
  const filters = useMemo(() => readFilters(params), [params])
  const [text, setText] = useState(filters.q)
  const [seenQ, setSeenQ] = useState(filters.q)
  const [showArchived, setShowArchived] = useState(false)
  const [open, setOpen] = useState(() => params.get('filtros') === '1')
  const [selecting, setSelecting] = useState(() => params.get('selecionar') === '1')
  const [picked, setPicked] = useState<number[]>([])
  const trigger = useRef<HTMLButtonElement>(null)
  // Two quick taps must both land, so the next change builds on the last one asked for, not on the address that has not caught up yet.
  const latest = useRef(params.toString())
  useEffect(() => { latest.current = params.toString() }, [params])
  const closePanel = useCallback(() => setOpen(false), [])
  const stopSelecting = useCallback(() => { setSelecting(false); setPicked([]) }, [])

  // The address is the source of truth: filters live in it, so a filtered view can be shared and survives back and forward.
  const set = useCallback((next: FilterState | ((prev: FilterState) => FilterState)) => {
    const prev = readFilters(new URLSearchParams(latest.current))
    const qs = writeFilters(typeof next === 'function' ? next(prev) : next).toString()
    latest.current = qs
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [router, pathname])
  const toggle = useCallback((group: TagGroup | 'prefs', value: string) => {
    set((prev) => {
      const current = prev[group] as string[]
      return { ...prev, [group]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] }
    })
  }, [set])
  const clear = useCallback(() => set((prev) => ({ ...readFilters(new URLSearchParams()), view: prev.view, sort: prev.sort })), [set])

  // Search is debounced; when the address changes from elsewhere the box follows it.
  if (seenQ !== filters.q) {
    setSeenQ(filters.q)
    setText(filters.q)
  }
  useEffect(() => {
    if (text === filters.q) return
    const t = setTimeout(() => set((prev) => ({ ...prev, q: text.trim() ? text : '' })), 250)
    return () => clearTimeout(t)
  }, [text, filters.q, set])

  const active = useMemo(() => games.filter((g) => !g.archived), [games])
  const archived = useMemo(() => games.filter((g) => g.archived), [games])
  const results = useMemo(() => applyFilters(games, filters, tags, me), [games, filters, tags, me])
  const chips = useMemo(() => activeChips(filters, tags, me), [filters, tags, me])
  const nActive = countActive(filters)
  const searching = filters.q.trim().length > 0
  const narrowed = nActive > 0 || searching

  // Empty result: which single filter, taken off, brings back the most games.
  const hint = useMemo(() => {
    if (results.length) return undefined
    let best: { label: string; count: number; next: FilterState } | undefined
    for (const chip of chips) {
      const next = chip.remove(filters)
      const count = applyFilters(games, next, tags, me).length
      if (count > (best?.count ?? 0)) best = { label: chip.label, count, next }
    }
    if (filters.q) {
      const next = { ...filters, q: '' }
      const count = applyFilters(games, next, tags, me).length
      if (count > (best?.count ?? 0)) best = { label: `a busca “${filters.q}”`, count, next }
    }
    return best
  }, [results.length, chips, games, filters, tags, me])

  return (
    <div className="page lib">
      <div className="lib-head">
        <h1 className="h1">Biblioteca</h1>
        <p className="quiet">{active.length === 1 ? '1 jogo no clube' : `${active.length} jogos no clube`}</p>
      </div>

      {active.length === 0 && archived.length === 0 ? (
        <>
        <MascotMoment moment="peek" size={72} />
        <div className="empty">
          <PairGlyph size={36} />
          <h2 className="h2">Nenhum jogo por aqui ainda</h2>
          <div className="body">
            <p>Tudo o que vocês jogaram, estão jogando e querem jogar fica nesta estante, com busca e ordem.</p>
          </div>
          <div className="empty-actions">
            <Link className="btn btn--both" href="/adicionar">Adicionar jogo</Link>
          </div>
        </div>
        </>
      ) : (
        <>
          <div className="lib-tools">
            <label className="search">
              <span className="sr-only">Buscar na biblioteca</span>
              <IconSearch size={20} />
              <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Buscar por título ou estúdio" autoComplete="off" />
            </label>
            <button ref={trigger} type="button" className="btn btn--plain lib-filter" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
              <IconFilter size={20} />
              Filtros
              {nActive > 0 && <span className="count" aria-label={`${nActive} ativos`}>{nActive}</span>}
            </button>
            <label className="select">
              <span className="sr-only">Ordenar por</span>
              <select value={filters.sort} onChange={(e) => set((p) => ({ ...p, sort: e.target.value as Sort }))}>
                {(Object.keys(sortLabels) as Sort[]).map((s) => <option key={s} value={s}>{sortLabels[s]}</option>)}
              </select>
            </label>
          </div>

          <SavedBar filters={filters} active={nActive} saved={saved} />

          <div className="lib-status">
            <p className="lib-count" role="status">
              <strong>{results.length}</strong>{' '}
              {narrowed ? `de ${active.length} jogos` : results.length === 1 ? 'jogo' : 'jogos'}
            </p>
            {narrowed && <button type="button" className="link" onClick={clear}>Limpar tudo</button>}
            {results.length > 0 && (
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

          {results.length === 0 ? (
            <>
            <MascotMoment moment="peek" size={72} />
            <div className="empty">
              <PairGlyph size={36} />
              <h2 className="h2">{narrowed ? 'Nenhum jogo com esses filtros' : 'Tudo o que tinha aqui está arquivado'}</h2>
              <p>{narrowed ? 'Assim não sobra nada. Tire um filtro ou adicione o jogo que falta.' : 'Desarquive um jogo ou adicione outro.'}</p>
              {hint && (
                <p>
                  Sem <strong>{hint.label}</strong> {hint.count === 1 ? 'aparece 1 jogo' : `aparecem ${hint.count} jogos`}.
                </p>
              )}
              <div className="empty-actions">
                {hint && <button type="button" className="btn btn--both" onClick={() => set(hint.next)}>Tirar {hint.label}</button>}
                {narrowed && <button type="button" className="btn btn--plain" onClick={clear}>Limpar tudo</button>}
                <Link className="btn btn--both" href={searching ? `/adicionar?q=${encodeURIComponent(filters.q)}` : '/adicionar'}>Adicionar jogo</Link>
              </div>
            </div>
            </>
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

          {!selecting && archived.length > 0 && (
            <section className="sec archived" aria-labelledby="h-arquivados">
              <button type="button" className="link" id="h-arquivados" aria-expanded={showArchived} onClick={() => setShowArchived(!showArchived)}>
                {showArchived ? 'Esconder arquivados' : `Ver arquivados (${archived.length})`}
              </button>
              {showArchived && (
                <ul className="rows">
                  {archived.map((g) => (
                    <li key={g.id}>
                      <Link className="row row--archived" href={`/jogo/${g.id}`}>
                        <Cover title={g.title} src={g.cover} />
                        <span className="row-text">
                          <span className="row-title">{g.title}</span>
                          <span className="row-meta">Arquivado</span>
                        </span>
                        <span className="row-go">Abrir</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          {selecting && <SelectBar ids={picked.filter((id) => results.some((g) => g.id === id))} tags={tags} onDone={stopSelecting} />}
        </>
      )}

      <FilterPanel open={open} onClose={closePanel} trigger={trigger} count={results.length} filters={filters} tags={tags} set={set} toggle={toggle} clear={clear} />
    </div>
  )
}
