import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { isMatch, pickRandom, taxonomy, type Game } from '../../../data/games'
import { B, useClub } from '../store'
import { useCalm } from '../lib/profile'
import { Cover, Stamp } from '../components/Marks'
import { IconCheck, PairGlyph } from '../components/icons'
import { PackReveal } from './PackReveal'

type Mode = 'fila' | 'pacote'
const MODE_KEY = 'dan-mah:sorteio'
function readMode(): Mode {
  // `?jeito=pacote` / `?jeito=fila` pick the way of drawing for this visit, without saving it.
  const forced = new URLSearchParams(window.location.search).get('jeito')
  if (forced === 'pacote' || forced === 'fila') return forced
  try {
    return localStorage.getItem(MODE_KEY) === 'pacote' ? 'pacote' : 'fila'
  } catch {
    return 'fila'
  }
}

/** How many covers pass before the chosen one, and how long the slide takes. More covers and a long, slow brake build suspense. */
const WIN = 16
const SLIDE = 4.2
const GAP = 14

/** The strip: WIN covers pass, the next is the chosen one. Fillers never include the winner twice in a row. */
function buildStrip(pool: Game[], picked: Game): Game[] {
  const others = pool.filter((g) => g.id !== picked.id)
  const fill = others.length ? others : [picked]
  const strip: Game[] = []
  for (let i = 0; i < WIN + 2; i++) strip.push(i === WIN ? picked : fill[(i * 3 + 1) % fill.length])
  return strip
}

interface RevealProps {
  pool: Game[]
  picked: Game
  /** false shows the end state at once (skipped, reduced motion). */
  animate: boolean
  onLanded?: () => void
}

/**
 * The matches slide fast across the table and brake onto the chosen game; the others fade,
 * the chosen one gets the hard shadow and both marks land on it. It only stages a result decided before.
 */
