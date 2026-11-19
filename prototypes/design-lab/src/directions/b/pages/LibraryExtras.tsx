import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { statusLabels, type Game, type Status } from '../../../data/games'
import { writeFilters, type FilterState } from '../../../lib/filters'
import { B, allStatuses, useClub } from '../store'
import { CardCaption, Cover } from '../components/Marks'
import { IconCheck, IconClose, IconPlus } from '../components/icons'

/** Saved shortcuts: open one, save the current filter as a new one, remove one. */
export function SavedBar({ filters, active, isSaved }: { filters: FilterState; active: number; isSaved: (query: string) => boolean }) {
  const { saved, saveFilter, removeFilter, notify } = useClub()
  const [naming, setNaming] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const view = filters.view === 'lista' ? '&ver=lista' : ''
  const query = decodeURIComponent(writeFilters({ ...filters, q: '', view: 'grade', sort: 'recentes' }).toString().replace(/\+/g, ' '))
  const already = saved.some((s) => isSaved(s.query))

  const save = () => {
    const label = name.trim()
    if (!label) return
    saveFilter({ name: label, query })
    notify(`Atalho “${label}” salvo.`)
    setName('')
    setNaming(false)
  }
  return (
    <nav className="saved" aria-label="Filtros salvos">
      <span className="saved-label">Atalhos nossos</span>
      <ul className="hscroll">
        {saved.map((s) => {
          const on = isSaved(s.query)
          return (
            <li key={s.name} className={editing ? 'saved-item saved-item--edit' : 'saved-item'}>
              <Link className="chip" aria-current={on ? 'true' : undefined} to={on ? `${B}/biblioteca${view ? '?ver=lista' : ''}` : `${B}/biblioteca?${s.query}${view}`} replace>
                {s.name}
              </Link>
              {editing && (
                <button
                  type="button" className="iconbtn iconbtn--small" aria-label={`Remover atalho ${s.name}`}
                  onClick={() => { removeFilter(s.name); notify(`Atalho “${s.name}” removido.`, () => saveFilter(s)) }}
                >
                  <IconClose size={18} />
                </button>
              )}
            </li>
          )
        })}
        {active > 0 && !already && !naming && (
          <li><button type="button" className="chip chip--new" onClick={() => setNaming(true)}><IconPlus size={16} />Salvar este filtro</button></li>
        )}
        {saved.length > 0 && (
          <li><button type="button" className="chip chip--quiet" aria-pressed={editing} onClick={() => setEditing(!editing)}>{editing ? 'Pronto' : 'Editar atalhos'}</button></li>
        )}
      </ul>
      {naming && (
        <div className="saved-new">
          <label htmlFor="atalho" className="editor-label">Nome do atalho</label>
          <div className="inline-add">
            <input
              id="atalho" type="text" value={name} maxLength={28} autoFocus placeholder="Por exemplo: Noite de terror"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setNaming(false) }}
            />
            <button type="button" className="btn btn--ink" disabled={!name.trim()} onClick={save}>Salvar</button>
            <button type="button" className="btn btn--plain" onClick={() => setNaming(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </nav>
  )
}

/** A game as a checkbox, used while selecting several. */
export function SelectItem({ game, on, list, toggle }: { game: Game; on: boolean; list: boolean; toggle: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} className={list ? 'row row--lib pick' : 'gcard pick'} onClick={toggle}>
      <span className="pick-box" aria-hidden="true">{on && <IconCheck size={18} />}</span>
      <Cover game={game} />
      {list ? (
        <span className="row-text">
          <span className="row-title">{game.title}</span>
          <span className="row-meta">{statusLabels[game.shared]}</span>
        </span>
      ) : (
        <CardCaption game={game} />
      )}
    </button>
  )
}

/** Bottom action bar for the selected games. */
export function SelectBar({ ids, onDone }: { ids: string[]; onDone: () => void }) {
  const { setShared, tagGames, setArchived, customTags, notify } = useClub()
  const bar = useRef<HTMLDivElement>(null)
  const n = ids.length
  const games = n === 1 ? '1 jogo' : `${n} jogos`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDone()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onDone])

  return (
    <div className="selectbar" ref={bar} role="region" aria-label="Ações para os jogos selecionados">
      <p className="selectbar-count" role="status">
        <strong>{n}</strong> {n === 1 ? 'selecionado' : 'selecionados'}
      </p>
      <div className="selectbar-actions">
        <label className="select select--bar">
          <span className="sr-only">Mudar a situação de nós dois</span>
          <select
            value="" disabled={!n}
            onChange={(e) => {
              const status = e.target.value as Status
              ids.forEach((id) => setShared(id, status))
              notify(`${games}: situação de nós dois agora é “${statusLabels[status]}”.`)
              onDone()
            }}
          >
            <option value="" disabled>Situação</option>
            {allStatuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
        </label>
        <label className="select select--bar">
          <span className="sr-only">Adicionar uma tag nossa</span>
          <select
            value="" disabled={!n}
            onChange={(e) => {
              tagGames(ids, e.target.value)
              notify(`Tag “${e.target.value}” em ${games}.`)
              onDone()
            }}
          >
            <option value="" disabled>Tag</option>
            {customTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <button
          type="button" className="btn btn--plain btn--small" disabled={!n}
          onClick={() => {
            setArchived(ids, true)
            notify(`${games} ${n === 1 ? 'arquivado' : 'arquivados'}.`, () => setArchived(ids, false))
            onDone()
          }}
        >
          Arquivar
        </button>
        <button type="button" className="iconbtn iconbtn--small" onClick={onDone} aria-label="Sair da seleção"><IconClose size={20} /></button>
      </div>
    </div>
  )
}

export function ArchivedList() {
  const { archived, setArchived, notify } = useClub()
  const [open, setOpen] = useState(false)
  if (!archived.length) return null
  return (
    <section className="sec archived" aria-labelledby="h-arquivados">
      <button type="button" className="link" id="h-arquivados" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Esconder arquivados' : `Ver arquivados (${archived.length})`}
      </button>
      {open && (
        <ul className="rows">
          {archived.map((g) => (
            <li key={g.id} className="row row--archived">
              <Cover game={g} />
              <span className="row-text">
                <Link className="row-title" to={`${B}/jogo/${g.id}`}>{g.title}</Link>
                <span className="row-meta">Arquivado</span>
              </span>
              <button type="button" className="row-go" onClick={() => { setArchived([g.id], false); notify(`${g.title} voltou para a biblioteca.`) }}>Desarquivar</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
