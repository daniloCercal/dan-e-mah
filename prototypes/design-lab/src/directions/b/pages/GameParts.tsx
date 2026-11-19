import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { people, statusLabels, type Game, type PersonId, type Status } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { B, allStatuses, finishedBy, linksOf, useClub } from '../store'
import { nameOf } from '../lib/profile'
import { useSave } from '../lib/latency'
import { Stamp } from '../components/Marks'
import { Confirm, CoverPicker, LinksEditor, NewTag } from '../components/Fields'
import { SaveButton, SaveError } from '../components/States'
import { IconCheck } from '../components/icons'

export function StatusSelect({ label, value, disabled, onChange }: { label: string; value: Status; disabled?: boolean; onChange: (s: Status) => void }) {
  return (
    <label className="select select--pill">
      <span className="sr-only">{label}</span>
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as Status)}>
        {allStatuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
      </select>
    </label>
  )
}

export function StampCard({ game, fresh, busy, onStamp }: { game: Game; fresh: PersonId | null; busy: boolean; onStamp: () => void }) {
  const { viewer } = useViewer()
  const done: Record<PersonId, boolean> = { danilo: finishedBy(game, 'danilo'), maellen: finishedBy(game, 'maellen') }
  const both = done.danilo && done.maellen
  return (
    <section className={both ? 'stampcard stampcard--both' : 'stampcard'} aria-labelledby="h-carimbos">
      <h2 className="h3" id="h-carimbos">{both ? 'Zeramos juntos' : 'Carimbos de quem zerou'}</h2>
      <div className="stamp-slots">
        {(['danilo', 'maellen'] as const).map((p) => (
          <div className="stamp-slot" key={p}>
            {done[p] ? <Stamp person={p} press={fresh === p} /> : <span className="stamp-empty" aria-hidden="true">{people[p].initial}</span>}
            <span className="stamp-who">
              {done[p]
                ? `${p === viewer ? 'Você' : nameOf(p)} zerou${game.personal[p].status === 'rejogar' ? ' e quer rejogar' : ''}`
                : p === viewer ? 'Você ainda não zerou' : `${nameOf(p)} ainda não zerou`}
            </span>
            {!done[p] && p === viewer && (
              <button type="button" className="btn btn--plain btn--small" disabled={busy} onClick={onStamp}>Carimbar: zerei</button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

/** Edit what the pair controls about a game: title, cover, store links and their own tags. */
export function EditGame({ game, onDone }: { game: Game; onDone: () => void }) {
  const { extraOf, updateGame, customTags, notify } = useClub()
  const extra = extraOf(game.id)
  const saving = useSave()
  const [title, setTitle] = useState(game.title)
  const [cover, setCover] = useState(extra.cover)
  const [links, setLinks] = useState(() => linksOf(game, extra))
  const [tags, setTags] = useState(game.custom)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    void saving.run(() => {
      updateGame(game.id, { title: title.trim(), custom: tags }, { cover, links })
      notify('Jogo atualizado.')
      onDone()
    })
  }
  return (
    <form className="editor" id="editar" onSubmit={submit} aria-label="Editar jogo" aria-busy={saving.pending}>
      <h2 className="h3">Editar jogo</h2>
      <div className="field">
        <label htmlFor="e-titulo" className="editor-label">Título</label>
        <input id="e-titulo" type="text" value={title} required autoFocus onChange={(e) => setTitle(e.target.value)} />
      </div>
      <CoverPicker title={title} value={cover} steamId={game.steamId} onChange={setCover} />
      {!cover && !!game.steamId && <p className="quiet">Sem capa própria, o jogo usa a capa que veio do catálogo.</p>}
      <LinksEditor links={links} onChange={setLinks} />
      <fieldset className="field">
        <legend className="editor-label">Nossas tags</legend>
        <div className="chips">
          {customTags.map((t) => {
            const on = tags.includes(t)
            return (
              <button key={t} type="button" className={on ? 'chip chip--on' : 'chip'} aria-pressed={on} onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])}>
                {on && <IconCheck size={16} />}
                {t}
              </button>
            )
          })}
          <NewTag onCreate={(t) => setTags((cur) => (cur.includes(t) ? cur : [...cur, t]))} />
        </div>
      </fieldset>
      {saving.failed && <SaveError>O que você mudou continua aqui. Confira a conexão e tente de novo.</SaveError>}
      <div className="editor-actions">
        <SaveButton pending={saving.pending} failed={saving.failed} label="Salvar mudanças" />
        <button type="button" className="btn btn--plain" disabled={saving.pending} onClick={onDone}>Cancelar</button>
      </div>
    </form>
  )
}

/** Edit, archive and remove. Destructive actions confirm in place and can be undone from the toast. */
export function Manage({ game, editing, onEdit }: { game: Game; editing: boolean; onEdit: () => void }) {
  const { extraOf, setArchived, removeGame, addGame, notify } = useClub()
  const navigate = useNavigate()
  const [asking, setAsking] = useState(false)
  const extra = extraOf(game.id)

  const archive = () => {
    const on = !extra.archived
    setArchived([game.id], on)
    notify(on ? `${game.title} foi arquivado.` : `${game.title} voltou para a biblioteca.`, () => setArchived([game.id], !on))
  }
  const remove = () => {
    removeGame(game.id)
    notify(`${game.title} foi removido da biblioteca.`, () => addGame(game, extra))
    navigate(`${B}/biblioteca`)
  }
  return (
    <section className="sec sec--tight manage o-manage" aria-labelledby="h-gerenciar">
      <h2 className="h3" id="h-gerenciar">Gerenciar</h2>
      <div className="manage-actions">
        <button type="button" className="btn btn--plain btn--small" aria-expanded={editing} onClick={onEdit}>Editar jogo</button>
        <button type="button" className="btn btn--plain btn--small" onClick={archive}>{extra.archived ? 'Desarquivar' : 'Arquivar'}</button>
        <button type="button" className="btn btn--plain btn--small" aria-expanded={asking} onClick={() => setAsking(true)}>Remover</button>
      </div>
      <p className="quiet">Arquivar tira o jogo da biblioteca e do sorteio, sem apagar notas nem sessões.</p>
      {asking && (
        <Confirm title={`Remover ${game.title}?`} action="Remover jogo" onConfirm={remove} onCancel={() => setAsking(false)}>
          As notas de vocês dois e os carimbos somem junto. As sessões continuam no diário.
        </Confirm>
      )}
    </section>
  )
}
