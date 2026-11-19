import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatDate, formatMinutes, type Session } from '../../../data/games'
import { B, finishedBy, monthLabel, useClub, type Milestone } from '../store'
import { useLoaded } from '../lib/latency'
import { Cover, Stamp } from '../components/Marks'
import { GameLink } from '../components/GameLink'
import { PageLoader } from '../components/Loading'
import { IconPlus, PairGlyph } from '../components/icons'
import { SessionNote } from './Home'
import SessionForm from './SessionForm'

type Entry = { kind: 'session'; date: string; session: Session } | { kind: 'milestone'; date: string; milestone: Milestone }

export default function Diary() {
  const { games, sessions, milestones, findGame } = useClub()
  const [params] = useSearchParams()
  const ready = useLoaded('diario')
  const [adding, setAdding] = useState(() => params.get('nova') === '1')
  const [editing, setEditing] = useState<string | null>(() => params.get('editar'))

  const entries: Entry[] = [
    ...sessions.map((session): Entry => ({ kind: 'session', date: session.date, session })),
    ...milestones.map((milestone): Entry => ({ kind: 'milestone', date: milestone.date, milestone })),
  ].sort((a, b) => b.date.localeCompare(a.date) || (a.kind === 'milestone' ? -1 : 1))

  const months: { key: string; items: Entry[] }[] = []
  for (const e of entries) {
    const key = e.date.slice(0, 7)
    let month = months.find((m) => m.key === key)
    if (!month) months.push((month = { key, items: [] }))
    month.items.push(e)
  }
  const together = games.filter((g) => finishedBy(g, 'danilo') && finishedBy(g, 'maellen'))

  return (
    <div className="page diary">
      <div className="lib-head">
        <h1 className="h1">Diário</h1>
        <p className="quiet">{ready ? `${sessions.length} sessões anotadas` : ''}</p>
      </div>

      {adding ? (
        <SessionForm onDone={() => setAdding(false)} />
      ) : (
        <button type="button" className="btn btn--both diary-add" onClick={() => setAdding(true)}>
          <IconPlus size={20} />
          Registrar sessão
        </button>
      )}

      {!ready && <PageLoader label="Abrindo o diário" />}

      {ready && together.length > 0 && (
        <section className="sec zeramos" aria-labelledby="h-zeramos">
          <h2 className="h2" id="h-zeramos"><PairGlyph size={18} />Zeramos juntos</h2>
          <p className="quiet">{together.length} jogos com os dois carimbos.</p>
          <ul className="hscroll zeramos-list">
            {together.map((g) => (
              <li key={g.id}>
                <GameLink className="zeramos-item" id={g.id} slot="zeramos">
                  <Cover game={g} />
                  <span className="zeramos-stamps"><Stamp person="danilo" size={26} /><Stamp person="maellen" size={26} /></span>
                  <span className="zeramos-title">{g.title}</span>
                </GameLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ready && months.map((month) => {
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
                  const game = findGame(e.milestone.gameId)
                  return (
                    <li key={`z-${e.milestone.gameId}`} className="diary-item diary-item--both">
                      <article className="note">
                        <p className="note-date">
                          <span className="note-day">{formatDate(e.date, { day: '2-digit' })}</span>
                          <span className="note-dow">{formatDate(e.date, { weekday: 'short' }).replace('.', '')}</span>
                        </p>
                        <div className="note-body">
                          <h3 className="note-title">Zeramos juntos: {game ? <Link to={`${B}/jogo/${game.id}`}>{game.title}</Link> : 'um jogo'}</h3>
                          <p className="note-meta"><Stamp person="danilo" size={30} /><Stamp person="maellen" size={30} /><span>Os dois carimbos no mesmo jogo.</span></p>
                        </div>
                      </article>
                    </li>
                  )
                }
                const s = e.session
                const game = findGame(s.gameId)
                if (editing === s.id) {
                  return <li key={s.id} className="diary-item diary-item--edit"><SessionForm session={s} onDone={() => setEditing(null)} /></li>
                }
                return (
                  <li key={s.id} className="diary-item">
                    <div>
                      <SessionNote session={s} game={game} />
                      <button type="button" className="link note-edit" onClick={() => setEditing(s.id)}>
                        Editar<span className="sr-only"> sessão de {game?.title} em {formatDate(s.date)}</span>
                      </button>
                    </div>
                    {game && (
                      <Link className="diary-cover" to={`${B}/jogo/${game.id}`} tabIndex={-1} aria-hidden="true">
                        <Cover game={game} />
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
