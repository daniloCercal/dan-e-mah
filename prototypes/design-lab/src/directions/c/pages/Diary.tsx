import { Link } from 'react-router-dom'
import { formatMinutes, type Session } from '../../../data/games'
import { findGame, useStore } from '../store'
import { Cover, Player } from '../ui'

function monthLabel(key: string) {
  const label = new Date(`${key}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function Diary() {
  const store = useStore()
  const sorted = [...store.sessions].sort((a, b) => b.date.localeCompare(a.date))
  const months = new Map<string, Session[]>()
  for (const s of sorted) months.set(s.date.slice(0, 7), [...(months.get(s.date.slice(0, 7)) ?? []), s])

  return (
    <div className="c-diary">
      <section className="c-wrap c-page">
        <h1 className="c-h1">Diário</h1>
        <p className="c-lead">O que já vivemos, sessão por sessão. Para registrar uma nova, abra o jogo e toque em “Registrar sessão”.</p>
      </section>
      {[...months.entries()].map(([key, list], i) => {
        const total = list.reduce((sum, s) => sum + s.minutes, 0)
        return (
          <section key={key} className={`c-block ${i % 2 === 0 ? 'c-block--surface' : ''}`} aria-labelledby={`c-m-${key}`}>
            <div className="c-wrap c-diary__month">
              <header className="c-diary__head">
                <h2 id={`c-m-${key}`} className="c-h2">{monthLabel(key)}</h2>
                <p className="c-muted">
                  {list.length === 1 ? 'Uma sessão' : `${list.length} sessões`}, <span className="c-num">{formatMinutes(total)}</span>
                </p>
              </header>
              <ol className="c-diary__list">
                {list.map((s) => {
                  const g = findGame(store, s.gameId)
                  if (!g) return null
                  const date = new Date(`${s.date}T12:00:00`)
                  return (
                    <li key={s.id} className="c-entry">
                      <time dateTime={s.date} className="c-entry__day">
                        <strong>{date.getDate()}</strong>
                        <span>{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                      </time>
                      <div className="c-entry__body">
                        <Link to={`/c/jogo/${g.id}`} className="c-entry__game">
                          <Cover game={g} kind="header" decorative />
                          <span>
                            <strong>{g.title}</strong>
                            <span className="c-num">{formatMinutes(s.minutes)}</span>
                          </span>
                        </Link>
                        <div className="c-entry__who">{s.who.map((p) => <Player key={p} id={p} />)}</div>
                        {s.note && <p>{s.note}</p>}
                        {s.moment && <p className="c-moment">“{s.moment}”</p>}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </section>
        )
      })}
    </div>
  )
}
