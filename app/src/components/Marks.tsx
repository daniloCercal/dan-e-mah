'use client'

import { useState } from 'react'
import { initialOf, statusLabels, isFinished, type Person } from '@/lib/people'
import { useMember, usePersonName } from '@/lib/member'
import type { GameSummary } from '@/lib/data/games'
import { Cover } from './Cover'
import { GameLink } from './GameLink'

/**
 * A person's avatar: the profile photo inside a ring in their colour, or the initial on their colour.
 * With a photo, a small initial badge stays on the corner, so it is never photo or colour alone.
 */
export function Mark({ person, size = 28, named = true }: { person: Person; size?: number; named?: boolean }) {
  const member = useMember()
  const name = usePersonName(person)
  const url = size >= 24 ? member?.photos[person] ?? null : null
  const [failed, setFailed] = useState<string | null>(null)
  const photo = url && failed !== url ? url : null
  return (
    <span className={photo ? 'mark mark--photo' : 'mark'} data-person={person} style={{ ['--s' as string]: `${size}px` }}>
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- a small signed address; next/image would proxy it for nothing */}
          <img src={photo} alt="" width={size} height={size} onError={() => setFailed(photo)} />
          <span className="mark-badge" aria-hidden="true">{initialOf(person)}</span>
        </>
      ) : (
        <span aria-hidden="true">{initialOf(person)}</span>
      )}
      {named && <span className="sr-only">{name}</span>}
    </span>
  )
}

/** Rubber-stamp version of the mark, used when a person finishes a game. */
export function Stamp({ person, press = false, delay = 0, size = 52 }: { person: Person; press?: boolean; delay?: number; size?: number }) {
  const name = usePersonName(person)
  return (
    <span className={press ? 'stamp stamp--press' : 'stamp'} data-person={person}
      style={{ ['--s' as string]: `${size}px`, animationDelay: delay ? `${delay}ms` : undefined }}
    >
      <span aria-hidden="true">{initialOf(person)}</span>
      <span className="sr-only">Carimbo de {name}</span>
    </span>
  )
}

export function CardCaption({ game }: { game: Pick<GameSummary, 'title' | 'shared' | 'marks'> }) {
  const dName = usePersonName('danilo')
  const mName = usePersonName('maellen')
  const d = isFinished(game.marks.danilo.status)
  const m = isFinished(game.marks.maellen.status)
  return (
    <>
      <span className="gcard-title">{game.title}</span>
      {d || m ? (
        <span className="gcard-stamps">
          {d && <Stamp person="danilo" size={24} />}
          {m && <Stamp person="maellen" size={24} />}
          <span>{d && m ? 'Zeramos juntos' : `${d ? dName : mName} zerou`}</span>
        </span>
      ) : (
        <span className="gcard-meta">{statusLabels[game.shared]}</span>
      )}
    </>
  )
}

/** Cover card used in the library grid and the short lists. */
export function GameCard({ game, tilt, eager, slot = 'card' }: { game: GameSummary; tilt?: 'a' | 'b'; eager?: boolean; slot?: string }) {
  return (
    <GameLink className="gcard" id={game.id} slot={slot}>
      <Cover title={game.title} src={game.cover} tilt={tilt} eager={eager} />
      <CardCaption game={game} />
    </GameLink>
  )
}

/** Who took part: one mark, or both overlapping. */
export function WhoMarks({ who, size = 28 }: { who: Person[]; size?: number }) {
  return (
    <span className={who.length === 2 ? 'who who--both' : 'who'}>
      {(['danilo', 'maellen'] as const).filter((p) => who.includes(p)).map((p) => <Mark key={p} person={p} size={size} />)}
    </span>
  )
}
