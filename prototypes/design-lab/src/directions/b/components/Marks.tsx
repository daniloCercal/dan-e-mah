import { useEffect, useRef, useState } from 'react'
import { art, people, statusLabels, type Game, type PersonId, type Status } from '../../../data/games'
import { finishedBy, useClub } from '../store'
import { nameOf, useProfile } from '../lib/profile'
import { GameLink } from './GameLink'
import { PairGlyph } from './icons'

/**
 * A person's avatar: the profile photo inside a ring in their colour, or the initial on their colour.
 * With a photo, a small initial badge stays on the corner, so it is never photo or colour alone.
 */
export function Mark({ person, size = 28, named = true }: { person: PersonId; size?: number; named?: boolean }) {
  const { photos } = useProfile()
  const [failed, setFailed] = useState(false)
  const photo = size >= 24 && !failed ? photos[person] : undefined
  useEffect(() => setFailed(false), [photos, person])
  return (
    <span className={photo ? 'mark mark--photo' : 'mark'} data-person={person} style={{ ['--s' as string]: `${size}px` }}>
      {photo ? (
        <>
          <img src={photo} alt="" width={size} height={size} onError={() => setFailed(true)} />
          <span className="mark-badge" aria-hidden="true">{people[person].initial}</span>
        </>
      ) : (
        <span aria-hidden="true">{people[person].initial}</span>
      )}
      {named && <span className="sr-only">{nameOf(person)}</span>}
    </span>
  )
}

/** Who took part: one mark, or both overlapping. */
export function WhoMarks({ who, size = 28 }: { who: PersonId[]; size?: number }) {
  return (
    <span className={who.length === 2 ? 'who who--both' : 'who'}>
      {(['danilo', 'maellen'] as const).filter((p) => who.includes(p)).map((p) => <Mark key={p} person={p} size={size} />)}
    </span>
  )
}

/** Rubber-stamp version of the mark, used when a person finishes a game. Always the ink initial, never the photo. */
export function Stamp({ person, press = false, delay = 0, size = 52 }: { person: PersonId; press?: boolean; delay?: number; size?: number }) {
  return (
    <span
      className={press ? 'stamp stamp--press' : 'stamp'} data-person={person}
      style={{ ['--s' as string]: `${size}px`, animationDelay: delay ? `${delay}ms` : undefined }}
    >
      <span aria-hidden="true">{people[person].initial}</span>
      <span className="sr-only">Carimbo de {nameOf(person)}</span>
    </span>
  )
}

export function StatusTag({ status, owner }: { status: Status; owner?: PersonId | 'both' }) {
  return (
    <span className="tag" data-status={status} data-owner={owner}>
      {owner === 'both' && <PairGlyph size={12} />}
      {owner && owner !== 'both' && <Mark person={owner} size={18} />}
      {statusLabels[status]}
    </span>
  )
}

interface CoverProps {
  game: Pick<Game, 'steamId' | 'title'> & { id?: string }
  /** Slight alternate tilt for short horizontal lists. */
  tilt?: 'a' | 'b'
  eager?: boolean
  /** Set when the title is not printed next to the cover. */
  describe?: boolean
  /** Image to use instead of the stored one (a cover being chosen in a form). */
  src?: string
}

export function Cover({ game, tilt, eager, describe, src }: CoverProps) {
  const { extraOf } = useClub()
  const [failed, setFailed] = useState(false)
  const [arrived, setArrived] = useState(false)
  const img = useRef<HTMLImageElement>(null)
  const url = src ?? extraOf(game.id).cover ?? (game.steamId ? art(game, 'cover') : undefined)
  const missing = failed || !url
  useEffect(() => {
    setFailed(false)
    setArrived(false)
    // A cached image may already be complete before React attaches onLoad.
    if (img.current?.complete && img.current.naturalWidth > 0) setArrived(true)
  }, [url])
  return (
    <span className="cover" data-tilt={tilt}>
      {missing ? (
        <span className="cover-missing">
          <PairGlyph size={22} />
          <span className="cover-missing-title">{game.title}</span>
          <span className="cover-missing-note">Sem capa por enquanto</span>
        </span>
      ) : (
        <img
          ref={img} data-arrived={arrived || undefined} onLoad={() => setArrived(true)}
          src={url} alt={describe ? game.title : ''} width={600} height={900}
          loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)}
        />
      )}
    </span>
  )
}

/** Caption under a cover: both stamps when finished, otherwise the pair's status. */
export function CardCaption({ game }: { game: Game }) {
  const d = finishedBy(game, 'danilo')
  const m = finishedBy(game, 'maellen')
  return (
    <>
      <span className="gcard-title">{game.title}</span>
      {d || m ? (
        <span className="gcard-stamps">
          {d && <Stamp person="danilo" size={24} />}
          {m && <Stamp person="maellen" size={24} />}
          <span>{d && m ? 'Zeramos juntos' : `${nameOf(d ? 'danilo' : 'maellen')} zerou`}</span>
        </span>
      ) : (
        <span className="gcard-meta">{statusLabels[game.shared]}</span>
      )}
    </>
  )
}

/** Cover card used in the library grid and the short lists. */
export function GameCard({ game, tilt, eager, slot = 'card' }: { game: Game; tilt?: 'a' | 'b'; eager?: boolean; slot?: string }) {
  return (
    <GameLink className="gcard" id={game.id} slot={slot}>
      <Cover game={game} tilt={tilt} eager={eager} />
      <CardCaption game={game} />
    </GameLink>
  )
}
