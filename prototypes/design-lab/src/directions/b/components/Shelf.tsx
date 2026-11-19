import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

function Arrow({ flip }: { flip?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

/**
 * Horizontal list of covers. Touch scrolls it by swiping; where there is a pointer,
 * side arrows page through it and each arrow hides at its end of the list.
 */
export function Shelf({ label, children }: { label: string; children: ReactNode }) {
  const list = useRef<HTMLUListElement>(null)
  const [ends, setEnds] = useState({ start: true, end: false })

  const measure = useCallback(() => {
    const el = list.current
    if (!el) return
    setEnds({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 })
  }, [])

  useEffect(() => {
    measure()
    const el = list.current
    if (!el) return
    el.addEventListener('scroll', measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [measure])

  // Click-and-drag with a mouse. Touch already scrolls natively, so it is left alone.
  useEffect(() => {
    const el = list.current
    if (!el) return
    let startX = 0
    let startLeft = 0
    let active = false
    let moved = false

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      active = true
      moved = false
      startX = e.clientX
      startLeft = el.scrollLeft
    }
    const move = (e: PointerEvent) => {
      if (!active) return
      const dx = e.clientX - startX
      if (!moved && Math.abs(dx) < 6) return
      if (!moved) {
        moved = true
        el.classList.add('is-dragging')
      }
      el.scrollLeft = startLeft - dx
    }
    const up = () => {
      if (!active) return
      active = false
      el.classList.remove('is-dragging')
    }
    // A drag must not open the game the cursor happened to be over.
    const click = (e: MouseEvent) => {
      if (!moved) return
      e.preventDefault()
      e.stopPropagation()
      moved = false
    }
    const dragstart = (e: DragEvent) => e.preventDefault()

    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    el.addEventListener('click', click, true)
    el.addEventListener('dragstart', dragstart)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      el.removeEventListener('click', click, true)
      el.removeEventListener('dragstart', dragstart)
    }
  }, [])

  const page = (dir: 1 | -1) => {
    const el = list.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <div className="shelf-wrap">
      <button type="button" className="shelf-arrow shelf-arrow--prev" aria-label="Ver os jogos anteriores" hidden={ends.start} onClick={() => page(-1)}>
        <Arrow flip />
      </button>
      <ul className="shelf" aria-label={label} ref={list}>
        {children}
      </ul>
      <button type="button" className="shelf-arrow shelf-arrow--next" aria-label="Ver os próximos jogos" hidden={ends.end} onClick={() => page(1)}>
        <Arrow />
      </button>
    </div>
  )
}
