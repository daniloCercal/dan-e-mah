import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { formatDate, formatMinutes, isMatch, type Game } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { findGame, lastSession, needsRating, useStore } from '../store'
import { Cover, Icon, Player, StatusTag, tap } from '../ui'

const press = { type: 'spring', stiffness: 500, damping: 30 } as const
const fan = [-3, 2, -1.5, 3, -2.5, 1.5]

function Hand({ matches }: { matches: Game[] }) {
  const rail = useRef<HTMLUListElement>(null)
  const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  return (
    <section className="c-block c-hand" aria-labelledby="c-hand-title">
      <div className="c-wrap c-block__head">
        <div>
          <h2 id="c-hand-title" className="c-h2">Nós dois queremos jogar</h2>
          <p className="c-muted">
            {matches.length === 1 ? 'Uma carta na mão.' : `${matches.length} cartas na mão. Deslize para ver todas.`}
          </p>
        </div>
        <div className="c-hand__arrows">
          <button type="button" className="c-iconbtn" onClick={() => scroll(-1)} aria-label="Cartas anteriores"><Icon name="left" /></button>
          <button type="button" className="c-iconbtn" onClick={() => scroll(1)} aria-label="Próximas cartas"><Icon name="right" /></button>
        </div>
      </div>
      <ul className="c-hand__rail" ref={rail} tabIndex={0} aria-label="Jogos que os dois querem jogar">
        {matches.map((g, i) => (
          <li key={g.id} className="c-hand__item">
            <motion.div whileTap={tap} transition={press}>
              <Link to={`/c/jogo/${g.id}`} className="c-hand__card" style={{ rotate: `${fan[i % fan.length]}deg`, translate: `0 ${i % 2 ? 10 : 0}px` }}>
                <Cover game={g} eager={i < 3} />
              </Link>
            </motion.div>
            <span className="c-hand__title">{g.title}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Home() {
  const { viewer, greeting } = useViewer()
  const store = useStore()
  const matches = store.library.filter(isMatch)
  const pending = store.library.filter((g) => needsRating(g, viewer))
  const recent = [...store.sessions].sort((a, b) => b.date.localeCompare(a.date))
  const nowSession = recent.find((s) => findGame(store, s.gameId)?.shared === 'jogando')
  const now = nowSession ? findGame(store, nowSession.gameId) : store.library.find((g) => g.shared === 'jogando')

  return (
    <>
      <section className="c-wrap c-home">
        <header className="c-home__hello">
          <h1 className="c-h1">{greeting}</h1>
          <p className="c-lead">O que vamos jogar hoje?</p>
        </header>

        {now && (
          <motion.div className="c-now" whileTap={tap} transition={press}>
            <Link to={`/c/jogo/${now.id}`} className="c-now__card">
              <Cover game={now} kind="hero" eager decorative className="c-now__art" />
              <span className="c-now__caption">
                <span className="c-now__text">
                  <span className="c-now__kicker">Continuar de onde paramos</span>
                  <span className="c-now__title">{now.title}</span>
                  <span className="c-now__meta">
                    {nowSession ? `Última sessão em ${formatDate(nowSession.date)}` : 'Ainda sem sessão registrada'}
                  </span>
                </span>
                <span className="c-now__go" aria-hidden="true"><Icon name="right" size={24} /></span>
              </span>
            </Link>
          </motion.div>
        )}

        <Link to="/c/sortear" className="c-token-link">
          <span className="c-token-link__coin" aria-hidden="true"><Icon name="shuffle" size={26} /></span>
          <span className="c-token-link__text">
            <strong>Sortear o jogo de hoje</strong>
            <span>
              <span className="c-num">{matches.length}</span> {matches.length === 1 ? 'carta' : 'cartas'} no baralho
            </span>
          </span>
        </Link>
      </section>

      {matches.length > 0 ? (
        <Hand matches={matches} />
      ) : (
        <section className="c-block">
          <div className="c-wrap c-stack">
            <h2 className="c-h2">Nós dois queremos jogar</h2>
            <p className="c-lead">Nenhuma carta em comum por enquanto. Marquem “quero jogar” nos jogos da biblioteca e eles aparecem aqui.</p>
          </div>
        </section>
      )}

      <div className="c-home__pair">
        {pending.length > 0 && (
          <section className="c-block c-block--coral" aria-labelledby="c-pending-title">
            <div className="c-wrap">
              <h2 id="c-pending-title" className="c-h2">Falta a sua nota</h2>
              <p className="c-home__sub">O placar da dupla só fecha com as duas.</p>
              <ul className="c-pending">
                {pending.slice(0, 3).map((g) => (
                  <li key={g.id}>
                    <Cover game={g} kind="header" decorative />
                    <span className="c-pending__title">{g.title}</span>
                    <Link to={`/c/jogo/${g.id}?avaliar=1`} className="c-btn c-btn--ink" aria-label={`Dar nota para ${g.title}`}>Dar nota</Link>
                  </li>
                ))}
              </ul>
              {pending.length > 3 && (
                <Link to="/c/biblioteca?pref=sem-nota" className="c-link">Ver os {pending.length} sem a sua nota</Link>
              )}
            </div>
          </section>
        )}

        <section className="c-block c-block--surface" aria-labelledby="c-recent-title">
          <div className="c-wrap">
            <div className="c-block__head">
              <h2 id="c-recent-title" className="c-h2">Últimas sessões</h2>
              <Link to="/c/diario" className="c-link">Abrir o diário</Link>
            </div>
            <ul className="c-sessions">
              {recent.slice(0, 3).map((s) => {
                const g = findGame(store, s.gameId)
                if (!g) return null
                return (
                  <li key={s.id}>
                    <Link to={`/c/jogo/${g.id}`} className="c-session">
                      <Cover game={g} kind="header" decorative />
                      <span className="c-session__body">
                        <strong>{g.title}</strong>
                        <span className="c-muted">{formatDate(s.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        <span className="c-session__who">
                          {s.who.map((id) => <Player key={id} id={id} name={false} />)}
                          <StatusTag status={g.shared} />
                        </span>
                      </span>
                      <span className="c-num c-session__time">{formatMinutes(s.minutes)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
            {lastSession(store, now?.id ?? '')?.moment && (
              <p className="c-home__moment">“{lastSession(store, now?.id ?? '')?.moment}”</p>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
