/**
 * Cover -> game page as a shared element, using the View Transitions API.
 * The router commits asynchronously, so the transition waits for the shell to report the commit.
 */
import { isCalm } from './profile'

let resolveCommit: (() => void) | null = null
let active: { id: string; slot: string } | null = null

type Doc = Document & { startViewTransition?: (update: () => Promise<void>) => unknown }

export function canTransition(): boolean {
  return typeof (document as Doc).startViewTransition === 'function' && !isCalm()
}

/** Called by the shell in a layout effect every time the route changes. */
export function routeCommitted() {
  resolveCommit?.()
  resolveCommit = null
}

export function withViewTransition(go: () => void) {
  const doc = document as Doc
  if (!canTransition() || !doc.startViewTransition) {
    go()
    return
  }
  doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        resolveCommit = resolve
        go()
        // Never hold the screen if the route did not change.
        window.setTimeout(resolve, 350)
      }),
  )
}

/** Marks the tapped cover (and only it) as the shared element. */
export function tagCover(link: HTMLElement, id: string, slot: string) {
  document.querySelectorAll('.dir-b [data-vt]').forEach((el) => el.removeAttribute('data-vt'))
  link.querySelector('.cover')?.setAttribute('data-vt', 'cover')
  active = { id, slot }
}

/** True for the cover the last transition started from, so going back lands on it. */
export function isActiveCover(id: string, slot: string): boolean {
  return active?.id === id && active.slot === slot
}
