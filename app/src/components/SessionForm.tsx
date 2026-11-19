'use client'

import { useState, type FormEvent } from 'react'
import { removeSession, saveSession } from '@/app/actions/sessions'
import { useMember, useNameOf } from '@/lib/member'
import type { Person } from '@/lib/people'
import type { Session } from '@/lib/sessions'
import { useSave } from '@/lib/useSave'
import { Confirm } from './Fields'
import { Mark } from './Marks'
import { IconCheck } from './icons'
import { SaveButton, SaveError } from './States'
import { useToast } from './Toast'

const durations = [30, 60, 90, 120, 180, 240]
const label = (d: number) => (d < 60 ? `${d} min` : d % 60 ? `${Math.floor(d / 60)} h ${d % 60}` : `${d / 60} h`)

/** Today on the device's calendar, not in UTC. */
function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  /** Games to choose from; without `game` the form asks which one. */
  games?: { id: number; title: string }[]
  /** Fixed game (game page). */
  game?: { id: number; title: string }
  /** Existing session being edited. */
  session?: Session
  onDone: () => void
}

/** In-place session logging and editing: everything has a sensible default. */
export function SessionForm({ games = [], game, session, onDone }: Props) {
  const member = useMember()
  const nameOf = useNameOf()
  const toast = useToast()
  const me: Person = member?.person ?? 'danilo'
  const hasPartner = !!member?.partnerName
  const [gameId, setGameId] = useState<string>(String(session?.gameId ?? game?.id ?? ''))
  const [date, setDate] = useState(() => session?.date ?? today())
  const [minutes, setMinutes] = useState(session?.minutes ?? 90)
  const [who, setWho] = useState<Person[]>(session?.who ?? (hasPartner ? ['danilo', 'maellen'] : [me]))
  const [note, setNote] = useState(session?.note ?? '')
  const [moment, setMoment] = useState(session?.moment ?? '')
  const [asking, setAsking] = useState(false)
  const saving = useSave()
  const options = durations.includes(minutes) ? durations : [...durations, minutes].sort((a, b) => a - b)
  const title = game?.title ?? games.find((g) => String(g.id) === gameId)?.title ?? 'jogo'

  const toggleWho = (p: Person) => {
    setWho((cur) => {
      const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
      return next.length ? next : [me]
    })
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!gameId) return
    const res = await saving.run(() => saveSession({ id: session?.id, gameId: Number(gameId), date, minutes, who, note, moment }))
    if (res?.ok) {
      toast.notify(session ? 'Sessão atualizada.' : 'Sessão guardada no diário.')
      onDone()
    }
  }
  const remove = async () => {
    if (!session) return
    const copy = session
    const res = await removeSession(copy.id, copy.gameId).catch(() => null)
    if (!res?.ok) {
      setAsking(false)
      toast.notify('Não deu para remover. Confira a conexão e tente de novo.')
      return
    }
    toast.notify(`Sessão de ${title} removida.`, () => {
      void saveSession({ gameId: copy.gameId, date: copy.date, minutes: copy.minutes, who: copy.who, note: copy.note ?? '', moment: copy.moment ?? '' })
    })
    onDone()
  }

  return (
    <form className="editor" onSubmit={(e) => void save(e)} aria-label={session ? 'Editar sessão' : 'Registrar sessão'} aria-busy={saving.pending}>
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
          <input id="s-data" type="date" value={date} max="2100-12-31" onChange={(e) => setDate(e.target.value)} required />
        </div>
        <fieldset className="field">
          <legend className="editor-label">Quem jogou</legend>
          <div className="chips">
            {(['danilo', 'maellen'] as const).filter((p) => p === me || hasPartner).map((p) => (
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
        <textarea id="s-nota" rows={2} value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="O que aconteceu que vale lembrar" />
      </div>
      <div className="field">
        <label htmlFor="s-momento" className="editor-label">Momento memorável (opcional)</label>
        <input id="s-momento" type="text" value={moment} maxLength={1000} onChange={(e) => setMoment(e.target.value)} placeholder="Uma frase só" />
      </div>
      {saving.failed && <SaveError>{saving.error} A sessão que você preencheu continua aqui.</SaveError>}
      <div className="editor-actions">
        <SaveButton pending={saving.pending} failed={saving.failed} label={session ? 'Salvar sessão' : 'Guardar sessão'} />
        <button type="button" className="btn btn--plain" disabled={saving.pending} onClick={onDone}>Cancelar</button>
        {session && !asking && <button type="button" className="link editor-remove" onClick={() => setAsking(true)}>Remover sessão</button>}
      </div>
      {asking && (
        <Confirm title="Remover esta sessão?" action="Remover sessão" onConfirm={() => void remove()} onCancel={() => setAsking(false)}>
          Ela sai do diário e das contas do clube.
        </Confirm>
      )}
      <p className="sr-only" role="status">{saving.pending ? 'Salvando a sessão' : ''}</p>
    </form>
  )
}
