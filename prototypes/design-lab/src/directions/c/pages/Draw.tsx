import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { isMatch, pickRandom, taxonomy, type Game } from '../../../data/games'
import { usePrefersReducedMotion } from '../../../lib/viewer'
import { Deck, Flood, RevealCard, RevealTitle } from '../DrawParts'
import { useStore } from '../store'
import { Chip, Icon } from '../ui'

type Phase = 'idle' | 'holding' | 'reveal' | 'result' | 'chosen'
type Point = { x: number; y: number }
const HOLD_MS = 350

export default function Draw() {
  const store = useStore()
  const reduced = usePrefersReducedMotion()
  const [source, setSource] = useState<'match' | 'all'>('match')
  const [moods, setMoods] = useState<string[]>([])
  const [modes, setModes] = useState<string[]>([])
  const [narrowing, setNarrowing] = useState(false)

  const pool = useMemo(
    () =>
      store.library.filter(
        (g) =>
          (source === 'match' ? isMatch(g) : !['zerado', 'abandonado'].includes(g.shared)) &&
          (!moods.length || moods.some((m) => g.moods.includes(m))) &&
          (!modes.length || modes.some((m) => g.modes.includes(m))),
      ),
    [store.library, source, moods, modes],
  )

  const [phase, setPhase] = useState<Phase>('idle')
  const [picked, setPicked] = useState<Game | null>(null)
  const [long, setLong] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [origin, setOrigin] = useState<Point>({ x: 0, y: 0 })
  const [round, setRound] = useState(0)
  const [tick, setTick] = useState(0)
  const pending = useRef<Game | undefined>(undefined)
  const holdStart = useRef(0)
  const revealAt = useRef(0)
  const beat = useRef(0.26)
  const timer = useRef(0)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  // While the token is held the pile shuffles, faster the longer the hold.
  useEffect(() => {
    if (phase !== 'holding') return
    let t = 0
    const loop = () => {
      const held = performance.now() - holdStart.current
      const delay = Math.max(70, 260 - held * 0.11)
      beat.current = delay / 1000
      setTick((n) => n + 1)
      t = window.setTimeout(loop, delay)
    }
    loop()
    return () => clearTimeout(t)
  }, [phase])

  function pointIn(e: { clientX: number; clientY: number } | null, el?: Element): Point {
    const r = stage.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    if (e && (e.clientX || e.clientY)) return { x: e.clientX - r.left, y: e.clientY - r.top }
    const b = el?.getBoundingClientRect()
    return b ? { x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top } : { x: r.width / 2, y: r.height / 2 }
  }

  /** The result is settled here, before anything moves. */
  function decide() {
    pending.current = pickRandom(pool, picked ?? undefined)
  }

  function reveal(isLong: boolean, at: Point) {
    const next = pending.current
    if (!next) return
    clearTimeout(timer.current)
    setPicked(next)
    setOrigin(at)
    setRound((r) => r + 1)
    setSkipped(false)
    if (reduced) return setPhase('result')
    setLong(isLong)
    setPhase('reveal')
    revealAt.current = performance.now()
    timer.current = window.setTimeout(() => setPhase('result'), isLong ? 1700 : 850)
  }

  function skip() {
    if (phase !== 'reveal' || performance.now() - revealAt.current < 220) return
    clearTimeout(timer.current)
    setSkipped(true)
    setPhase('result')
  }

  function resetPool(fn: () => void) {
    fn()
    clearTimeout(timer.current)
    setPhase('idle')
  }

  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const narrowed = moods.length + modes.length
  const showing = phase === 'reveal' || phase === 'result' || phase === 'chosen'
  const mode = reduced || skipped || phase === 'chosen' ? 'none' : long ? 'long' : 'short'
  const why = picked ? [isMatch(picked) ? 'Os dois querem jogar' : null, ...picked.moods.filter((m) => moods.includes(m))].filter(Boolean).join(', ') : ''

  return (
    <div className="c-draw">
      <section className="c-wrap c-page c-draw__top">
        <h1 className="c-h1">O que vamos jogar?</h1>
        <div className="c-draw__pool">
          <p>
            <span className="c-num c-draw__n">{pool.length}</span> {pool.length === 1 ? 'carta' : 'cartas'} no baralho
            <span className="c-muted">{source === 'match' ? ', só o que os dois querem' : ', tudo o que não zeramos'}{narrowed ? ` com ${narrowed} ${narrowed === 1 ? 'recorte' : 'recortes'}` : ''}.</span>
          </p>
          <button type="button" className="c-btn c-btn--quiet" aria-expanded={narrowing} aria-controls="c-draw-narrow" onClick={() => setNarrowing(!narrowing)}>
            <Icon name="sliders" size={18} /> {narrowing ? 'Fechar recortes' : 'Recortar o baralho'}
          </button>
        </div>
        {narrowing && (
          <div id="c-draw-narrow" className="c-draw__narrow">
            <div className="c-field" role="group" aria-labelledby="c-d-src">
              <span className="c-label" id="c-d-src">De onde sai</span>
              <div className="c-seg">
                <button type="button" aria-pressed={source === 'match'} onClick={() => resetPool(() => setSource('match'))}>Nós dois queremos</button>
                <button type="button" aria-pressed={source === 'all'} onClick={() => resetPool(() => setSource('all'))}>Tudo sem zerar</button>
              </div>
            </div>
            <div className="c-field" role="group" aria-labelledby="c-d-mood">
              <span className="c-label" id="c-d-mood">Humor ou ocasião</span>
              <div className="c-chips">
                {taxonomy.moods.map((m) => <Chip key={m} pressed={moods.includes(m)} onClick={() => resetPool(() => setMoods(toggleIn(moods, m)))}>{m}</Chip>)}
              </div>
            </div>
            <div className="c-field" role="group" aria-labelledby="c-d-mode">
              <span className="c-label" id="c-d-mode">Modo de jogo</span>
              <div className="c-chips">
                {taxonomy.modes.map((m) => <Chip key={m} pressed={modes.includes(m)} onClick={() => resetPool(() => setModes(toggleIn(modes, m)))}>{m}</Chip>)}
              </div>
            </div>
          </div>
        )}
      </section>

      <div ref={stage} className={`c-stage c-stage--${phase}`} onClick={skip}>
        {showing && picked && (
          <Flood key={`${round}-${phase === 'chosen'}`} x={origin.x} y={origin.y} tone={phase === 'chosen' ? 'menta' : 'coral'} animate={!reduced && !skipped} slow={long && phase !== 'chosen'} />
        )}
        <p className="c-sr" role="status">{phase === 'result' && picked ? `Saiu ${picked.title}` : ''}</p>

        {!showing && (
          <div className="c-stage__inner">
            {pool.length > 0 ? (
              <>
                <Deck cards={pool.slice(0, 6)} tick={tick} beat={beat.current} shuffling={phase === 'holding'} />
                <button
                  type="button" className="c-token" data-held={phase === 'holding' || undefined}
                  onPointerDown={(e) => {
                    if (reduced || e.button !== 0) return
                    e.currentTarget.setPointerCapture(e.pointerId)
                    decide()
                    holdStart.current = performance.now()
                    setPhase('holding')
                  }}
                  onPointerUp={(e) => { if (phase === 'holding') reveal(performance.now() - holdStart.current > HOLD_MS, pointIn(e, e.currentTarget)) }}
                  onPointerCancel={() => { if (phase === 'holding') setPhase('idle') }}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={(e) => {
                    // Keyboard activation (and every activation under reduced motion) takes the short path.
                    if (e.detail !== 0 && !reduced) return
                    decide()
                    reveal(false, pointIn(null, e.currentTarget))
                  }}
                >
                  <motion.span
                    className="c-token__label" animate={{ fontStretch: phase === 'holding' ? '138%' : '100%' }}
                    transition={phase === 'holding' ? { duration: 1.6, ease: 'easeOut' } : { type: 'spring', stiffness: 400, damping: 18 }}
                  >
                    Sortear
                  </motion.span>
                </button>
                <p className="c-stage__hint">
                  {reduced ? 'Toque para tirar uma carta.' : 'Segure para embaralhar e solte para tirar a carta. Um toque também serve.'}
                </p>
              </>
            ) : (
              <div className="c-empty">
                <h2 className="c-h2">Baralho vazio</h2>
                <p className="c-lead">Nenhum jogo passa por esses recortes.</p>
                <button type="button" className="c-btn c-btn--primary" onClick={() => { setMoods([]); setModes([]) }}>Tirar os recortes</button>
              </div>
            )}
          </div>
        )}

        {showing && picked && (
          <div className="c-stage__inner c-stage__inner--result">
            <RevealCard key={`${round}-${skipped}`} game={picked} mode={mode} />
            <div className="c-stage__text">
              {phase === 'chosen' ? (
                <h2 className="c-h2 c-reveal__title">Fechado. Hoje é dia de {picked.title}.</h2>
              ) : (
                <RevealTitle key={`${round}-${skipped}`} title={picked.title} mode={mode} />
              )}
              {phase === 'result' && why && <p>{why}.</p>}
              {phase === 'reveal' && (
                <button type="button" className="c-link" onClick={(e) => { e.stopPropagation(); clearTimeout(timer.current); setSkipped(true); setPhase('result') }}>Pular animação</button>
              )}
              {phase === 'result' && (
                <div className="c-stage__actions">
                  <button
                    type="button" className="c-btn c-btn--primary c-btn--big"
                    onClick={(e) => { setOrigin(pointIn(e, e.currentTarget)); setSkipped(false); setLong(false); setPhase('chosen') }}
                  >
                    É esse
                  </button>
                  <button type="button" className="c-btn c-btn--onlight" disabled={pool.length < 2} onClick={(e) => { decide(); reveal(false, pointIn(e, e.currentTarget)) }}>
                    <Icon name="shuffle" size={18} /> Sortear de novo
                  </button>
                </div>
              )}
              {phase === 'chosen' && (
                <div className="c-stage__actions">
                  <Link to={`/c/jogo/${picked.id}`} className="c-btn c-btn--ink">Abrir o jogo</Link>
                  <button type="button" className="c-btn c-btn--onlight" onClick={() => setPhase('idle')}>Mudar de ideia</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
