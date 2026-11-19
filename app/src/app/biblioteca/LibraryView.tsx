'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { GameSummary } from '@/lib/data/games'
import { isFinished, statusLabels } from '@/lib/people'
import { Cover } from '@/components/Cover'
import { GameCard, Mark } from '@/components/Marks'
import { IconGrid, IconList, IconSearch, PairGlyph } from '@/components/icons'

type Sort = 'recentes' | 'titulo' | 'ano'
type View = 'grade' | 'lista'

const sortLabels: Record<Sort, string> = {
  recentes: 'Adicionados recentemente',
  titulo: 'Título (A–Z)',
  ano: 'Lançamento mais recente',
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const by: Record<Sort, (a: GameSummary, b: GameSummary) => number> = {
  recentes: (a, b) => b.addedAt.localeCompare(a.addedAt),
  titulo: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
  ano: (a, b) => (b.year ?? 0) - (a.year ?? 0),
}

function ListRow({ game }: { game: GameSummary }) {
  const d = isFinished(game.marks.danilo.status)
  const m = isFinished(game.marks.maellen.status)
  return (
    <Link className="row row--lib" href={`/jogo/${game.id}`}>
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
    </Link>
  )
}

export function LibraryView({ games }: { games: GameSummary[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const q = params.get('q') ?? ''
  const sort: Sort = (['recentes', 'titulo', 'ano'] as const).find((s) => s === params.get('ordem')) ?? 'recentes'
  const view: View = params.get('vista') === 'lista' ? 'lista' : 'grade'
  const [text, setText] = useState(q)
  const [showArchived, setShowArchived] = useState(false)

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // Search is debounced; the address stays the source of truth.
  useEffect(() => setText(q), [q])
  useEffect(() => {
    if (text === q) return
    const t = setTimeout(() => set({ q: text.trim() ? text : null }), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  const active = useMemo(() => games.filter((g) => !g.archived), [games])
  const archived = useMemo(() => games.filter((g) => g.archived), [games])
  const results = useMemo(() => {
    const n = fold(q)
    return active.filter((g) => !n || fold(`${g.title} ${g.developer ?? ''}`).includes(n)).sort(by[sort])
  }, [active, q, sort])

  const searching = q.trim().length > 0

  return (
    <div className="page lib">
      <div className="lib-head">
        <h1 className="h1">Biblioteca</h1>
        <p className="quiet">{active.length === 1 ? '1 jogo no clube' : `${active.length} jogos no clube`}</p>
      </div>

      {active.length === 0 && archived.length === 0 ? (
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
      ) : (
        <>
          <div className="lib-tools">
            <label className="search">
              <span className="sr-only">Buscar na biblioteca</span>
              <IconSearch size={20} />
              <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Buscar por título ou estúdio" autoComplete="off" />
            </label>
            <label className="select">
              <span className="sr-only">Ordenar por</span>
              <select value={sort} onChange={(e) => set({ ordem: e.target.value === 'recentes' ? null : e.target.value })}>
                {(Object.keys(sortLabels) as Sort[]).map((s) => <option key={s} value={s}>{sortLabels[s]}</option>)}
              </select>
            </label>
          </div>

          <div className="lib-status">
            <p className="lib-count" role="status">
              <strong>{results.length}</strong>{' '}
              {searching ? `de ${active.length} jogos` : results.length === 1 ? 'jogo' : 'jogos'}
            </p>
            {searching && <button type="button" className="link" onClick={() => set({ q: null })}>Limpar busca</button>}
            <div className="seg" role="group" aria-label="Modo de exibição">
              <button type="button" aria-pressed={view === 'grade'} onClick={() => set({ vista: null })}>
                <IconGrid size={20} /><span className="sr-only">Grade</span>
              </button>
              <button type="button" aria-pressed={view === 'lista'} onClick={() => set({ vista: 'lista' })}>
                <IconList size={20} /><span className="sr-only">Lista</span>
              </button>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="empty">
              <PairGlyph size={36} />
              <h2 className="h2">{searching ? 'Nenhum jogo com essa busca' : 'Tudo o que tinha aqui está arquivado'}</h2>
              <p>{searching ? `Nada com “${q}” por título ou estúdio. Confira o nome ou adicione o jogo.` : 'Desarquive um jogo ou adicione outro.'}</p>
              <div className="empty-actions">
                {searching && <button type="button" className="btn btn--plain" onClick={() => set({ q: null })}>Limpar busca</button>}
                <Link className="btn btn--both" href={searching ? `/adicionar?q=${encodeURIComponent(q)}` : '/adicionar'}>Adicionar jogo</Link>
              </div>
            </div>
          ) : view === 'lista' ? (
            <ul className="rows rows--lib">
              {results.map((g) => <li key={g.id}><ListRow game={g} /></li>)}
            </ul>
          ) : (
            <ul className="grid">
              {results.map((g, i) => <li key={g.id}><GameCard game={g} eager={i < 6} /></li>)}
            </ul>
          )}

          {archived.length > 0 && (
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
        </>
      )}
    </div>
  )
}
