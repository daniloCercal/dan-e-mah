import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  art, formatDate, other, people, statusLabels, taxonomyLabels,
  type Game, type PersonId, type Status, type TaxonomyGroup,
} from '../../data/games'
import { useViewer } from '../../lib/viewer'
import { RatingEditor, Ratings, isSplit } from './Ratings'
import { SessionEntry } from './Sessions'
import { addSession, todayIso, updateGame, useGame, useSessions } from './store'
import { Billing, Icon, Poster, base, gameCredits } from './ui'

const statusOrder: Status[] = ['lista', 'quero', 'jogando', 'pausado', 'zerado', 'abandonado', 'rejogar']
const tagGroups: { group: TaxonomyGroup; param: string }[] = [
  { group: 'moods', param: 'humor' },
  { group: 'modes', param: 'modo' },
  { group: 'genres', param: 'genero' },
  { group: 'traits', param: 'traco' },
  { group: 'custom', param: 'tag' },
]

function backLabel(from: string | undefined): string {
  if (!from) return 'Biblioteca'
  if (from.startsWith(`${base}/biblioteca`)) return 'Biblioteca'
  if (from.startsWith(`${base}/diario`)) return 'Diário'
  if (from.startsWith(`${base}/nos`)) return 'Nós'
  if (from.startsWith(`${base}/sortear`)) return 'Sorteio'
  if (from.startsWith(`${base}/adicionar`)) return 'Adicionar jogo'
  if (from.startsWith(`${base}/estilo`)) return 'Estilo'
  return 'Início'
}

