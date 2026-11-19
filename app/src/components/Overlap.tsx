'use client'

import { useId } from 'react'
import { motion } from 'motion/react'
import { useCalm } from '@/lib/motion'

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
