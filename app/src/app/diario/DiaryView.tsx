'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cover } from '@/components/Cover'
import { GameLink } from '@/components/GameLink'
import { MascotMoment } from '@/components/MascotMoment'
import { PairGlyph, IconPlus } from '@/components/icons'
import { Stamp } from '@/components/Marks'
import { SessionForm } from '@/components/SessionForm'
import { SessionNote } from '@/components/SessionNote'
import { EmptyPage } from '@/components/States'
import { formatDate, formatMinutes, monthLabel, type Session } from '@/lib/sessions'

export interface DiaryGame { id: number; title: string; cover: string | null; archived: boolean; together: boolean; togetherOn: string | null }

type Entry =
  | { kind: 'session'; date: string; session: Session }
  | { kind: 'milestone'; date: string; game: DiaryGame }

export function DiaryView({ sessions, games }: { sessions: Session[]; games: DiaryGame[] }) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const byId = new Map(games.map((g) => [g.id, g]))
  const together = games.filter((g) => g.together && !g.archived)
  const choices = games.filter((g) => !g.archived).map((g) => ({ id: g.id, title: g.title }))

  const entries: Entry[] = [
    ...sessions.map((session): Entry => ({ kind: 'session', date: session.date, session })),
    ...together.flatMap((game): Entry[] => (game.togetherOn ? [{ kind: 'milestone', date: game.togetherOn, game }] : [])),
  ].sort((a, b) => b.date.localeCompare(a.date) || (a.kind === 'milestone' ? -1 : 1))

  const months: { key: string; items: Entry[] }[] = []
  for (const e of entries) {
    const key = e.date.slice(0, 7)
    let month = months.find((m) => m.key === key)
    if (!month) months.push((month = { key, items: [] }))
    month.items.push(e)
  }

  if (games.length === 0) {
    return (
      <EmptyPage title="Diário" heading="Nenhuma sessão registrada" actions={<Link className="btn btn--both" href="/adicionar">Adicionar jogo</Link>}>
        <p>Primeiro entra um jogo na biblioteca. Depois de jogar, registrem a sessão: quanto tempo durou, quem estava e o que aconteceu de bom.</p>
      </EmptyPage>
    )
  }

  return (
    <div className="page diary">
      <div className="lib-head">
        <h1 className="h1">Diário</h1>
        <p className="quiet">{sessions.length === 1 ? '1 sessão anotada' : `${sessions.length} sessões anotadas`}</p>
      </div>

      {adding ? (
        <SessionForm games={choices} onDone={() => setAdding(false)} />
      ) : (
        <button type="button" className="btn btn--both diary-add" onClick={() => setAdding(true)}>
          <IconPlus size={20} />
          Registrar sessão
        </button>
      )}

      {together.length > 0 && (
        <section className="sec zeramos" aria-labelledby="h-zeramos">
          <h2 className="h2" id="h-zeramos"><PairGlyph size={18} />Zeramos juntos</h2>
          <p className="quiet">{together.length === 1 ? '1 jogo com os dois carimbos.' : `${together.length} jogos com os dois carimbos.`}</p>
          <ul className="hscroll zeramos-list">
            {together.map((g) => (
              <li key={g.id}>
                <GameLink className="zeramos-item" id={g.id} slot="zeramos">
                  <Cover title={g.title} src={g.cover} />
                  <span className="zeramos-stamps"><Stamp person="danilo" size={26} /><Stamp person="maellen" size={26} /></span>
                  <span className="zeramos-title">{g.title}</span>
                </GameLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sessions.length === 0 && !adding && (
        <>
          <MascotMoment moment="peek" size={72} />
          <div className="empty diary-empty">
            <PairGlyph size={36} />
            <h2 className="h2">Nenhuma sessão registrada</h2>
            <p className="body">Depois de jogar, registrem a sessão: quanto tempo durou, quem estava e o que aconteceu de bom.</p>
          </div>
        </>
      )}

      {months.map((month) => {
        const minutes = month.items.reduce((sum, e) => sum + (e.kind === 'session' && e.session.who.length === 2 ? e.session.minutes : 0), 0)
        return (
          <section key={month.key} className="month" aria-labelledby={`m-${month.key}`}>
            <div className="month-head">
              <h2 className="h2" id={`m-${month.key}`}>{monthLabel(month.key)}</h2>
              <p className="quiet">{minutes ? `${formatMinutes(minutes)} juntos` : 'Nenhuma sessão juntos'}</p>
            </div>
            <ol className="notes notes--diary">
              {month.items.map((e) => {
                if (e.kind === 'milestone') {
                  return (
                    <li key={`z-${e.game.id}`} className="diary-item diary-item--both">
                      <article className="note">
                        <p className="note-date">
                          <span className="note-day">{formatDate(e.date, { day: '2-digit' })}</span>
                          <span className="note-dow">{formatDate(e.date, { weekday: 'short' }).replace('.', '')}</span>
                        </p>
                        <div className="note-body">
                          <h3 className="note-title">Zeramos juntos: <Link href={`/jogo/${e.game.id}`}>{e.game.title}</Link></h3>
                          <p className="note-meta"><Stamp person="danilo" size={30} /><Stamp person="maellen" size={30} /><span>Os dois carimbos no mesmo jogo.</span></p>
                        </div>
                      </article>
                    </li>
                  )
                }
                const s = e.session
                const game = byId.get(s.gameId)
                if (editing === s.id) {
                  return <li key={s.id} className="diary-item diary-item--edit"><SessionForm games={choices} session={s} onDone={() => setEditing(null)} /></li>
                }
                return (
                  <li key={s.id} className="diary-item">
                    <div>
                      <SessionNote session={s} title={game?.title ?? 'Jogo removido'} />
                      <button type="button" className="link note-edit" onClick={() => setEditing(s.id)}>
                        Editar<span className="sr-only"> sessão de {game?.title ?? 'jogo removido'} em {formatDate(s.date)}</span>
                      </button>
                    </div>
                    {game && (
                      <Link className="diary-cover" href={`/jogo/${game.id}`} tabIndex={-1} aria-hidden="true">
                        <Cover title={game.title} src={game.cover} />
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
