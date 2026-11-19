import { Link } from 'react-router-dom'
import { art, formatDate, formatMinutes, isMatch, type Game, type Session } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { B, useClub } from '../store'
import { Cover, GameCard, WhoMarks } from '../components/Marks'
import { GameLink } from '../components/GameLink'
import { Shelf } from '../components/Shelf'
import { Busy, SkCard, SkNote, SkNow, SkRow } from '../components/Loading'
import { useLoaded } from '../lib/latency'
import { nameOf, useProfile } from '../lib/profile'
import { Mark } from '../components/Marks'
import { PairGlyph } from '../components/icons'

const played = ['zerado', 'rejogar', 'abandonado', 'pausado', 'jogando']

export function SessionNote({ session, game, showGame = true }: { session: Session; game: Game | undefined; showGame?: boolean }) {
  const both = session.who.length === 2
  return (
    <article className="note">
      <p className="note-date">
        <span className="note-day">{formatDate(session.date, { day: '2-digit' })}</span>
        <span className="note-dow">{formatDate(session.date, { weekday: 'short' }).replace('.', '')}</span>
      </p>
      <div className="note-body">
        {showGame && game && (
          <h3 className="note-title">
            <Link to={`${B}/jogo/${game.id}`}>{game.title}</Link>
          </h3>
        )}
        <p className="note-meta">
          <WhoMarks who={session.who} size={24} />
          <span>{both ? 'Juntos' : session.who[0] === 'maellen' ? 'Só a Maellen' : 'Só o Danilo'}, {formatMinutes(session.minutes)}</span>
        </p>
        {session.note && <p className="note-text">{session.note}</p>}
        {session.moment && <p className="note-moment">{session.moment}</p>}
      </div>
    </article>
  )
}

export default function Home() {
  const { viewer, greeting, greetingName } = useViewer()
  const { useNicknames } = useProfile()
  const hello = `${greeting.split(',')[0]}, ${viewer === 'maellen' && useNicknames ? greetingName : nameOf(viewer)}`
  const { games, sessions, findGame } = useClub()
  const ready = useLoaded('inicio')

  const lastPlaying = sessions.find((s) => findGame(s.gameId)?.shared === 'jogando')
  const current = lastPlaying ? findGame(lastPlaying.gameId) : games.find((g) => g.shared === 'jogando')
  const matches = games.filter(isMatch)
  const unrated = games
    .filter((g) => !g.personal[viewer].review && played.includes(g.personal[viewer].status))
    .sort((a, b) => played.indexOf(a.personal[viewer].status) - played.indexOf(b.personal[viewer].status))
    .slice(0, 3)
  const recent = sessions.slice(0, 3)

  return (
    <div className="page home">
      <h1 className="hello" data-person={viewer}>
        <Link className="hello-me" to={`${B}/perfil`} aria-label="Abrir o seu perfil"><Mark person={viewer} size={48} named={false} /></Link>
        {hello}
      </h1>

      <div className="home-top">
        {!ready && <Busy label="Carregando o que vocês estão jogando"><SkNow /></Busy>}
        {ready && current && (
          <GameLink className="now press" id={current.id} slot="now">
            <img className="now-art" src={art(current, 'hero')} alt="" width={1920} height={620} />
            <Cover game={current} eager />
            <span className="now-text">
              <span className="now-label">Vocês estão jogando</span>
              <span className="now-title">{current.title}</span>
              {lastPlaying && (
                <span className="now-meta">
                  Última sessão {formatDate(lastPlaying.date, { weekday: 'long', day: 'numeric', month: 'short' })}, {formatMinutes(lastPlaying.minutes)}
                </span>
              )}
              <span className="now-go">Continuar</span>
            </span>
          </GameLink>
        )}

        <Link className="draw-entry press" to={`${B}/sortear`}>
          <span className="draw-entry-text">
            <span className="draw-entry-title">O que vamos jogar hoje?</span>
            <span className="draw-entry-sub">
              {ready && matches.length > 0 ? `${matches.length} jogos que nós dois queremos. A gente sorteia um.` : 'A gente sorteia um para hoje, sem discussão.'}
            </span>
          </span>
          <PairGlyph size={44} />
        </Link>
      </div>

      <section className="sec" aria-labelledby="h-match">
        <div className="sec-head">
          <h2 className="h2" id="h-match">
            <PairGlyph size={18} />
            Nós dois queremos jogar
          </h2>
          <Link className="sec-link" to={`${B}/biblioteca?pref=match`}>Ver todos</Link>
        </div>
        {!ready ? (
          <Busy label="Carregando os jogos que nós dois queremos">
            <div className="shelf">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="shelf-item"><SkCard /></div>)}</div>
          </Busy>
        ) : matches.length ? (
          <Shelf label="Jogos que nós dois queremos">
            {matches.map((g, i) => (
              <li key={g.id}>
                <GameCard game={g} tilt={i % 2 ? 'b' : 'a'} />
              </li>
            ))}
          </Shelf>
        ) : (
          <p className="quiet">Ainda não tem jogo que os dois marcaram. Marque “quero jogar” em algum e espere a outra metade.</p>
        )}
      </section>

      <div className="home-pair">
        {!ready && (
          <section className="sec">
            <h2 className="h2">Falta a sua nota</h2>
            <Busy label="Carregando as notas que faltam"><SkRow /><SkRow /><SkRow /></Busy>
          </section>
        )}
        {ready && unrated.length > 0 && (
          <section className="sec" aria-labelledby="h-nota">
            <h2 className="h2" id="h-nota">Falta a sua nota</h2>
            <ul className="rows">
              {unrated.map((g) => (
                <li key={g.id}>
                  <GameLink className="row" id={g.id} slot="row" query="?avaliar=1">
                    <Cover game={g} />
                    <span className="row-text">
                      <span className="row-title">{g.title}</span>
                      <span className="row-meta">
                        {g.personal[viewer === 'danilo' ? 'maellen' : 'danilo'].review
                          ? `${viewer === 'danilo' ? 'A Maellen' : 'O Danilo'} já deu a nota. Falta você.`
                          : 'Ninguém deu nota ainda.'}
                      </span>
                    </span>
                    <span className="row-go">Dar nota</span>
                  </GameLink>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="sec" aria-labelledby="h-sess">
          <div className="sec-head">
            <h2 className="h2" id="h-sess">Últimas sessões</h2>
            <Link className="sec-link" to={`${B}/diario`}>Abrir o diário</Link>
          </div>
          {ready ? (
            <div className="notes">
              {recent.map((s) => (
                <SessionNote key={s.id} session={s} game={findGame(s.gameId)} />
              ))}
            </div>
          ) : (
            <Busy label="Carregando as últimas sessões"><SkNote /><SkNote /><SkNote /></Busy>
          )}
        </section>
      </div>
    </div>
  )
}
