import Link from 'next/link'
import { initialOf, statusLabels, isFinished, type Person } from '@/lib/people'
import type { GameSummary } from '@/lib/data/games'
import { Cover } from './Cover'

export const defaultName = (p: Person) => (p === 'danilo' ? 'Danilo' : 'Maellen')

/** A person's avatar: their initial on their colour (profile photos arrive with the profile page). */
export function Mark({ person, size = 28, named = true }: { person: Person; size?: number; named?: boolean }) {
  return (
    <span className="mark" data-person={person} style={{ ['--s' as string]: `${size}px` }}>
      <span aria-hidden="true">{initialOf(person)}</span>
      {named && <span className="sr-only">{defaultName(person)}</span>}
    </span>
  )
}

/** Rubber-stamp version of the mark, used when a person finishes a game. */
export function Stamp({ person, press = false, size = 52 }: { person: Person; press?: boolean; size?: number }) {
  return (
    <span className={press ? 'stamp stamp--press' : 'stamp'} data-person={person} style={{ ['--s' as string]: `${size}px` }}>
      <span aria-hidden="true">{initialOf(person)}</span>
      <span className="sr-only">Carimbo de {defaultName(person)}</span>
    </span>
  )
}

export function CardCaption({ game }: { game: Pick<GameSummary, 'title' | 'shared' | 'marks'> }) {
  const d = isFinished(game.marks.danilo.status)
  const m = isFinished(game.marks.maellen.status)
  return (
    <>
      <span className="gcard-title">{game.title}</span>
      {d || m ? (
        <span className="gcard-stamps">
          {d && <Stamp person="danilo" size={24} />}
          {m && <Stamp person="maellen" size={24} />}
          <span>{d && m ? 'Zeramos juntos' : `${defaultName(d ? 'danilo' : 'maellen')} zerou`}</span>
        </span>
      ) : (
        <span className="gcard-meta">{statusLabels[game.shared]}</span>
      )}
    </>
  )
}

/** Cover card used in the library grid and the short lists. */
export function GameCard({ game, tilt, eager }: { game: GameSummary; tilt?: 'a' | 'b'; eager?: boolean }) {
  return (
    <Link className="gcard" href={`/jogo/${game.id}`}>
      <Cover title={game.title} src={game.cover} tilt={tilt} eager={eager} />
      <CardCaption game={game} />
    </Link>
  )
}
