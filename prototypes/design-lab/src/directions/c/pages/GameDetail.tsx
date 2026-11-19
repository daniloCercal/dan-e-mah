import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  formatDate, formatMinutes, people, statusLabels, taxonomyLabels,
  type Game, type PersonId, type Review, type Status, type TaxonomyGroup,
} from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { RatingEditor, Scoreboard } from '../Scoreboard'
import { SessionForm } from '../SessionForm'
import { addToLibrary, findGame, setPersonal, setReview, setShared, useStore } from '../store'
import { Chip, Cover, Icon, Player, StatusTag } from '../ui'

const statuses = Object.keys(statusLabels) as Status[]
const tagGroups: [TaxonomyGroup, string][] = [['moods', 'humor'], ['modes', 'modo'], ['genres', 'genero'], ['traits', 'traco'], ['custom', 'tag']]

function StatusSelect({ id, label, value, onChange }: { id: string; label: string; value: Status; onChange: (s: Status) => void }) {
  const [touched, setTouched] = useState(false)
  return (
    <motion.div
      key={value} className={`c-state__select c-state__select--${value}`}
      initial={touched ? { scale: 1.12, rotate: -2 } : false} animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 460, damping: 15 }}
    >
      <select
        id={id} className="c-select" aria-label={label} value={value}
        onChange={(e) => { setTouched(true); onChange(e.target.value as Status) }}
      >
        {statuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
      </select>
    </motion.div>
  )
}

function NotInLibrary({ game }: { game: Game }) {
  return (
    <section className="c-block c-block--surface c-game__panel">
      <div className="c-wrap c-stack">
        <h2 className="c-h2">Ainda fora do baralho</h2>
        <p className="c-lead">Esse jogo não está na biblioteca de vocês. Estados, notas e sessões aparecem depois de adicionar.</p>
        <div><button type="button" className="c-btn c-btn--primary" onClick={() => addToLibrary(game)}>Adicionar à biblioteca</button></div>
      </div>
    </section>
  )
}

export default function GameDetail() {
  const { id } = useParams()
  return <Detail key={id} id={id} />
}

