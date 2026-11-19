import { useLayoutEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { B } from '../store'
import { canTransition, isActiveCover, tagCover, withViewTransition } from '../lib/transitions'

interface Props {
  id: string
  /** Where on the page this link lives, so the way back lands on the same cover. */
  slot: string
  className?: string
  query?: string
  children: ReactNode
}

/** Link to a game page whose cover travels to the page header (when the browser supports it). */
export function GameLink({ id, slot, className, query = '', children }: Props) {
  const navigate = useNavigate()
  const ref = useRef<HTMLAnchorElement>(null)
  const to = `${B}/jogo/${id}${query}`

  // Coming back: the cover this trip started from receives the shared element again.
  useLayoutEffect(() => {
    if (isActiveCover(id, slot)) ref.current?.querySelector('.cover')?.setAttribute('data-vt', 'cover')
  }, [id, slot])

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (!canTransition()) return
    e.preventDefault()
    tagCover(e.currentTarget, id, slot)
    withViewTransition(() => navigate(to, { state: { fromCover: true } }))
  }

  return (
    <Link ref={ref} className={className} to={to} state={{ fromCover: true }} onClick={onClick}>
      {children}
    </Link>
  )
}
