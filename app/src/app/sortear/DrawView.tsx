'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import type { GameSummary } from '@/lib/data/games'
import type { Tag } from '@/lib/filters'
import { drawGame } from '@/app/actions/draw'
import { setPrefs } from '@/app/actions/prefs'
import { useCalm } from '@/lib/motion'
import { isMatch } from '@/lib/people'
import { useToast } from '@/components/Toast'
import { Cover } from '@/components/Cover'
import { Stamp } from '@/components/Marks'
import { IconCheck, PairGlyph } from '@/components/icons'
import { PackReveal } from './PackReveal'

type Mode = 'fila' | 'pacote'

/** How many covers pass before the chosen one, and how long the slide takes. More covers and a long, slow brake build suspense. */
const WIN = 16
const SLIDE = 4.2
const GAP = 14

/** The strip: WIN covers pass, the next is the chosen one. Fillers never include the winner twice in a row. */
function buildStrip(pool: GameSummary[], picked: GameSummary): GameSummary[] {
  const others = pool.filter((g) => g.id !== picked.id)
  const fill = others.length ? others : [picked]
  const strip: GameSummary[] = []
  for (let i = 0; i < WIN + 2; i++) strip.push(i === WIN ? picked : fill[(i * 3 + 1) % fill.length])
  return strip
}

/**
 * The games slide fast across the table and brake onto the chosen one; the chosen one gets the hard shadow
 * and both marks land on it. It only stages a result decided before, on the server.
 */
