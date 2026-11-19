'use client'

import { useId } from 'react'
import { motion } from 'motion/react'
import { useCalm } from '@/lib/motion'
import { formatRating, initialOf, type Person } from '@/lib/people'
import { useNameOf } from '@/lib/member'

function useClipId(): string {
  return `b${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}

function useSlide() {
  const reduced = useCalm()
  const slide = reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 300, damping: 24 }
  return { slide, reduced }
}

interface OverlapProps {
  danilo: boolean
  maellen: boolean
  /** Height in px. */
  size?: number
  label: string
}

/** Match state: each circle fills when that person wants it; with both, they slide together and the overlap fills. */
export function Overlap({ danilo, maellen, size = 56, label }: OverlapProps) {
  const clip = useClipId()
  const { slide, reduced } = useSlide()
  const together = danilo && maellen
  const lx = together ? 38 : 24
  const rx = together ? 62 : 76
  const move = (cx: number) => ({ initial: false as const, animate: { cx }, transition: slide })
  return (
    <svg className="overlap" viewBox="0 0 100 48" width={(size * 100) / 48} height={size} role="img" aria-label={label}>
      <clipPath id={clip}>
        <motion.circle cy={24} r={20} {...move(lx)} />
      </clipPath>
      <motion.circle cy={24} r={20} className={danilo ? 'ov-d' : 'ov-off'} {...move(lx)} />
      <motion.circle cy={24} r={20} className={maellen ? 'ov-m' : 'ov-off'} {...move(rx)} />
      <motion.circle
        cy={24} r={20} className="ov-both" clipPath={`url(#${clip})`}
        initial={false} animate={{ cx: rx, opacity: together ? 1 : 0 }}
        transition={{ cx: slide, opacity: { duration: reduced ? 0 : 0.18, delay: together && !reduced ? 0.16 : 0 } }}
      />
      <motion.circle cy={24} r={20} className={danilo ? 'ov-line' : 'ov-line ov-dash'} {...move(lx)} />
      <motion.circle cy={24} r={20} className={maellen ? 'ov-line' : 'ov-line ov-dash'} {...move(rx)} />
      <motion.text y={30} textAnchor="middle" className={danilo ? 'ov-ini' : 'ov-ini ov-ini-off'} initial={false} animate={{ x: lx - (together ? 7 : 0) }} transition={slide}>D</motion.text>
      <motion.text y={30} textAnchor="middle" className={maellen ? 'ov-ini' : 'ov-ini ov-ini-off'} initial={false} animate={{ x: rx + (together ? 7 : 0) }} transition={slide}>M</motion.text>
    </svg>
  )
}

const W = 320
const PAD = 26
const R = 20
const CY = 42
const unit = (W - PAD * 2) / 10
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

interface RatingLineProps {
  danilo?: number | null
  maellen?: number | null
}

/**
 * Two circles on a 0–10 line. Far apart when they disagree, overlapping when they agree.
 * The mustard overlap only exists when both rated.
 */
export function RatingLine({ danilo, maellen }: RatingLineProps) {
  const defaultName = useNameOf()
  const clip = useClipId()
  const { slide } = useSlide()
  const both = danilo != null && maellen != null
  const pos: Partial<Record<Person, number>> = {}
  let touching = false
  let dist = 0
  let lowFirst: Person = 'danilo'

  if (both) {
    lowFirst = maellen < danilo ? 'maellen' : 'danilo'
    dist = Math.max(15, Math.abs(danilo - maellen) * unit)
    const mid = clamp(PAD + ((danilo + maellen) / 2) * unit, R + 2 + dist / 2, W - R - 2 - dist / 2)
    touching = dist < R * 2
    pos[lowFirst] = mid - dist / 2
    pos[lowFirst === 'danilo' ? 'maellen' : 'danilo'] = mid + dist / 2
  } else {
    if (danilo != null) pos.danilo = PAD + danilo * unit
    if (maellen != null) pos.maellen = PAD + maellen * unit
  }

  const values: Record<Person, number | null | undefined> = { danilo, maellen }
  const order: Person[] = lowFirst === 'danilo' ? ['danilo', 'maellen'] : ['maellen', 'danilo']
  const shown = order.filter((p) => pos[p] !== undefined)
  const first = pos[order[0]]
  const second = pos[order[1]]
  const describe = shown.map((p) => `${defaultName(p)}: ${formatRating(values[p] ?? null)}`).join(', ')

  return (
    <svg className="rline" viewBox={`0 0 ${W} 88`} role="img" aria-label={describe ? `Notas de 0 a 10. ${describe}.` : 'Ninguém deu nota ainda.'}>
      <line x1={PAD} x2={W - PAD} y1={CY} y2={CY} className="rl-track" />
      {[0, 5, 10].map((n) => (
        <g key={n}>
          <line x1={PAD + n * unit} x2={PAD + n * unit} y1={CY + R + 4} y2={CY + R + 10} className="rl-tick" />
          <text x={PAD + n * unit} y={CY + R + 25} textAnchor="middle" className="rl-num">{n}</text>
        </g>
      ))}
      {both && first !== undefined && second !== undefined && !touching && (
        <line x1={first + R} x2={second - R} y1={CY} y2={CY} className="rl-gap" />
      )}
      {both && first !== undefined && second !== undefined && (
        <clipPath id={clip}>
          <motion.circle cy={CY} r={R} initial={false} animate={{ cx: first }} transition={slide} />
        </clipPath>
      )}
      {shown.map((p) => (
        <motion.circle key={p} cy={CY} r={R} className={p === 'danilo' ? 'ov-d' : 'ov-m'} initial={false} animate={{ cx: pos[p] }} transition={slide} />
      ))}
      {both && second !== undefined && (
        <motion.circle cy={CY} r={R} className="ov-both" clipPath={`url(#${clip})`} initial={false} animate={{ cx: second }} transition={slide} />
      )}
      {shown.map((p, i) => {
        const x = pos[p] ?? 0
        const push = touching ? Math.min(11, (R * 2 - dist) / 2) : 0
        const out = i === 0 ? -push : push
        return (
          <g key={p}>
            <motion.circle cy={CY} r={R} className="ov-line" initial={false} animate={{ cx: x }} transition={slide} />
            <motion.text y={CY + 6} textAnchor="middle" className="ov-ini" initial={false} animate={{ x: x + out }} transition={slide}>
              {initialOf(p)}
            </motion.text>
            <motion.text
              y={14} className="rl-val" textAnchor={touching ? (i === 0 ? 'end' : 'start') : 'middle'}
              initial={false} animate={{ x: touching ? x + (i === 0 ? 4 : -4) : x }} transition={slide}
            >
              {formatRating(values[p] ?? null)}
            </motion.text>
          </g>
        )
      })}
    </svg>
  )
}
