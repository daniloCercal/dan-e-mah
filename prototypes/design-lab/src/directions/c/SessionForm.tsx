import { useState } from 'react'
import { formatMinutes, other, people, type PersonId } from '../../data/games'
import { addSession, todayIso } from './store'
import { Chip } from './ui'

const durations = [30, 60, 90, 120, 180]

/** Logs a session in place — no modal. */
export function SessionForm({ gameId, viewer, onDone }: { gameId: string; viewer: PersonId; onDone: () => void }) {
  const [date, setDate] = useState(todayIso())
  const [minutes, setMinutes] = useState(60)
  const [together, setTogether] = useState(true)
  const [note, setNote] = useState('')

  return (
    <form
      className="c-editor c-sessionform"
      onSubmit={(e) => {
        e.preventDefault()
        addSession({ gameId, date, minutes, who: together ? [viewer, other(viewer)] : [viewer], note: note.trim() || undefined })
        onDone()
      }}
    >
      <div className="c-field">
        <label className="c-label" htmlFor="c-s-date">Quando</label>
        <input id="c-s-date" className="c-input" type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="c-field" role="group" aria-labelledby="c-s-dur">
        <span className="c-label" id="c-s-dur">Quanto tempo</span>
        <div className="c-chips">
          {durations.map((d) => <Chip key={d} pressed={minutes === d} onClick={() => setMinutes(d)}>{formatMinutes(d)}</Chip>)}
        </div>
      </div>
      <div className="c-field" role="group" aria-labelledby="c-s-who">
        <span className="c-label" id="c-s-who">Quem jogou</span>
        <div className="c-chips">
          <Chip pressed={together} onClick={() => setTogether(true)}>Nós dois</Chip>
          <Chip pressed={!together} onClick={() => setTogether(false)}>Só {people[viewer].name}</Chip>
        </div>
      </div>
      <div className="c-field">
        <label className="c-label" htmlFor="c-s-note">Observação <span className="c-muted">(opcional)</span></label>
        <input id="c-s-note" className="c-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Até onde chegaram?" />
      </div>
      <div className="c-editor__actions">
        <button type="submit" className="c-btn c-btn--primary">Salvar sessão</button>
        <button type="button" className="c-btn c-btn--quiet" onClick={onDone}>Cancelar</button>
      </div>
    </form>
  )
}