export default function GamePage() {
  const { id } = useParams()
  const game = useGame(id)
  const location = useLocation()
  const state = location.state as { from?: string; rate?: boolean } | null
  const from = state?.from
  const { viewer } = useViewer()
  const partner = other(viewer)
  const allSessions = useSessions()

  const [editing, setEditing] = useState(Boolean(state?.rate))
  const [fresh, setFresh] = useState(false)
  const [logging, setLogging] = useState(false)
  const [settled, setSettled] = useState<string | null>(null)
  const [heroFailed, setHeroFailed] = useState(false)
  const ratingsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (state?.rate) ratingsRef.current?.scrollIntoView({ block: 'start' })
  }, [state?.rate])

  if (!game) {
    return (
      <div className="page">
        <h1 className="page-title">Este jogo não está na estante</h1>
        <p className="lede">Não existe um jogo com esse endereço. Ele pode ser adicionado em poucos toques.</p>
        <p className="btn-row">
          <Link className="btn btn--line" to={`${base}/biblioteca`}>Ir para a biblioteca</Link>
          <Link className="btn btn--line" to={`${base}/adicionar`}>Adicionar jogo</Link>
        </p>
      </div>
    )
  }

  const sessions = allSessions.filter((s) => s.gameId === game.id)
  const me = game.personal[viewer]
  const them = game.personal[partner]
  const split = isSplit(game)

  function setShared(status: Status) {
    updateGame(game!.id, (g) => ({ ...g, shared: status }))
    setSettled(`pair:${status}`)
  }
  function setPersonal(person: PersonId, status: Status) {
    updateGame(game!.id, (g) => ({ ...g, personal: { ...g.personal, [person]: { ...g.personal[person], status } } }))
    setSettled(`${person}:${status}`)
  }
  function toggleWant() {
    updateGame(game!.id, (g) => ({ ...g, personal: { ...g.personal, [viewer]: { ...g.personal[viewer], wants: !g.personal[viewer].wants } } }))
  }
  function startRating() {
    setEditing(true)
    setFresh(false)
    requestAnimationFrame(() => ratingsRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' }))
  }

  const rows: { key: string; label: string; value: Status; onChange: (s: Status) => void }[] = [
    { key: 'pair', label: 'A dupla', value: game.shared, onChange: setShared },
    { key: viewer, label: `${people[viewer].name} (você)`, value: me.status, onChange: (s) => setPersonal(viewer, s) },
    { key: partner, label: people[partner].name, value: them.status, onChange: (s) => setPersonal(partner, s) },
  ]

  return (
    <article className="game">
      <div className="tint" aria-hidden="true">
        <img src={art(game, 'cover')} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />
      </div>

      <div className="game-still">
        {!heroFailed && game.steamId > 0 && (
          <img src={art(game, 'hero')} alt="" width={1920} height={620} onError={() => setHeroFailed(true)} />
        )}
        <div className="game-still-scrim" aria-hidden="true" />
        <Link className="back" to={from ?? `${base}/biblioteca`}>
          <Icon name="back" size={20} /> {backLabel(from)}
        </Link>
      </div>

      <div className="game-layout">
        <div className="game-poster">
          <Poster game={game} eager shared />
        </div>

        <div className="game-main">
          <header className="game-head">
            <h1 className="game-title">{game.title}</h1>
            <Billing
              credits={gameCredits(game, [
                { role: 'na companhia de', name: 'Danilo e Maellen' },
                { role: 'na estante desde', name: formatDate(game.addedAt, { month: 'long', year: 'numeric' }) },
              ])}
            />
          </header>

          <section className="sec" aria-labelledby="sec-status">
            <h2 id="sec-status" className="sec-title">Estado</h2>
            <p className="quiet sec-note">São três estados separados: um de vocês pode ter zerado sem que a dupla tenha.</p>
            <ul className="states">
              {rows.map((row) => (
                <li key={row.key} className={`state ${settled === `${row.key}:zerado` && row.value === 'zerado' ? 'is-settled' : ''}`}>
                  <label htmlFor={`status-${row.key}`}>{row.label}</label>
                  <span className={`select select--tag ${row.value === 'abandonado' ? 'is-signal' : ''}`}>
                    <select id={`status-${row.key}`} value={row.value} onChange={(e) => row.onChange(e.target.value as Status)}>
                      {statusOrder.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                    <Icon name="chevron" size={18} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="sec" aria-labelledby="sec-ratings" ref={ratingsRef}>
            <h2 id="sec-ratings" className="sec-title">{split ? 'Crítica dividida' : 'Notas'}</h2>
            <Ratings game={game} viewer={viewer} editing={editing} fresh={fresh} onEdit={startRating} />
            {editing && (
              <RatingEditor
                game={game} viewer={viewer}
                onDone={(saved) => { setEditing(false); setFresh(saved) }}
              />
            )}
            <p className="sr-only" role="status">{fresh ? 'Nota salva.' : ''}</p>
          </section>

          <section className="sec" aria-labelledby="sec-actions">
            <h2 id="sec-actions" className="sr-only">Ações rápidas</h2>
            <div className="actions">
              <button type="button" className="btn btn--line" aria-pressed={me.wants} onClick={toggleWant}>
                {me.wants && <Icon name="check" size={18} />} Quero jogar
              </button>
              <button type="button" className="btn btn--line" aria-expanded={logging} onClick={() => setLogging((v) => !v)}>
                Registrar sessão
              </button>
              <button type="button" className="btn btn--line" onClick={startRating}>Avaliar</button>
            </div>
            <p className="quiet wants-note">
              {me.wants && them.wants && 'Os dois querem jogar: este jogo entra no sorteio.'}
              {me.wants && !them.wants && `Você quer jogar. ${people[partner].name} ainda não marcou.`}
              {!me.wants && them.wants && `${people[partner].name} quer jogar. Falta você marcar.`}
            </p>
            {logging && <SessionForm game={game} viewer={viewer} onDone={() => setLogging(false)} />}
          </section>

          <section className="sec" aria-labelledby="sec-tags">
            <h2 id="sec-tags" className="sec-title">Tags</h2>
            <dl className="tags">
              {tagGroups.filter(({ group }) => game[group].length > 0).map(({ group, param }) => (
                <div key={group}>
                  <dt>{taxonomyLabels[group]}</dt>
                  <dd>
                    {game[group].map((tag) => (
                      <Link key={tag} className="tag-link" to={`${base}/biblioteca?${param}=${encodeURIComponent(tag)}`}>{tag}</Link>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="sec" aria-labelledby="sec-sessions">
            <h2 id="sec-sessions" className="sec-title">Sessões deste jogo</h2>
            {sessions.length ? (
              <ul className="entries">{sessions.map((s) => <SessionEntry key={s.id} session={s} />)}</ul>
            ) : (
              <p className="quiet">Nenhuma sessão registrada ainda. A primeira entra pelo botão “Registrar sessão”.</p>
            )}
          </section>

          <section className="sec" aria-labelledby="sec-about">
            <h2 id="sec-about" className="sec-title">Sobre o jogo</h2>
            <p className="about">{game.description || 'Sem descrição por enquanto.'}</p>
          </section>
        </div>
      </div>
    </article>
  )
}

function SessionForm({ game, viewer, onDone }: { game: Game; viewer: PersonId; onDone: () => void }) {
  const [date, setDate] = useState(todayIso())
  const [minutes, setMinutes] = useState(60)
  const [together, setTogether] = useState(true)
  const [note, setNote] = useState('')

  function save(event: FormEvent) {
    event.preventDefault()
    addSession({
      gameId: game.id, date, minutes: Math.max(5, minutes || 0),
      who: together ? ['danilo', 'maellen'] : [viewer], note: note.trim() || undefined,
    })
    onDone()
  }

  return (
    <form className="session-form" onSubmit={save} aria-label={`Registrar sessão de ${game.title}`}>
      <div className="form-pair">
        <label className="field">
          <span className="field-label">Dia</span>
          <input type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label className="field">
          <span className="field-label">Duração em minutos</span>
          <input type="number" inputMode="numeric" min={5} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} required />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" checked={together} onChange={(e) => setTogether(e.target.checked)} />
        <span>Jogamos os dois</span>
      </label>
      <label className="field">
        <span className="field-label">Observação, se quiser</span>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Onde paramos, o que aconteceu" />
      </label>
      <div className="editor-actions">
        <button type="submit" className="btn btn--light">Salvar sessão</button>
        <button type="button" className="btn btn--ghost" onClick={onDone}>Cancelar</button>
      </div>
    </form>
  )
}
