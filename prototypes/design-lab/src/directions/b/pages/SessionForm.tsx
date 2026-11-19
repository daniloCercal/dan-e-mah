import { useState, type FormEvent } from 'react'
import { type Game, type PersonId, type Session } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { useClub } from '../store'
import { nameOf } from '../lib/profile'
import { useSave } from '../lib/latency'
import { Mark } from '../components/Marks'
import { Confirm } from '../components/Fields'
import { IconCheck } from '../components/icons'
import { SaveButton, SaveError } from '../components/States'

const durations = [30, 60, 90, 120, 180, 240]
const label = (d: number) => (d < 60 ? `${d} min` : d % 60 ? `${Math.floor(d / 60)} h ${d % 60}` : `${d / 60} h`)

interface Props {
  /** Fixed game (game page). Without it the form asks which game. */
  game?: Game
  /** Existing session being edited. */
  session?: Session
  onDone: () => void
}

/** In-place session logging and editing: everything has a sensible default. */
export default function SessionForm({ game, session, onDone }: Props) {
  const { viewer } = useViewer()
  const { games, addSession, updateSession, removeSession, notify, findGame } = useClub()
  const [gameId, setGameId] = useState(session?.gameId ?? game?.id ?? '')
  const [date, setDate] = useState(() => session?.date ?? new Date().toISOString().slice(0, 10))
  const [minutes, setMinutes] = useState(session?.minutes ?? 90)
  const [who, setWho] = useState<PersonId[]>(session?.who ?? ['danilo', 'maellen'])
  const [note, setNote] = useState(session?.note ?? '')
  const [moment, setMoment] = useState(session?.moment ?? '')
  const [asking, setAsking] = useState(false)
  const saving = useSave()
  const options = durations.includes(minutes) ? durations : [...durations, minutes].sort((a, b) => a - b)

  const toggleWho = (p: PersonId) => {
    setWho((cur) => {
      const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
      return next.length ? next : [viewer]
    })
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!gameId) return
    const data = { gameId, date, minutes, who, note: note.trim() || undefined, moment: moment.trim() || undefined }
    void saving.run(() => {
      if (session) updateSession(session.id, data)
      else addSession(data)
      notify(session ? 'Sessão atualizada.' : 'Sessão guardada no diário.')
      onDone()
    })
  }
  const remove = () => {
    if (!session) return
    const copy = session
    removeSession(copy.id)
    notify(`Sessão de ${findGame(copy.gameId)?.title ?? 'jogo'} removida.`, () => addSession(copy))
    onDone()
  }

  return (
    <form className="editor" onSubmit={save} aria-label={session ? 'Editar sessão' : 'Registrar sessão'} aria-busy={saving.pending}>
      {!game && (
        <div className="field">
          <label htmlFor="s-jogo" className="editor-label">Qual jogo</label>
          <span className="select">
            <select id="s-jogo" value={gameId} required autoFocus={!session} onChange={(e) => setGameId(e.target.value)}>
              <option value="" disabled>Escolha um jogo da biblioteca</option>
              {[...games].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')).map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </span>
        </div>
      )}
      <div className="field-row">
        <div className="field">
          <label htmlFor="s-data" className="editor-label">Quando</label>
          <input id="s-data" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <fieldset className="field">
          <legend className="editor-label">Quem jogou</legend>
          <div className="chips">
            {(['danilo', 'maellen'] as const).map((p) => (
              <button key={p} type="button" className={who.includes(p) ? 'chip chip--on chip--who' : 'chip chip--who'} aria-pressed={who.includes(p)} onClick={() => toggleWho(p)}>
                <Mark person={p} size={24} named={false} />
                {nameOf(p)}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <fieldset className="field">
        <legend className="editor-label">Quanto tempo</legend>
        <div className="chips">
          {options.map((d) => (
            <button key={d} type="button" className={minutes === d ? 'chip chip--on' : 'chip'} aria-pressed={minutes === d} onClick={() => setMinutes(d)}>
              {minutes === d && <IconCheck size={16} />}
              {label(d)}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="s-nota" className="editor-label">Como foi (opcional)</label>
        <textarea id="s-nota" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="O que aconteceu que vale lembrar" />
      </div>
      <div className="field">
        <label htmlFor="s-momento" className="editor-label">Momento memorável (opcional)</label>
        <input id="s-momento" type="text" value={moment} onChange={(e) => setMoment(e.target.value)} placeholder="Uma frase só" />
      </div>
      {saving.failed && <SaveError>A sessão que você preencheu continua aqui. Confira a conexão e tente de novo.</SaveError>}
      <div className="editor-actions">
        <SaveButton pending={saving.pending} failed={saving.failed} label={session ? 'Salvar sessão' : 'Guardar sessão'} />
        <button type="button" className="btn btn--plain" disabled={saving.pending} onClick={onDone}>Cancelar</button>
        {session && !asking && <button type="button" className="link editor-remove" onClick={() => setAsking(true)}>Remover sessão</button>}
      </div>
      {asking && (
        <Confirm title="Remover esta sessão?" action="Remover sessão" onConfirm={remove} onCancel={() => setAsking(false)}>
          Ela sai do diário e das contas do clube.
        </Confirm>
      )}
      <p className="sr-only" role="status">{saving.pending ? 'Salvando a sessão' : ''}</p>
    </form>
  )
}
