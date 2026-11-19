'use client'

import { useEffect, useState } from 'react'
import { useMascot } from '@/lib/mascot'
import { useCalm } from '@/lib/motion'
import { Mascot } from './Mascot'

export type Moment = 'appear' | 'float' | 'giggle' | 'cheer' | 'peek' | 'load' | 'startle'

/** Moments already played in this visit, for the ones that should only happen on the first screen. */
const played = new Set<string>()

interface Props {
  moment: Moment
  size?: number
  /** Plays only the first time in a visit (the first paint of the app), not on every return to the screen. */
  once?: string
  /** Sits on the top edge of the card it is placed in, like a sticker. */
  sticker?: boolean
  /** For peeking: line up with the left edge of a left-aligned box instead of the middle. */
  edge?: 'start'
}

/**
 * The signed-in member's own mascot playing one movement, once, when it appears on screen. The movement itself lives in mascot.css
 * (`a-<name>` on an ancestor); here the class is withheld when the member asked for calm, so nothing plays or moves.
 * The device's reduced-motion setting is honoured by the stylesheet itself.
 */
export function MascotMoment({ moment, size = 64, once, sticker, edge }: Props) {
  const calm = useCalm()
  const { id } = useMascot()
  const [skip] = useState(() => (once ? played.has(once) : false))
  useEffect(() => {
    if (once) played.add(once)
  }, [once])
  const play = !calm && !skip
  const cls = ['moment', moment === 'peek' && 'moment--peek', sticker && 'moment--sticker', edge === 'start' && 'moment--start', play && `a-${moment}`].filter(Boolean).join(' ')
  return (
    <span className={cls} style={{ ['--s' as string]: `${size}px` }} aria-hidden="true">
      <Mascot id={id} size={size} />
    </span>
  )
}
