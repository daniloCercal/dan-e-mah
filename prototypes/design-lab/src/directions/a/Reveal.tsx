import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { art, type Game } from '../../data/games'
import { Billing, gameCredits } from './ui'

export type RevealPhase = 'playing' | 'done'

interface Props {
  game: Game
  phase: RevealPhase
  reduced: boolean
  /** Called when the orchestrated sequence ends or the viewer taps to skip it. */
  onSettle: () => void
  onClose?: () => void
  /** Rendered inside a box instead of over the whole screen (style guide replay). */
  contained?: boolean
  children?: ReactNode
}

/**
 * “Sessão de hoje”. The result is already decided when this mounts; the sequence only stages it:
 * the room darkens, the cover grows into the background, the title rises through a line, the credits fade in.
 */
export default function Reveal({ game, phase, reduced, onSettle, onClose, contained = false, children }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (contained) return
    title.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [contained, game.id])

  // Reduced motion gets a plain cross-fade, so there is nothing to wait for.
  useEffect(() => {
    if (reduced && phase === 'playing') onSettle()
  }, [reduced, phase, onSettle])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (contained) return
    if (event.key === 'Escape' && onClose) {
      onClose()
      return
    }
    if (event.key !== 'Tab' || !root.current) return
    const items = [...root.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const activeEl = document.activeElement
    if (event.shiftKey && (activeEl === first || activeEl === title.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && activeEl === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const mode = reduced ? 'is-fade' : phase === 'playing' ? 'is-playing' : 'is-done'

  return (
    <div
      ref={root}
      className={`reveal ${mode} ${contained ? 'reveal--contained' : ''}`}
      role={contained ? undefined : 'dialog'} aria-modal={contained ? undefined : true} aria-labelledby={contained ? undefined : 'reveal-title'}
      onClick={phase === 'playing' ? onSettle : undefined}
      onKeyDown={onKeyDown}
    >
      <div className="reveal-dark" aria-hidden="true" />
      <img className="reveal-back" src={art(game, 'cover')} alt="" aria-hidden="true" />
      <img className="reveal-art" src={art(game, 'cover')} alt="" width={600} height={900} />
      <div className="reveal-scrim" aria-hidden="true" />

      <div className="reveal-content">
        <h2 id={contained ? undefined : 'reveal-title'} className="reveal-title" tabIndex={-1} ref={title}>
          <span className="sr-only">Sessão de hoje: </span>
          <span className="reveal-mask"><span className="reveal-rise">{game.title}</span></span>
        </h2>
        <div className="reveal-rule" aria-hidden="true" />
        <div className="reveal-credits" onAnimationEnd={(e) => { if (e.target === e.currentTarget) onSettle() }}>
          <Billing
            align="center"
            credits={[
              { role: '', name: 'Sessão de hoje' },
              { role: 'uma escolha de', name: 'Danilo e Maellen' },
              ...gameCredits(game).slice(0, 3),
            ]}
          />
        </div>
        {children && <div className="reveal-actions">{children}</div>}
      </div>
    </div>
  )
}
