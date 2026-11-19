import { useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { art, statusLabels, type Game, type Status } from '../../data/games'
import { usePrefersReducedMotion } from '../../lib/viewer'

export const base = '/a'

type IconName =
  | 'home' | 'library' | 'plus' | 'diary' | 'pair' | 'search' | 'filters' | 'grid' | 'list'
  | 'close' | 'back' | 'check' | 'chevron'

const paths: Record<IconName, ReactNode> = {
  home: <path d="M4 11.2 12 4l8 7.2V20h-5.5v-5.5h-5V20H4z" />,
  library: <path d="M5 4h4v16H5zM11 4h4v16h-4zM17.2 6.2l2.9-.8 3 13.6-2.9.8z" transform="translate(-1.5 0)" />,
  plus: <path d="M12 5v14M5 12h14" />,
  diary: <path d="M6 4h12v16H6zM9.5 9h5M9.5 12.5h5" />,
  pair: (
    <>
      <circle cx="8.5" cy="9" r="3.2" />
      <circle cx="15.5" cy="9" r="3.2" />
      <path d="M3 19.5c.6-3 2.7-4.6 5.5-4.6 1.4 0 2.6.4 3.5 1.1.9-.7 2.1-1.1 3.5-1.1 2.8 0 4.9 1.6 5.5 4.6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m15.5 15.5 4.5 4.5" />
    </>
  ),
  filters: <path d="M4 7h9M17 7h3M4 17h3M11 17h9M15 4.5v5M9 14.5v5" />,
  grid: <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" />,
  list: <path d="M5 7h14M5 12h14M5 17h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chevron: <path d="m7 9.5 5 5 5-5" />,
}

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    >
      {paths[name]}
    </svg>
  )
}

/** A 2:3 poster. Falls back to a typeset title card when the art is missing or fails to load. */
export function Poster({
  game, eager = false, shared = false, decorative = false,
}: {
  game: Pick<Game, 'steamId' | 'title'>
  eager?: boolean
  /** Marks this poster as the landing end of the cover → details transition. */
  shared?: boolean
  decorative?: boolean
}) {
  const [failed, setFailed] = useState(!game.steamId)
  const style: CSSProperties | undefined = shared ? { viewTransitionName: 'a-poster' } : undefined
  if (failed) {
    return (
      <span className="poster poster--blank" data-poster style={style} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : game.title} aria-hidden={decorative || undefined}>
        <span className="poster-blank-title">{game.title}</span>
        <span className="poster-blank-note">Sem capa</span>
      </span>
    )
  }
  return (
    <img
      className="poster" data-poster style={style} src={art(game, 'cover')} alt={decorative ? '' : game.title}
      width={600} height={900} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)}
    />
  )
}

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown }

/** Click handler for links to a game page: carries the tapped cover across with the View Transitions API. */
export function useOpenGame() {
  const navigate = useNavigate()
  const location = useLocation()
  const reduced = usePrefersReducedMotion()
  return (game: Pick<Game, 'id'>, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const to = `${base}/jogo/${game.id}`
    const state = { from: location.pathname + location.search }
    const cover = event.currentTarget.querySelector<HTMLElement>('[data-poster]')
    const doc = document as ViewTransitionDocument
    if (reduced || !cover || typeof doc.startViewTransition !== 'function') {
      navigate(to, { state })
      return
    }
    cover.style.viewTransitionName = 'a-poster'
    doc.startViewTransition(() => {
      navigate(to, { state, flushSync: true })
    })
  }
}

export function useFrom() {
  const location = useLocation()
  return { from: location.pathname + location.search }
}

export function StatusTag({ status }: { status: Status }) {
  return <span className={`status status--${status}`}>{statusLabels[status]}</span>
}

/** Poster with title and one quiet line of metadata below. Nothing is ever printed over the art. */
export function PosterCard({ game, eager, note }: { game: Game; eager?: boolean; note?: ReactNode }) {
  const open = useOpenGame()
  const state = useFrom()
  return (
    <article className="card">
      <Link className="card-link" to={`${base}/jogo/${game.id}`} state={state} onClick={(e) => open(game, e)}>
        <Poster game={game} eager={eager} decorative />
        <h3 className="card-title">{game.title}</h3>
      </Link>
      <p className="card-meta">
        <span>{game.year}</span>
        {note ?? <StatusTag status={game.shared} />}
      </p>
    </article>
  )
}

export interface Credit {
  role: string
  name: string
}

/** The billing block: facts set like the credits at the foot of a film poster. Once per page. */
export function Billing({ credits, align = 'start', className = '' }: { credits: Credit[]; align?: 'start' | 'center'; className?: string }) {
  return (
    <p className={`billing billing--${align} ${className}`}>
      {credits.map((c) => (
        <span className="billing-credit" key={c.role + c.name}>
          <span className="billing-role">{c.role}</span>{' '}
          {c.name.split(/( e | de |, )/).map((part, i) =>
            i % 2 ? <span className="billing-role" key={i}>{part}</span> : <span className="billing-name" key={i}>{part}</span>,
          )}{' '}
        </span>
      ))}
    </p>
  )
}

export function gameCredits(game: Game, extra: Credit[] = []): Credit[] {
  const credits: Credit[] = []
  if (game.developer) credits.push({ role: 'um jogo de', name: game.developer })
  if (game.year) credits.push({ role: 'em cartaz desde', name: String(game.year) })
  if (game.genres.length) credits.push({ role: 'gênero', name: game.genres.join(' e ') })
  return [...credits, ...extra]
}

export function Chip({
  pressed, onClick, children,
}: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="chip" aria-pressed={pressed} onClick={onClick}>
      {pressed && <Icon name="check" size={16} />}
      {children}
    </button>
  )
}

export function PageHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <h1 className="page-title">{title}</h1>
      {children}
    </header>
  )
}