export function DrawReveal({ pool, picked, animate, onLanded }: RevealProps) {
  const stage = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [landed, setLanded] = useState(!animate)
  const strip = useMemo(() => buildStrip(pool, picked), [pool, picked])
  const d = picked.personal.danilo.wants
  const m = picked.personal.maellen.wants

  useLayoutEffect(() => {
    const node = stage.current
    if (!node) return
    const measure = () => setWidth(node.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  const card = width >= 560 ? 190 : 148
  const step = card + GAP
  const centre = (width - card) / 2
  const from = centre - step
  const to = centre - WIN * step
  const land = () => {
    if (landed) return
    setLanded(true)
    onLanded?.()
  }

  return (
    <div className={landed ? 'strip-stage strip-stage--landed' : 'strip-stage'} ref={stage} style={{ ['--card' as string]: `${card}px` }}>
      {width > 0 && (
        <motion.ul
          className="strip" aria-hidden="true"
          initial={animate ? { x: from } : false}
          animate={{ x: to }}
          transition={animate && !landed ? { duration: SLIDE, ease: [0.1, 0.62, 0.12, 1] as [number, number, number, number] } : { duration: 0 }}
          onAnimationComplete={land}
        >
          {strip.map((g, i) => (
            <li key={i} className={i === WIN ? 'strip-card strip-card--win' : 'strip-card'}>
              <Cover game={g} eager />
              {i === WIN && landed && (
                <span className="strip-marks">
                  {d && <Stamp person="danilo" press={animate} delay={200} size={46} />}
                  {m && <Stamp person="maellen" press={animate} delay={370} size={46} />}
                </span>
              )}
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  )
}

export default function Draw() {
  const { games } = useClub()
  const calm = useCalm()
  const [onlyMatches, setOnlyMatches] = useState(true)
  const [moods, setMoods] = useState<string[]>([])
  const [modes, setModes] = useState<string[]>([])
  const [picked, setPicked] = useState<Game>()
  const [frozenPool, setFrozenPool] = useState<Game[]>([])
  const [round, setRound] = useState(0)
  const [revealing, setRevealing] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [chosen, setChosen] = useState(false)
  const guard = useRef<number | undefined>(undefined)
  const [mode, setModeState] = useState<Mode>(readMode)
  const setMode = (next: Mode) => {
    setModeState(next)
    try {
      localStorage.setItem(MODE_KEY, next)
    } catch {
      /* storage unavailable: lasts for this visit only */
    }
  }
  const pack = mode === 'pacote'

  const pool = useMemo(
    () =>
      games.filter((g) => {
        if (onlyMatches ? !isMatch(g) : g.shared === 'zerado' || g.shared === 'abandonado') return false
        if (moods.length && !moods.some((t) => g.moods.includes(t))) return false
        if (modes.length && !modes.some((t) => g.modes.includes(t))) return false
        return true
      }),
    [games, onlyMatches, moods, modes],
  )

  useEffect(() => () => window.clearTimeout(guard.current), [])

  const draw = () => {
    // The result is decided here, before any animation starts.
    const next = pickRandom(pool, picked)
    if (!next) return
    window.clearTimeout(guard.current)
    setPicked(next)
    setFrozenPool(pool)
    setRound((r) => r + 1)
    setChosen(false)
    setSkipped(false)
    setRevealing(!calm)
    // Safety net: the buttons always come back, even if the animation is interrupted.
    // The pack waits for the person to tear it, so it has no timer: "Pular" is its way out.
    if (!calm && !pack) guard.current = window.setTimeout(() => setRevealing(false), SLIDE * 1000 + 700)
  }
  const skip = () => {
    if (!revealing) return
    window.clearTimeout(guard.current)
    setSkipped(true)
    setRevealing(false)
  }
  const flip = (list: string[], set: (v: string[]) => void, tag: string) => {
    set(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag])
  }
  const both = picked ? picked.personal.danilo.wants && picked.personal.maellen.wants : false
  const show = picked && !revealing

  return (
    <div className="page draw">
      <h1 className="h1">O que vamos jogar hoje?</h1>
      <p className="draw-lede">
        {onlyMatches ? 'Sorteando entre os jogos que nós dois queremos.' : 'Sorteando entre tudo que ainda não zeramos.'}{' '}
        <strong>{pool.length} {pool.length === 1 ? 'jogo' : 'jogos'}</strong> no sorteio.
      </p>

      <div className="draw-cols">
        <div className="draw-main">
          <div className={pack ? 'draw-stage draw-stage--pack' : 'draw-stage'} onPointerDown={pack ? undefined : skip}>
            <p className="sr-only" role="status" aria-live="polite">{picked ? `Sorteado: ${picked.title}` : ''}</p>
            {picked ? (
              pack ? (
                <PackReveal key={`p${round}-${skipped}`} picked={picked} animate={!skipped && !calm} onLanded={() => setRevealing(false)} />
              ) : (
                <DrawReveal key={`${round}-${skipped}`} pool={frozenPool} picked={picked} animate={!skipped && !calm} onLanded={() => setRevealing(false)} />
              )
            ) : (
              <div className="draw-wait">
                <PairGlyph size={56} />
                <p>{pool.length ? 'A mesa está vazia. Sorteia aí.' : 'Nenhum jogo com esses filtros. A Mahdame é exigente.'}</p>
              </div>
            )}
            {revealing && !pack && <p className="draw-skip">Toque para pular</p>}
          </div>

          <div className="draw-under" aria-busy={revealing}>
            {revealing && pack && (
              <p className="draw-skip-row"><button type="button" className="link" onClick={skip}>Pular a abertura</button></p>
            )}
            {show && picked && (
              <div className={skipped || calm ? 'draw-result' : 'draw-result draw-result--rise'} key={round}>
                <h2 className="draw-title">{picked.title}</h2>
                <p className="quiet">{both ? 'Os dois querem. Está decidido.' : [...picked.moods].slice(0, 2).join(', ') || picked.genres.join(', ')}</p>
              </div>
            )}
            {chosen && picked ? (
              <div className="draw-done" role="status">
                <p className="draw-done-title">Fechado. Hoje é dia de {picked.title}.</p>
                <div className="editor-actions">
                  <Link className="btn btn--ink" to={`${B}/jogo/${picked.id}`}>Abrir o jogo</Link>
                  <Link className="btn btn--plain" to={`${B}/jogo/${picked.id}?sessao=1`}>Registrar sessão</Link>
                </div>
              </div>
            ) : (
              <div className={show && !skipped && !calm ? 'draw-actions draw-actions--rise' : 'draw-actions'} key={`a${round}`}>
                {show && (
                  <button type="button" className="btn btn--both btn--big" onClick={() => setChosen(true)}>
                    <IconCheck size={20} />
                    É esse
                  </button>
                )}
                {!revealing && (
                  <button type="button" className={picked ? 'btn btn--plain btn--big' : 'btn btn--both btn--big'} onClick={draw} disabled={!pool.length}>
                    {picked ? 'Sortear de novo' : `Sortear entre ${pool.length === 1 ? 'o único' : `os ${pool.length}`}`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="draw-side">
          <div className="draw-narrow">
            <fieldset className="field draw-mode">
              <legend className="editor-label">Jeito de sortear</legend>
              <div className="wall-seg">
                <label><input className="sr-only" type="radio" name="jeito" checked={!pack} onChange={() => setMode('fila')} /><span>Fila</span></label>
                <label><input className="sr-only" type="radio" name="jeito" checked={pack} onChange={() => setMode('pacote')} /><span>Pacote</span></label>
              </div>
              <p className="quiet">{pack ? 'Um pacote fechado: você rasga e a última carta é o jogo de hoje.' : 'As capas deslizam pela mesa e param no jogo de hoje.'}</p>
            </fieldset>
            <label className="switch">
              <input type="checkbox" checked={onlyMatches} onChange={(e) => setOnlyMatches(e.target.checked)} />
              <span className="switch-ui" aria-hidden="true" />
              Só o que nós dois queremos
            </label>
            <fieldset className="field">
              <legend className="editor-label">Humor de hoje</legend>
              <div className="chips">
                {taxonomy.moods.map((t) => (
                  <button key={t} type="button" className={moods.includes(t) ? 'chip chip--on' : 'chip'} aria-pressed={moods.includes(t)} onClick={() => flip(moods, setMoods, t)}>
                    {moods.includes(t) && <IconCheck size={16} />}
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="field">
              <legend className="editor-label">Modo de jogo</legend>
              <div className="chips">
                {taxonomy.modes.map((t) => (
                  <button key={t} type="button" className={modes.includes(t) ? 'chip chip--on' : 'chip'} aria-pressed={modes.includes(t)} onClick={() => flip(modes, setModes, t)}>
                    {modes.includes(t) && <IconCheck size={16} />}
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  )
}
