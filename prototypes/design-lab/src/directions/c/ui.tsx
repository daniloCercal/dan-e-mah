// Small shared pieces: icons, cover with fallback, player badge, status tag, score numerals, chip.
import { useEffect, useState, type ReactNode } from 'react'
import { art, formatRating, people, statusLabels, type ArtKind, type Game, type PersonId, type Status } from '../../data/games'

const icons = {
  home: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
  cards: <><rect x="4" y="7" width="10" height="13" rx="2" /><path d="M9 4h9a2 2 0 0 1 2 2v11" /></>,
  diary: <><path d="M6 4h11a1 1 0 0 1 1 1v15H7a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1z" /><path d="M9 9h6M9 13h4" /></>,
  duo: <><circle cx="8.5" cy="12" r="4.5" /><circle cx="15.5" cy="12" r="4.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  sliders: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  flip: <><path d="M4 11a8 8 0 0 1 14-4.3L20 9" /><path d="M20 4v5h-5" /><path d="M20 13a8 8 0 0 1-14 4.3L4 15" /><path d="M4 20v-5h5" /></>,
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  list: <path d="M4 7h16M4 12h16M4 17h16" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  left: <path d="m14 6-6 6 6 6" />,
  right: <path d="m10 6 6 6-6 6" />,
  shuffle: <><path d="M4 7h3c5 0 5 10 10 10h3M4 17h3c1.6 0 2.7-1 3.6-2.4M20 7h-3c-1.6 0-2.7 1-3.6 2.4" /><path d="m17 4 3 3-3 3M17 14l3 3-3 3" /></>,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>,
}

export type IconName = keyof typeof icons

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="c-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    >
      {icons[name]}
    </svg>
  )
}

const fallbackTones = ['coral', 'menta', 'raised', 'ficha'] as const

function toneFor(title: string) {
  let h = 0
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) % 997
  return fallbackTones[h % fallbackTones.length]
}

interface CoverProps {
  game: Pick<Game, 'steamId' | 'title'>
  kind?: ArtKind
  eager?: boolean
  /** Decorative when the title is already written next to it. */
  decorative?: boolean
  className?: string
}

const dims: Record<ArtKind, [number, number]> = { cover: [600, 900], hero: [1920, 620], header: [460, 215] }

/** Game art with a flat-colour fallback that carries the title when the file is missing or fails. */
export function Cover({ game, kind = 'cover', eager, decorative, className = '' }: CoverProps) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [game.steamId, kind])
  const [w, h] = dims[kind]
  if (failed || !game.steamId) {
    return (
      <div
        className={`c-cover c-cover--${kind} c-cover--missing c-cover--${toneFor(game.title)} ${className}`}
        role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : game.title}
        aria-hidden={decorative || undefined}
      >
        <span>{game.title}</span>
      </div>
    )
  }
  return (
    <img
      className={`c-cover c-cover--${kind} ${className}`} src={art(game, kind)} alt={decorative ? '' : game.title}
      width={w} height={h} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)}
    />
  )
}

/** Initial disc + name. Colour never stands alone: the initial is always there. */
export function Player({ id, name = true, size }: { id: PersonId; name?: boolean; size?: 'lg' }) {
  const p = people[id]
  return (
    <span className={`c-player c-player--${id} ${size ? 'c-player--lg' : ''}`}>
      <span className="c-player__disc" aria-hidden={name || undefined} aria-label={name ? undefined : p.name} role={name ? undefined : 'img'}>
        {p.initial}
      </span>
      {name && <span className="c-player__name">{p.name}</span>}
    </span>
  )
}

export function StatusTag({ status }: { status: Status }) {
  return <span className={`c-status c-status--${status}`}>{statusLabels[status]}</span>
}

/** Martian Mono numerals — scoreboard, counters and timers only. */
export function Score({ value, className = '' }: { value: number | undefined; className?: string }) {
  return (
    <span className={`c-num ${className}`} aria-label={value === undefined ? 'sem nota' : undefined}>
      {formatRating(value)}
    </span>
  )
}

interface ChipProps {
  pressed: boolean
  onClick: () => void
  children: ReactNode
  disabled?: boolean
}

/** Arcade button: sits up when off, stays visibly down when on. */
export function Chip({ pressed, onClick, children, disabled }: ChipProps) {
  return (
    <button type="button" className="c-chip" aria-pressed={pressed} onClick={onClick} disabled={disabled}>
      {pressed && <Icon name="check" size={16} />}
      {children}
    </button>
  )
}

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatch(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return match
}

export const spring = { type: 'spring', stiffness: 420, damping: 28 } as const
export const tap = { scale: 0.97 }
