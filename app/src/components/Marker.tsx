'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useCalm } from '@/lib/motion'

// Highlights that appear together are drawn one after the other, in reading order.
const STAGGER = 120
let nextSlot = 0

/**
 * Marca-texto: a mustard highlighter stroke behind a number or short phrase that belongs to both.
 * The stroke is drawn left to right once, the first time it is seen; the text never moves or fades.
 * With reduced motion (or decorative animations off) the stroke is simply there.
 */
export function Marker({ children, variant }: { children: ReactNode; variant?: 'b' | 'c' }) {
  const calm = useCalm()
  const ref = useRef<HTMLSpanElement>(null)
  const [state, setPhase] = useState<'wait' | 'draw' | 'done'>('wait')
  const phase = calm ? 'done' : state
  const [delay, setDelay] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (calm || !node || phase !== 'wait') return
    const start = () => {
      const now = performance.now()
      const at = Math.max(now, nextSlot)
      nextSlot = at + STAGGER
      setDelay(Math.round(at - now))
      setPhase('draw')
    }
    if (typeof IntersectionObserver === 'undefined') {
      start()
      return
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect()
        start()
      }
    }, { threshold: 0.6 })
    io.observe(node)
    return () => io.disconnect()
  }, [calm, phase])

  const cls = ['marker', variant ? `marker--${variant}` : '', phase === 'wait' ? 'marker--wait' : '', phase === 'draw' ? 'marker--draw' : ''].filter(Boolean).join(' ')
  return (
    <span
      ref={ref} className={cls} style={phase === 'draw' ? { ['--delay' as string]: `${delay}ms` } : undefined}
      onAnimationEnd={() => setPhase('done')}
    >
      {children}
    </span>
  )
}
