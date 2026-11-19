import { useCallback, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isMatch, pickRandom, taxonomy, type Game } from '../../data/games'
import { usePrefersReducedMotion } from '../../lib/viewer'
import Reveal, { type RevealPhase } from './Reveal'
import { useLibrary } from './store'
import { Chip, PageHead, Poster, base } from './ui'

function narrow(pool: Game[], moods: string[], modes: string[]): Game[] {
  return pool.filter(
    (g) => (!moods.length || moods.some((m) => g.moods.includes(m))) && (!modes.length || modes.some((m) => g.modes.includes(m))),
  )
}

export default function Draw() {
  const library = useLibrary()
  const reduced = usePrefersReducedMotion()
  const location = useLocation()
  const auto = Boolean((location.state as { auto?: boolean } | null)?.auto)

  const matches = library.filter(isMatch)
  // With no match at all, fall back to everything the pair has not finished or dropped.
  const usingMatches = matches.length > 0
  const source = usingMatches ? matches : library.filter((g) => g.shared !== 'zerado' && g.shared !== 'abandonado')

  const [moods, setMoods] = useState<string[]>([])
  const [modes, setModes] = useState<string[]>([])
  const pool = narrow(source, moods, modes)

  // The result is decided here, before any animation starts. The reveal only stages it.
  const [result, setResult] = useState<Game | null>(() => (auto ? pickRandom(source) ?? null : null))
  const [phase, setPhase] = useState<RevealPhase>('playing')
  const [chosen, setChosen] = useState(false)
  const [round, setRound] = useState(0)
  const drawButton = useRef<HTMLButtonElement>(null)

  const settle = useCallback(() => setPhase('done'), [])

  function draw() {
    const next = pickRandom(pool, result ?? undefined)
    if (!next) return
    setResult(next)
    setChosen(false)
    setPhase('playing')
    setRound((r) => r + 1)
  }

  function close() {
    setResult(null)
    setChosen(false)
    requestAnimationFrame(() => drawButton.current?.focus())
  }

  const toggle = (list: string[], set: (next: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const moodOptions = taxonomy.moods.filter((m) => source.some((g) => g.moods.includes(m)))
  const modeOptions = taxonomy.modes.filter((m) => source.some((g) => g.modes.includes(m)))

  return (
    <div className="page draw">
      <PageHead title="O que vamos jogar?" />
      <p className="lede">
        {usingMatches
          ? `O sorteio parte dos ${matches.length} jogos que nós dois queremos. Se a noite pede algo específico, aperte o recorte.`
          : 'Ainda não há jogo que os dois queiram, então o sorteio usa tudo o que não foi zerado nem abandonado.'}
      </p>

      <section className="sec draw-pool" aria-labelledby="draw-pool">
        <h2 id="draw-pool" className="sec-title" aria-live="polite">
          {pool.length === 0 ? 'Nenhum jogo nesse recorte' : `${pool.length} ${pool.length === 1 ? 'jogo concorre' : 'jogos concorrem'}`}
        </h2>
        {pool.length > 0 ? (
          <ul className="strip">
            {pool.map((g) => <li key={g.id}><Poster game={g} /></li>)}
          </ul>
        ) : (
          <p className="quiet">Desmarque um humor ou um modo para o sorteio ter de onde tirar.</p>
        )}
        <div className="draw-go">
          <button type="button" className="btn btn--amber btn--big" onClick={draw} disabled={pool.length === 0} ref={drawButton}>
            Sortear
          </button>
          {(moods.length > 0 || modes.length > 0) && (
            <button type="button" className="link-btn" onClick={() => { setMoods([]); setModes([]) }}>Limpar o recorte</button>
          )}
        </div>
      </section>

      <section className="sec" aria-labelledby="draw-mood">
        <h2 id="draw-mood" className="sec-title">Apertar pelo humor da noite</h2>
        <div className="chips">
          {moodOptions.map((m) => <Chip key={m} pressed={moods.includes(m)} onClick={() => toggle(moods, setMoods, m)}>{m}</Chip>)}
        </div>
      </section>

      <section className="sec" aria-labelledby="draw-mode">
        <h2 id="draw-mode" className="sec-title">Ou pelo modo de jogo</h2>
        <div className="chips">
          {modeOptions.map((m) => <Chip key={m} pressed={modes.includes(m)} onClick={() => toggle(modes, setModes, m)}>{m}</Chip>)}
        </div>
      </section>


      {result && (
        <Reveal key={`${result.id}-${round}`} game={result} phase={phase} reduced={reduced} onSettle={settle} onClose={close}>
          {chosen ? (
            <>
              <p className="reveal-said" role="status">Combinado. Boa sessão, vocês dois.</p>
              <Link className="btn btn--light" to={`${base}/jogo/${result.id}`} state={{ from: `${base}/sortear` }}>Abrir a página do jogo</Link>
              <button type="button" className="btn btn--ghost" onClick={close}>Fechar</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--amber" onClick={() => setChosen(true)}>É esse</button>
              <button type="button" className="btn btn--line" onClick={draw} disabled={pool.length < 2}>Sortear de novo</button>
              <button type="button" className="btn btn--ghost" onClick={close}>Mudar o recorte</button>
            </>
          )}
        </Reveal>
      )}
    </div>
  )
}
