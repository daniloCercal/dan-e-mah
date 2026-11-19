'use client'

import Link from 'next/link'
import { useNameOf } from '@/lib/member'
import { formatDate, formatMinutes, type Session } from '@/lib/sessions'
import { WhoMarks } from './Marks'

/** One diary entry: the day, who played and for how long, what happened. */
export function SessionNote({ session, title, showGame = true }: { session: Session; title?: string; showGame?: boolean }) {
  const nameOf = useNameOf()
  const both = session.who.length === 2
  return (
    <article className="note">
      <p className="note-date">
        <span className="note-day">{formatDate(session.date, { day: '2-digit' })}</span>
        <span className="note-dow">{formatDate(session.date, { weekday: 'short' }).replace('.', '')}</span>
      </p>
      <div className="note-body">
        {showGame && title && (
          <h3 className="note-title">
            <Link href={`/jogo/${session.gameId}`}>{title}</Link>
          </h3>
        )}
        <p className="note-meta">
          <WhoMarks who={session.who} size={24} />
          <span>{both ? 'Juntos' : `Só ${nameOf(session.who[0])}`}, {formatMinutes(session.minutes)}</span>
        </p>
        {session.note && <p className="note-text">{session.note}</p>}
        {session.moment && <p className="note-moment">{session.moment}</p>}
      </div>
    </article>
  )
}