function DrawReveal({ pool, picked, animate, onLanded }: { pool: GameSummary[]; picked: GameSummary; animate: boolean; onLanded?: () => void }) {
  const stage = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [landed, setLanded] = useState(!animate)
  const strip = useMemo(() => buildStrip(pool, picked), [pool, picked])
  const d = picked.marks.danilo.wants
  const m = picked.marks.maellen.wants

  useEffect(() => {
    const node = stage.current
    if (!node) return
    const ro = new ResizeObserver(() => setWidth(node.clientWidth))
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
              <Cover title={g.title} src={g.cover} eager />
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

export function DrawView({ games, tags, initialMode }: { games: GameSummary[]; tags: Tag[]; initialMode: Mode }) {
  const calm = useCalm()
  const toast = useToast()
  const [onlyMatches, setOnlyMatches] = useState(true)
  const [moods, setMoods] = useState<string[]>([])
  const [modes, setModes] = useState<string[]>([])
  const [picked, setPicked] = useState<GameSummary>()
  const [frozenPool, setFrozenPool] = useState<GameSummary[]>([])
  const [round, setRound] = useState(0)
  const [asking, setAsking] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [chosen, setChosen] = useState(false)
  const [mode, setMode] = useState<Mode>(initialMode)
  const guard = useRef<number | undefined>(undefined)
  const pack = mode === 'pacote'

  const moodTags = tags.filter((t) => t.kind === 'humor')
  const modeTags = tags.filter((t) => t.kind === 'modo')
  const ids = useMemo(() => {
    const idOf = (kind: Tag['kind'], slugs: string[]) => tags.filter((t) => t.kind === kind && slugs.includes(t.slug)).map((t) => t.id)
    return { moods: idOf('humor', moods), modes: idOf('modo', modes) }
  }, [tags, moods, modes])

  // Same rule as the database function (draw_candidates), only to show the count; the pick itself is made by the database.
  const pool = useMemo(
    () => games.filter((g) => {
      if (g.archived || g.shared === 'zerado' || g.shared === 'abandonado') return false
      if (onlyMatches && !isMatch(g)) return false
      if (moods.length && !g.tagIds.some((t) => ids.moods.includes(t))) return false
      if (modes.length && !g.tagIds.some((t) => ids.modes.includes(t))) return false
      return true
    }),
    [games, onlyMatches, moods, modes, ids],
  )

  useEffect(() => () => window.clearTimeout(guard.current), [])

  const changeMode = (next: Mode) => {
    setMode(next)
    void setPrefs({ drawMode: next })
  }

  const draw = async () => {
    if (asking) return
    setAsking(true)
    // The result is decided here, on the server, before any animation starts.
    const res = await drawGame({ onlyMatches, moods, modes, exceptId: picked?.id ?? null }).catch(() => null)
    setAsking(false)
    if (!res?.ok) return toast.notify(res ? res.error : 'Sem conexão com o servidor. Confira a conexão e tente de novo.')
    const next = games.find((g) => g.id === res.pickedId)
    if (!next) return toast.notify('Nenhum jogo para sortear com esses filtros.')
    window.clearTimeout(guard.current)
    setPicked(next)
    setFrozenPool(games.filter((g) => res.poolIds.includes(g.id)))
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
  const flip = (list: string[], set: (v: string[]) => void, slug: string) => {
    set(list.includes(slug) ? list.filter((t) => t !== slug) : [...list, slug])
  }
  const both = picked ? picked.marks.danilo.wants && picked.marks.maellen.wants : false
  const show = picked && !revealing
  const pickedTags = picked ? tags.filter((t) => picked.tagIds.includes(t.id)) : []
  const sub = pickedTags.filter((t) => t.kind === 'humor').slice(0, 2).map((t) => t.name).join(', ') || pickedTags.filter((t) => t.kind === 'genero').map((t) => t.name).join(', ')

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
                <p>{pool.length ? 'A mesa está vazia. Sorteia aí.' : 'Nenhum jogo com esses filtros. Assim não sobra nada para sortear.'}</p>
              </div>
            )}
            {revealing && !pack && <p className="draw-skip">Toque para pular</p>}
          </div>

          <div className="draw-under" aria-busy={revealing || asking}>
            {revealing && pack && (
              <p className="draw-skip-row"><button type="button" className="link" onClick={skip}>Pular a abertura</button></p>
            )}
            {show && picked && (
              <div className={skipped || calm ? 'draw-result' : 'draw-result draw-result--rise'} key={round}>
                <h2 className="draw-title">{picked.title}</h2>
                <p className="quiet">{both ? 'Os dois querem. Está decidido.' : sub}</p>
              </div>
            )}
            {chosen && picked ? (
              <div className="draw-done" role="status">
                <p className="draw-done-title">Fechado. Hoje é dia de {picked.title}.</p>
                <div className="editor-actions">
                  <Link className="btn btn--ink" href={`/jogo/${picked.id}`}>Abrir o jogo</Link>
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
                  <button type="button" className={picked ? 'btn btn--plain btn--big' : 'btn btn--both btn--big'} onClick={() => void draw()} disabled={!pool.length || asking}>
                    {asking ? 'Sorteando' : picked ? 'Sortear de novo' : `Sortear entre ${pool.length === 1 ? 'o único' : `os ${pool.length}`}`}
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
                <label><input className="sr-only" type="radio" name="jeito" checked={!pack} onChange={() => changeMode('fila')} /><span>Fila</span></label>
                <label><input className="sr-only" type="radio" name="jeito" checked={pack} onChange={() => changeMode('pacote')} /><span>Pacote</span></label>
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
                {moodTags.map((t) => (
                  <button key={t.id} type="button" className={moods.includes(t.slug) ? 'chip chip--on' : 'chip'} aria-pressed={moods.includes(t.slug)} onClick={() => flip(moods, setMoods, t.slug)}>
                    {moods.includes(t.slug) && <IconCheck size={16} />}
                    {t.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="field">
              <legend className="editor-label">Modo de jogo</legend>
              <div className="chips">
                {modeTags.map((t) => (
                  <button key={t.id} type="button" className={modes.includes(t.slug) ? 'chip chip--on' : 'chip'} aria-pressed={modes.includes(t.slug)} onClick={() => flip(modes, setModes, t.slug)}>
                    {modes.includes(t.slug) && <IconCheck size={16} />}
                    {t.name}
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
