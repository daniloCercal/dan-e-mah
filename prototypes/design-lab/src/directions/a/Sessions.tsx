import { Link } from 'react-router-dom'
import { formatDate, formatMinutes, people, type Game, type Session } from '../../data/games'
import { base, useFrom, useOpenGame } from './ui'

export function whoLabel(session: Session): string {
  return session.who.length === 2 ? 'Os dois' : `Só ${people[session.who[0]].name}`
}

/** One diary entry. `game` is omitted on the game's own page, where the title would only repeat. */
export function SessionEntry({ session, game }: { session: Session; game?: Game }) {
  const open = useOpenGame()
  const state = useFrom()
  return (
    <li className="entry">
      <time className="entry-date" dateTime={session.date}>
        <span className="entry-day">{formatDate(session.date, { day: 'numeric' })}</span>
        <span className="entry-month">{formatDate(session.date, { month: 'short' }).replace('.', '')}</span>
      </time>
      <div className="entry-body">
        {game && (
          <h3 className="entry-title">
            <Link to={`${base}/jogo/${game.id}`} state={state} onClick={(e) => open(game, e)}>{game.title}</Link>
          </h3>
        )}
        <p className="entry-meta">
          {formatMinutes(session.minutes)}, {whoLabel(session).toLowerCase()}
        </p>
        {session.note && <p className="entry-note">{session.note}</p>}
        {session.moment && <p className="entry-moment">{session.moment}</p>}
      </div>
    </li>
  )
}
