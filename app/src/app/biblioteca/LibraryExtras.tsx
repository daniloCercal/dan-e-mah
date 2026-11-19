'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { GameSummary } from '@/lib/data/games'
import type { SavedFilter } from '@/lib/data/tags'
import { allStatuses, statusLabels, type Status } from '@/lib/people'
import { readFilters, shortcutQuery, type FilterState, type Tag } from '@/lib/filters'
import { removeFilter, saveFilter, setArchivedMany, setSharedStatusMany, tagGames } from '@/app/actions/library'
import { Cover } from '@/components/Cover'
import { CardCaption } from '@/components/Marks'
import { IconCheck, IconClose, IconPlus } from '@/components/icons'
import { useToast } from '@/components/Toast'

const failText = 'Não deu para salvar. Confira a conexão e tente de novo.'

/** Saved shortcuts: open one, save the current filter as a new one, remove one. */
export function SavedBar({ filters, active, saved }: { filters: FilterState; active: number; saved: SavedFilter[] }) {
  const toast = useToast()
  const router = useRouter()
  const [naming, setNaming] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const view = filters.view === 'lista' ? 'vista=lista' : ''
  const query = shortcutQuery(filters)
  const isOn = (s: SavedFilter) => shortcutQuery(readFilters(new URLSearchParams(s.query))) === query
  const already = saved.some(isOn)

  const save = async () => {
    const label = name.trim()
    if (!label || busy) return
    setBusy(true)
    const res = await saveFilter(label, query).catch(() => null)
    setBusy(false)
    if (!res?.ok) return toast.notify(res ? res.error : failText)
    toast.notify(`Atalho “${label}” salvo.`)
    setName('')
    setNaming(false)
  }
  const remove = async (s: SavedFilter) => {
    const res = await removeFilter(s.id).catch(() => null)
    if (!res?.ok) return toast.notify(failText)
    toast.notify(`Atalho “${s.name}” removido.`, () => { void saveFilter(s.name, s.query).then(() => router.refresh()) })
  }
  if (!saved.length && !(active > 0)) return null
  return (
    <nav className="saved" aria-label="Filtros salvos">
      <span className="saved-label">Atalhos nossos</span>
      <ul className="hscroll">
        {saved.map((s) => {
          const on = isOn(s)
          const href = on ? `/biblioteca${view ? `?${view}` : ''}` : `/biblioteca?${[s.query, view].filter(Boolean).join('&')}`
          return (
            <li key={s.id} className={editing ? 'saved-item saved-item--edit' : 'saved-item'}>
              <Link className="chip" aria-current={on ? 'true' : undefined} href={href} replace>{s.name}</Link>
              {editing && (
                <button type="button" className="iconbtn iconbtn--small" aria-label={`Remover atalho ${s.name}`} onClick={() => void remove(s)}>
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
              onKeyDown={(e) => { if (e.key === 'Enter') void save(); if (e.key === 'Escape') setNaming(false) }}
            />
            <button type="button" className="btn btn--ink" disabled={!name.trim() || busy} onClick={() => void save()}>Salvar</button>
            <button type="button" className="btn btn--plain" onClick={() => setNaming(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </nav>
  )
}

/** A game as a checkbox, used while selecting several. */
export function SelectItem({ game, on, list, toggle }: { game: GameSummary; on: boolean; list: boolean; toggle: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} className={list ? 'row row--lib pick' : 'gcard pick'} onClick={toggle}>
      <span className="pick-box" aria-hidden="true">{on && <IconCheck size={18} />}</span>
      <Cover title={game.title} src={game.cover} />
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
export function SelectBar({ ids, tags, onDone }: { ids: number[]; tags: Tag[]; onDone: () => void }) {
  const toast = useToast()
  const router = useRouter()
  const n = ids.length
  const games = n === 1 ? '1 jogo' : `${n} jogos`
  const ours = tags.filter((t) => t.kind === 'nossa')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDone()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onDone])

  return (
    <div className="selectbar" role="region" aria-label="Ações para os jogos selecionados">
      <p className="selectbar-count" role="status">
        <strong>{n}</strong> {n === 1 ? 'selecionado' : 'selecionados'}
      </p>
      <div className="selectbar-actions">
        <label className="select select--bar">
          <span className="sr-only">Mudar a situação de nós dois</span>
          <select
            value="" disabled={!n}
            onChange={async (e) => {
              const status = e.target.value as Status
              const res = await setSharedStatusMany(ids, status).catch(() => null)
              toast.notify(res?.ok ? `${games}: situação de nós dois agora é “${statusLabels[status]}”.` : failText)
              if (res?.ok) onDone()
            }}
          >
            <option value="" disabled>Situação</option>
            {allStatuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
        </label>
        <label className="select select--bar">
          <span className="sr-only">Adicionar uma tag nossa</span>
          <select
            value="" disabled={!n || !ours.length}
            onChange={async (e) => {
              const tag = ours.find((t) => String(t.id) === e.target.value)
              if (!tag) return
              const res = await tagGames(ids, tag.id).catch(() => null)
              toast.notify(res?.ok ? `Tag “${tag.name}” em ${games}.` : failText)
              if (res?.ok) onDone()
            }}
          >
            <option value="" disabled>{ours.length ? 'Tag' : 'Sem tags nossas'}</option>
            {ours.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <button
          type="button" className="btn btn--plain btn--small" disabled={!n}
          onClick={async () => {
            const res = await setArchivedMany(ids, true).catch(() => null)
            if (!res?.ok) return toast.notify(failText)
            toast.notify(`${games} ${n === 1 ? 'arquivado' : 'arquivados'}.`, () => { void setArchivedMany(ids, false).then(() => router.refresh()) })
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
