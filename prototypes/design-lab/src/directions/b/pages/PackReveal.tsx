import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion } from 'motion/react'
import type { Game } from '../../../data/games'
import faceSvg from '../assets/rosto-anim.svg?raw'
import { Cover, Stamp } from '../components/Marks'
import { PairGlyph } from '../components/icons'

interface PackProps {
  picked: Game
  /** false shows the end state at once (skipped, reduced motion). */
  animate: boolean
  onLanded?: () => void
}

type Phase = 'ready' | 'open' | 'done'
const ease = [0.2, 0.8, 0.2, 1] as [number, number, number, number]

function CardBack() {
  return (
    <span className="pack-back">
      <PairGlyph size={64} />
    </span>
  )
}

/**
 * The draw as a sealed pack: tear the top along the dotted line (drag, tap or Enter), the cards come out,
 * two fly off and the last one turns over — that is tonight's game. The game was picked before any of this.
 */
export function PackReveal({ picked, animate, onLanded }: PackProps) {
  const [phase, setPhase] = useState<Phase>(animate ? 'ready' : 'done')
  const [pull, setPull] = useState(0)
  const timer = useRef<number | undefined>(undefined)
  const drag = useRef<{ x: number; width: number; moved: boolean } | null>(null)
  const swallowClick = useRef(false)
  const d = picked.personal.danilo.wants
  const m = picked.personal.maellen.wants

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const open = () => {
    if (phase !== 'ready') return
    setPhase('open')
    setPull(1)
    timer.current = window.setTimeout(() => {
      setPhase('done')
      onLanded?.()
    }, 1800)
  }

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== 'ready') return
    drag.current = { x: e.clientX, width: e.currentTarget.getBoundingClientRect().width, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = drag.current
    if (!g) return
    const dx = Math.abs(e.clientX - g.x)
    if (dx > 6) g.moved = true
    setPull(Math.min(1, dx / (g.width * 0.75)))
  }
  const up = () => {
    const g = drag.current
    drag.current = null
    if (!g) return
    if (pull >= 0.6) {
      swallowClick.current = true
      open()
    } else if (g.moved) {
      // A short drag is not a tear: the flap settles back and the click that follows is ignored.
      swallowClick.current = true
      setPull(0)
    }
  }
  const click = () => {
    if (swallowClick.current) {
      swallowClick.current = false
      return
    }
    open()
  }

  const opened = phase !== 'ready'
  const instant = !animate

  return (
    <div className={`pack-stage pack-stage--${phase}`}>
      <div className="pack-cards" aria-hidden="true">
        {animate && phase !== 'done' && (
          <>
            <motion.div className="pack-card" initial={false} animate={opened ? { x: -250, rotate: -22, opacity: 0 } : { x: 0, rotate: -3, opacity: 1 }} transition={{ delay: 0.8, duration: 0.32, ease }}>
              <CardBack />
            </motion.div>
            <motion.div className="pack-card" initial={false} animate={opened ? { x: 250, rotate: 22, opacity: 0 } : { x: 0, rotate: 3, opacity: 1 }} transition={{ delay: 1.0, duration: 0.32, ease }}>
              <CardBack />
            </motion.div>
          </>
        )}
        <motion.div className="pack-card pack-card--win" initial={false} animate={opened ? { y: 0 } : { y: 26 }} transition={instant ? { duration: 0 } : { delay: 0.3, duration: 0.4, ease }}>
          <motion.div className="pack-flip" initial={instant ? false : { rotateY: 180 }} animate={{ rotateY: opened ? 0 : 180 }} transition={instant ? { duration: 0 } : { delay: 1.25, duration: 0.5, ease }}>
            <span className="pack-face pack-face--front"><Cover game={picked} eager /></span>
            <span className="pack-face pack-face--back"><CardBack /></span>
          </motion.div>
          {phase === 'done' && (
            <span className="strip-marks">
              {d && <Stamp person="danilo" press={animate} delay={120} size={46} />}
              {m && <Stamp person="maellen" press={animate} delay={290} size={46} />}
            </span>
          )}
        </motion.div>
      </div>

      {phase !== 'done' && (
        <motion.div
          className="pack"
          initial={{ y: -24, opacity: 0, rotate: -5 }}
          animate={opened ? { y: 300, opacity: 0, rotate: -2 } : { y: 0, opacity: 1, rotate: -2 }}
          transition={opened ? { delay: 0.4, duration: 0.45, ease: [0.5, 0, 0.9, 0.4] as [number, number, number, number] } : { duration: 0.35, ease }}
        >
          <motion.button
            type="button" className="pack-top" aria-label="Abrir o pacote" disabled={opened}
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={click}
            animate={opened ? { x: 70, y: -110, rotate: 28, opacity: 0 } : { x: 0, y: -pull * 8, rotate: pull * 9, opacity: 1 }}
            transition={opened ? { duration: 0.45, ease } : { duration: drag.current ? 0 : 0.2 }}
          >
            <span className="pack-notch" aria-hidden="true" />
          </motion.button>
          <span className="pack-tear" aria-hidden="true"><span style={{ width: `${pull * 100}%` }} /></span>
          <button type="button" className="pack-body" tabIndex={-1} aria-hidden="true" disabled={opened} onClick={click}>
            <span className="pack-face-mark" dangerouslySetInnerHTML={{ __html: faceSvg }} />
            <span className="pack-name">Dan & Mah</span>
            <span className="pack-sub">O jogo de hoje</span>
          </button>
        </motion.div>
      )}

      {phase === 'ready' && <p className="pack-hint">Arraste na linha pontilhada ou toque no pacote</p>}
    </div>
  )
}