function Detail({ id }: { id: string | undefined }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const store = useStore()
  const { viewer, partner } = useViewer()
  const game = findGame(store, id)
  const [editing, setEditing] = useState(params.get('avaliar') === '1')
  const [fresh, setFresh] = useState<PersonId | null>(null)
  const [logging, setLogging] = useState(false)
  const [saved, setSaved] = useState('')
  const boardRef = useRef<HTMLElement>(null)
  const sessionsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (params.get('avaliar') !== '1') return
    // After the shell's scroll-to-top on navigation.
    const t = setTimeout(() => boardRef.current?.scrollIntoView({ block: 'start' }), 80)
    return () => clearTimeout(t)
  }, [params])

  if (!game) {
    return (
      <section className="c-wrap c-page">
        <h1 className="c-h1">Essa carta não está no baralho</h1>
        <p className="c-lead">Não achamos esse jogo.</p>
        <Link to="/c/biblioteca" className="c-btn c-btn--primary">Ir para a biblioteca</Link>
      </section>
    )
  }

  const inLibrary = store.library.some((g) => g.id === game.id)
  const me = game.personal[viewer]
  const sessions = store.sessions.filter((s) => s.gameId === game.id).sort((a, b) => b.date.localeCompare(a.date))
  const back = () => (location.key !== 'default' ? navigate(-1) : navigate('/c/biblioteca'))
  const openEditor = () => {
    setEditing(true)
    setSaved('')
    requestAnimationFrame(() => boardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
  }
  const openLog = () => {
    setLogging(true)
    requestAnimationFrame(() => sessionsRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
  }
  const saveReview = (review: Review) => {
    setReview(game.id, viewer, review)
    setEditing(false)
    setFresh(viewer)
    setSaved('Nota salva')
  }

  return (
    <article className="c-game">
      <div className="c-game__hero">
        <Cover game={game} kind="hero" decorative eager />
        <button type="button" className="c-game__back" onClick={back}>
          <Icon name="back" size={20} /> Voltar
        </button>
      </div>

      <header className="c-wrap c-game__head">
        <Cover game={game} eager decorative className="c-game__cover" />
        <div className="c-game__id">
          <h1 className="c-h1">{game.title}</h1>
          <p className="c-lead">{game.developer}, {game.year}</p>
        </div>
      </header>

      {inLibrary && (
        <div className="c-wrap c-game__actions">
          <Chip pressed={me.wants} onClick={() => setPersonal(game.id, viewer, { wants: !me.wants })}>Quero jogar</Chip>
          <button type="button" className="c-btn" onClick={openLog}><Icon name="clock" size={18} /> Registrar sessão</button>
          <button type="button" className={`c-btn ${me.review ? '' : 'c-btn--primary'}`} onClick={openEditor}>
            {me.review ? 'Mudar nota' : 'Avaliar'}
          </button>
        </div>
      )}

      <div className="c-game__body">
        {!inLibrary && <NotInLibrary game={game} />}

        {inLibrary && (
          <section className="c-block c-block--surface c-game__panel c-game__state" aria-labelledby="c-state-title">
            <div className="c-wrap">
              <h2 id="c-state-title" className="c-h2">Em que pé está</h2>
              <p className="c-muted c-game__hint">Três estados separados: o da dupla e o de cada um.</p>
              <ul className="c-state">
                <li>
                  <span className="c-state__who"><span className="c-state__duo" aria-hidden="true"><Icon name="duo" size={18} /></span>A dupla</span>
                  <StatusSelect id="c-st-shared" label="Estado da dupla" value={game.shared} onChange={(s) => setShared(game.id, s)} />
                </li>
                <li>
                  <span className="c-state__who"><Player id={viewer} /> <span className="c-muted">(você)</span></span>
                  <StatusSelect id="c-st-me" label={`Estado de ${people[viewer].name}`} value={me.status} onChange={(s) => setPersonal(game.id, viewer, { status: s })} />
                </li>
                <li>
                  <span className="c-state__who"><Player id={partner} /></span>
                  <span className="c-state__fixed">
                    <StatusTag status={game.personal[partner].status} />
                    <span className="c-muted c-small">Só {people[partner].name} muda o {partner === 'danilo' ? 'dele' : 'dela'}.</span>
                  </span>
                </li>
              </ul>
              <p className="c-muted c-small c-state__wants">
                {game.personal.danilo.wants && game.personal.maellen.wants
                  ? 'Os dois marcaram “quero jogar”.'
                  : game.personal[partner].wants
                    ? `${people[partner].name} marcou “quero jogar”.`
                    : me.wants ? 'Só você marcou “quero jogar” até agora.' : 'Ninguém marcou “quero jogar”.'}
              </p>
            </div>
          </section>
        )}

        {inLibrary && (
          <section ref={boardRef} className="c-block c-game__panel c-game__board" aria-labelledby="c-board-title">
            <div className="c-wrap">
              <div className="c-block__head">
                <h2 id="c-board-title" className="c-h2">Placar</h2>
                <span role="status">{saved && <span className="c-toast"><Icon name="check" size={18} /> {saved}</span>}</span>
              </div>
              <Scoreboard game={game} viewer={viewer} fresh={fresh} editing={editing} onRate={openEditor} />
              {editing && <RatingEditor initial={me.review} onSave={saveReview} onCancel={() => setEditing(false)} />}
            </div>
          </section>
        )}

        {inLibrary && (
          <section ref={sessionsRef} className="c-block c-block--surface c-game__panel c-game__sessions" aria-labelledby="c-gs-title">
            <div className="c-wrap">
              <div className="c-block__head">
                <h2 id="c-gs-title" className="c-h2">Sessões</h2>
                {!logging && <button type="button" className="c-link" onClick={() => setLogging(true)}>Registrar sessão</button>}
              </div>
              {logging && <SessionForm gameId={game.id} viewer={viewer} onDone={() => setLogging(false)} />}
              {sessions.length === 0 && !logging && <p className="c-muted">Nenhuma sessão registrada ainda.</p>}
              <ul className="c-gsessions">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <div className="c-gsessions__top">
                      <strong>{formatDate(s.date, { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                      <span className="c-num">{formatMinutes(s.minutes)}</span>
                    </div>
                    <div className="c-gsessions__who">{s.who.map((p) => <Player key={p} id={p} />)}</div>
                    {s.note && <p>{s.note}</p>}
                    {s.moment && <p className="c-moment">“{s.moment}”</p>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="c-block c-game__panel c-game__about" aria-labelledby="c-about-title">
          <div className="c-wrap c-stack">
            <h2 id="c-about-title" className="c-h2">Sobre o jogo</h2>
            <p className="c-game__desc">{game.description}</p>
            <dl className="c-tags">
              {tagGroups.map(([group, key]) =>
                game[group].length ? (
                  <div key={group}>
                    <dt>{taxonomyLabels[group]}</dt>
                    <dd className="c-chips">
                      {game[group].map((tag) => (
                        <Link key={tag} to={`/c/biblioteca?${key}=${encodeURIComponent(tag)}`} className="c-chip c-chip--tag">{tag}</Link>
                      ))}
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>
          </div>
        </section>
      </div>
    </article>
  )
}
