// Pieces of the signature moment ("Baralho da noite"): the shuffling deck, the colour flood and the card that flips out.
import { motion } from 'motion/react'
import type { Game } from '../../data/games'
import { Cover, Icon } from './ui'

const restRotate = [0, -4, 5, -7, 8, -10]

interface DeckProps {
  cards: Game[]
  tick: number
  /** Seconds between shuffles; shrinks the longer the token is held. */
  beat: number
  shuffling: boolean
}

/** A stack of covers. Each tick sends the top card out sideways and back under the pile. */
export function Deck({ cards, tick, beat, shuffling }: DeckProps) {
  const n = cards.length
  const dir = tick % 2 ? 1 : -1
  return (
    <div className="c-deck" aria-hidden="true">
      {cards.map((g, i) => {
        const p = (((i - tick) % n) + n) % n
        const rest = { x: p * 5, y: p * -5, rotate: restRotate[p % restRotate.length] }
        const swinging = shuffling && n > 1 && p === n - 1
        return (
          <motion.div
            key={g.id} className="c-deck__card" style={{ zIndex: n - p }} initial={false}
            animate={swinging ? { x: [0, dir * 104, rest.x], y: [0, -18, rest.y], rotate: [0, dir * 16, rest.rotate] } : rest}
            transition={swinging ? { duration: beat * 1.7, ease: 'easeInOut' } : { type: 'spring', stiffness: 520, damping: 30 }}
          >
            <Cover game={g} eager decorative />
          </motion.div>
        )
      })}
    </div>
  )
}

interface FloodProps {
  x: number
  y: number
  tone: 'coral' | 'menta'
  animate: boolean
  slow?: boolean
}

/** A flat block of colour that grows from where the finger was. */
export function Flood({ x, y, tone, animate, slow }: FloodProps) {
  const at = `${Math.round(x)}px ${Math.round(y)}px`
  return (
    <motion.div
      className={`c-flood c-flood--${tone}`} aria-hidden="true"
      initial={animate ? { clipPath: `circle(0px at ${at})` } : false} animate={{ clipPath: `circle(2600px at ${at})` }}
      transition={{ duration: slow ? 1.1 : 0.7, ease: [0.3, 0.7, 0.2, 1] }}
    />
  )
}

export type RevealMode = 'long' | 'short' | 'none'

/** The drawn card: leaves the pile face down, flips in the air and lands on a spring. */
export function RevealCard({ game, mode }: { game: Game; mode: RevealMode }) {
  const long = mode === 'long'
  return (
    <div className="c-reveal">
      <motion.div
        className="c-reveal__card"
        initial={mode === 'none' ? false : { rotateY: 180, y: 90, scale: 0.55 }}
        animate={{ rotateY: 0, y: 0, scale: 1 }}
        transition={{
          rotateY: { type: 'spring', stiffness: long ? 60 : 150, damping: long ? 11 : 16, delay: long ? 0.12 : 0 },
          y: { type: 'spring', stiffness: long ? 110 : 220, damping: long ? 9 : 16, velocity: long ? -1400 : -700 },
          scale: { type: 'spring', stiffness: long ? 130 : 260, damping: 13 },
        }}
      >
        <div className="c-reveal__face"><Cover game={game} eager /></div>
        <div className="c-reveal__face c-reveal__back" aria-hidden="true"><Icon name="shuffle" size={44} /></div>
      </motion.div>
    </div>
  )
}

/** Title whose width axis opens up as it arrives. */
export function RevealTitle({ title, mode }: { title: string; mode: RevealMode }) {
  return (
    <motion.h2
      className="c-h2 c-reveal__title"
      initial={mode === 'none' ? false : { fontStretch: '55%', opacity: 0 }} animate={{ fontStretch: '112%', opacity: 1 }}
      transition={{
        fontStretch: { type: 'spring', stiffness: 170, damping: 12, delay: mode === 'long' ? 0.75 : 0.3 },
        opacity: { duration: 0.2, delay: mode === 'long' ? 0.75 : 0.3 },
      }}
    >
      {title}
    </motion.h2>
  )
}
