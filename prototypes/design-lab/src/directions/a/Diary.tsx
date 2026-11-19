import { Link } from 'react-router-dom'
import { formatDate, formatMinutes, type Session } from '../../data/games'
import { SessionEntry } from './Sessions'
import { useLibrary, useSessions } from './store'
import { PageHead, base } from './ui'

export default function Diary() {
  const sessions = useSessions()
  const library = useLibrary()
  const byId = new Map(library.map((g) => [g.id, g]))

  const months: { key: string; items: Session[] }[] = []
  for (const session of sessions) {
    const key = session.date.slice(0, 7)
    const last = months[months.length - 1]
    if (last?.key === key) last.items.push(session)
    else months.push({ key, items: [session] })
  }

  return (
    <div className="page diary">
      <PageHead title="Diário" />
      <p className="lede">O que já vivemos, sessão por sessão. Uma sessão nova entra pela página do jogo, em “Registrar sessão”.</p>

      {months.length === 0 && (
        <p className="quiet">Nenhuma sessão ainda. <Link to={`${base}/biblioteca`}>Escolha um jogo</Link> para registrar a primeira.</p>
      )}

      {months.map((month) => {
        const total = month.items.reduce((sum, s) => sum + s.minutes, 0)
        return (
          <section className="month" key={month.key} aria-labelledby={`month-${month.key}`}>
            <div className="month-head">
              <h2 id={`month-${month.key}`} className="month-title">
                {formatDate(`${month.key}-01`, { month: 'long', year: 'numeric' })}
              </h2>
              <p className="quiet">
                {month.items.length} {month.items.length === 1 ? 'sessão' : 'sessões'}, {formatMinutes(total)}
              </p>
            </div>
            <ul className="entries">
              {month.items.map((s) => <SessionEntry key={s.id} session={s} game={byId.get(s.gameId)} />)}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
