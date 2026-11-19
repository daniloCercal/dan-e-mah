import { useState } from 'react'
import { Link } from 'react-router-dom'
import { art, formatDate, formatMinutes, isMatch, type Game, type Status } from '../../data/games'
import { useViewer } from '../../lib/viewer'
import { useLibrary, useSessions } from './store'
import { SessionEntry } from './Sessions'
import { Poster, PosterCard, StatusTag, base, useFrom, useOpenGame } from './ui'

const played: Status[] = ['zerado', 'abandonado', 'jogando', 'pausado']
const finished: Status[] = ['zerado', 'abandonado']

export default function Home() {
  const { viewer, greeting } = useViewer()
  const library = useLibrary()
  const sessions = useSessions()
  const byId = new Map(library.map((g) => [g.id, g]))

  const playing = library.filter((g) => g.shared === 'jogando')
  const lastPlayingSession = sessions.find((s) => byId.get(s.gameId)?.shared === 'jogando')
  const current = (lastPlayingSession && byId.get(lastPlayingSession.gameId)) ?? playing[0]
  const currentSession = current ? sessions.find((s) => s.gameId === current.id) : undefined

  const matches = library.filter(isMatch)
  const unrated = library
    .filter((g) => !g.personal[viewer].review && played.includes(g.personal[viewer].status))
    .sort((a, b) => Number(finished.includes(b.personal[viewer].status)) - Number(finished.includes(a.personal[viewer].status)))
    .slice(0, 3)

  return (
    <div className="home">
      <NowPlaying greeting={greeting} game={current} lastDate={currentSession?.date} lastMinutes={currentSession?.minutes} />

      <div className="home-grid">
        <div className="home-main">
          <section className="tonight" aria-labelledby="tonight-title">
            <div>
              <h2 id="tonight-title" className="tonight-title">O que vamos jogar hoje?</h2>
              <p className="quiet">
                {matches.length
                  ? `${matches.length} ${matches.length === 1 ? 'jogo que nós dois queremos' : 'jogos que nós dois queremos'}. Um deles pode ser a sessão desta noite.`
                  : 'Ainda não há um jogo que os dois queiram. O sorteio usa a biblioteca inteira.'}
              </p>
            </div>
            <Link className="btn btn--amber" to={`${base}/sortear`} state={{ auto: true }}>Sortear</Link>
          </section>

          <section className="block" aria-labelledby="matches-title">
            <div className="block-head">
              <h2 id="matches-title" className="block-title">Nós dois queremos jogar</h2>
              {matches.length > 0 && <Link className="more" to={`${base}/biblioteca?pref=match`}>Ver os {matches.length}</Link>}
            </div>
            {matches.length ? (
              <ul className="reel" tabIndex={0} aria-label="Jogos que nós dois queremos, role para o lado">
                {matches.map((g, i) => (
                  <li key={g.id}><PosterCard game={g} eager={i < 3} /></li>
                ))}
              </ul>
            ) : (
              <p className="quiet">Quando os dois marcarem “quero jogar” no mesmo jogo, ele aparece aqui.</p>
            )}
          </section>
        </div>

        <div className="home-side">
          {unrated.length > 0 && (
            <section className="block" aria-labelledby="unrated-title">
              <div className="block-head">
                <h2 id="unrated-title" className="block-title">Falta a sua nota</h2>
              </div>
              <ul className="rows">
                {unrated.map((g) => <UnratedRow key={g.id} game={g} status={g.personal[viewer].status} />)}
              </ul>
            </section>
          )}

          <section className="block" aria-labelledby="sessions-title">
            <div className="block-head">
              <h2 id="sessions-title" className="block-title">Últimas sessões</h2>
              <Link className="more" to={`${base}/diario`}>Abrir o diário</Link>
            </div>
            <ul className="entries">
              {sessions.slice(0, 3).map((s) => <SessionEntry key={s.id} session={s} game={byId.get(s.gameId)} />)}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

function NowPlaying({ greeting, game, lastDate, lastMinutes }: { greeting: string; game?: Game; lastDate?: string; lastMinutes?: number }) {
  const [failed, setFailed] = useState(false)
  const open = useOpenGame()
  const state = useFrom()
  if (!game) {
    return (
      <section className="now now--empty">
        <h1 className="now-greeting">{greeting}</h1>
        <p className="now-title">Nada em cartaz agora</p>
        <p className="now-note">Nenhum jogo está marcado como “jogando”. O sorteio aí embaixo resolve isso.</p>
      </section>
    )
  }
  return (
    <section className="now">
      {!failed && (
        <img className="now-art" src={art(game, 'hero')} alt="" width={1920} height={620} onError={() => setFailed(true)} />
      )}
      <div className="now-scrim" aria-hidden="true" />
      <h1 className="now-greeting">{greeting}</h1>
      <div className="now-body">
        <h2 className="now-title">{game.title}</h2>
        <p className="now-note">
          Vocês estão jogando.
          {lastDate && lastMinutes ? ` A última sessão foi em ${formatDate(lastDate, { day: 'numeric', month: 'long' })} e durou ${formatMinutes(lastMinutes)}.` : ''}
        </p>
        <Link className="btn btn--light" to={`${base}/jogo/${game.id}`} state={state} onClick={(e) => open(game, e)}>
          Continuar
        </Link>
      </div>
    </section>
  )
}

function UnratedRow({ game, status }: { game: Game; status: Status }) {
  const state = useFrom()
  return (
    <li className="row">
      <span className="row-poster"><Poster game={game} decorative /></span>
      <span className="row-text">
        <span className="row-title">{game.title}</span>
        <StatusTag status={status} />
      </span>
      <Link className="btn btn--line btn--small" to={`${base}/jogo/${game.id}`} state={{ ...state, rate: true }} aria-label={`Dar nota para ${game.title}`}>
        Dar nota
      </Link>
    </li>
  )
}
