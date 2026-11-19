'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { GameDetail } from '@/lib/data/games'
import { isFinished, isMatch, allStatuses, statusLabels, type Person, type Status } from '@/lib/people'
import { setArchived, setMyStatus, setRemoved, setSharedStatus, setWants, updateGame } from '@/app/actions/games'
import { useSave } from '@/lib/useSave'
import { Confirm, CoverPicker, LinksEditor, StoreLinks, type PickedCover } from '@/components/Fields'
import { Cover } from '@/components/Cover'
import { IconBack, IconCheck, PairGlyph } from '@/components/icons'
import { Marker } from '@/components/Marker'
import { Mark, Stamp, defaultName } from '@/components/Marks'
import { Overlap } from '@/components/Overlap'
import { SaveButton, SaveError } from '@/components/States'
import { useToast } from '@/components/Toast'

const other = (p: Person): Person => (p === 'danilo' ? 'maellen' : 'danilo')
const article = (p: Person) => (p === 'maellen' ? 'a Maellen' : 'o Danilo')

function StatusSelect({ label, value, disabled, onChange }: { label: string; value: Status; disabled?: boolean; onChange: (s: Status) => void }) {
  return (
    <label className="select select--pill">
      <span className="sr-only">{label}</span>
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as Status)}>
        {allStatuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
      </select>
    </label>
  )
}

function StampCard({ game, me, busy, onStamp }: { game: GameDetail; me: Person; busy: boolean; onStamp: () => void }) {
  const done: Record<Person, boolean> = { danilo: isFinished(game.marks.danilo.status), maellen: isFinished(game.marks.maellen.status) }
  const both = done.danilo && done.maellen
  return (
    <section className={both ? 'stampcard stampcard--both' : 'stampcard'} aria-labelledby="h-carimbos">
      <h2 className="h3" id="h-carimbos">{both ? 'Zeramos juntos' : 'Carimbos de quem zerou'}</h2>
      <div className="stamp-slots">
        {(['danilo', 'maellen'] as const).map((p) => (
          <div className="stamp-slot" key={p}>
            {done[p] ? <Stamp person={p} /> : <span className="stamp-empty" aria-hidden="true">{p === 'danilo' ? 'D' : 'M'}</span>}
            <span className="stamp-who">
              {done[p]
                ? `${p === me ? 'Você' : defaultName(p)} zerou${game.marks[p].status === 'rejogar' ? ' e quer rejogar' : ''}`
                : p === me ? 'Você ainda não zerou' : `${defaultName(p)} ainda não zerou`}
            </span>
            {!done[p] && p === me && (
              <button type="button" className="btn btn--plain btn--small" disabled={busy} onClick={onStamp}>Carimbar: zerei</button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function EditGame({ game, onDone }: { game: GameDetail; onDone: () => void }) {
  const saving = useSave()
  const toast = useToast()
  const [title, setTitle] = useState(game.title)
  const [touched, setTouched] = useState(false)
  const [cover, setCover] = useState<PickedCover | undefined>()
  const [links, setLinks] = useState(() => game.links.map((l) => l.url))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    void saving.run(async () => {
      const res = await updateGame(game.id, { title, cover: touched ? cover?.input ?? null : undefined, links })
      if (res.ok) {
        toast.notify('Jogo atualizado.')
        onDone()
      }
      return res
    })
  }
  return (
    <form className="editor" id="editar" onSubmit={submit} aria-label="Editar jogo" aria-busy={saving.pending}>
      <h2 className="h3">Editar jogo</h2>
      <div className="field">
        <label htmlFor="e-titulo" className="editor-label">Título</label>
        <input id="e-titulo" type="text" value={title} maxLength={200} required autoFocus onChange={(e) => setTitle(e.target.value)} />
      </div>
      <CoverPicker title={title} value={cover} fallback={touched ? null : game.cover} onChange={(c) => { setCover(c); setTouched(true) }} />
      {!touched && game.source === 'igdb' && <p className="quiet">Sem capa própria, o jogo usa a capa que veio do catálogo.</p>}
      <LinksEditor links={links} onChange={setLinks} />
      {saving.failed && <SaveError>{saving.error} O que você mudou continua aqui.</SaveError>}
      <div className="editor-actions">
        <SaveButton pending={saving.pending} failed={saving.failed} label="Salvar mudanças" />
        <button type="button" className="btn btn--plain" disabled={saving.pending} onClick={onDone}>Cancelar</button>
      </div>
    </form>
  )
}

/** Edit, archive and remove. Destructive actions confirm in place and can be undone from the toast. */
function Manage({ game, editing, onEdit }: { game: GameDetail; editing: boolean; onEdit: () => void }) {
  const router = useRouter()
  const toast = useToast()
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)

  const archive = async () => {
    const on = !game.archived
    setBusy(true)
    const res = await setArchived(game.id, on).catch(() => null)
    setBusy(false)
    if (!res?.ok) return toast.notify('Não deu para salvar. Confira a conexão e tente de novo.')
    toast.notify(on ? `${game.title} foi arquivado.` : `${game.title} voltou para a biblioteca.`, () => { void setArchived(game.id, !on).then(() => router.refresh()) })
  }
  const remove = async () => {
    setBusy(true)
    const res = await setRemoved(game.id, true).catch(() => null)
    setBusy(false)
    if (!res?.ok) { setAsking(false); return toast.notify('Não deu para remover. Confira a conexão e tente de novo.') }
    toast.notify(`${game.title} foi removido da biblioteca.`, () => { void setRemoved(game.id, false).then(() => router.refresh()) })
    router.replace('/biblioteca')
  }
  return (
    <section className="sec sec--tight manage o-manage" aria-labelledby="h-gerenciar">
      <h2 className="h3" id="h-gerenciar">Gerenciar</h2>
      <div className="manage-actions">
        <button type="button" className="btn btn--plain btn--small" aria-expanded={editing} onClick={onEdit}>Editar jogo</button>
        <button type="button" className="btn btn--plain btn--small" disabled={busy} onClick={() => void archive()}>{game.archived ? 'Desarquivar' : 'Arquivar'}</button>
        <button type="button" className="btn btn--plain btn--small" aria-expanded={asking} onClick={() => setAsking(true)}>Remover</button>
      </div>
      <p className="quiet">Arquivar tira o jogo da biblioteca e do sorteio, sem apagar notas nem sessões.</p>
      {asking && (
        <Confirm title={`Remover ${game.title}?`} action="Remover jogo" onConfirm={() => void remove()} onCancel={() => setAsking(false)}>
          Ele some da biblioteca, do sorteio e do diário. Dá para desfazer logo depois de remover.
        </Confirm>
      )}
    </section>
  )
}

export function GameDetailView({ game, me }: { game: GameDetail; me: Person }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const partner = other(me)
  const mine = game.marks[me]
  const theirs = game.marks[partner]
  const match = isMatch(game)
  const statusSave = useSave()
  const wantSave = useSave()
  const [draft, setDraft] = useState<{ shared?: Status; mine?: Status; wants?: boolean } | null>(null)
  const editing = params.get('editar') === '1'
  const toast = useToast()

  const setEditing = (on: boolean) => router.replace(on ? `${pathname}?editar=1` : pathname, { scroll: false })

  const goBack = () => (window.history.length > 1 ? router.back() : router.push('/biblioteca'))

  const saveMine = (status: Status) => {
    setDraft({ mine: status })
    void statusSave.run(async () => {
      const res = await setMyStatus(game.id, status)
      setDraft(null)
      return res
    })
  }
  const savePair = (status: Status) => {
    setDraft({ shared: status })
    void statusSave.run(async () => {
      const res = await setSharedStatus(game.id, status)
      setDraft(null)
      return res
    })
  }
  const toggleWant = () => {
    const next = !(draft?.wants ?? mine.wants)
    setDraft((d) => ({ ...d, wants: next }))
    void wantSave.run(async () => {
      const res = await setWants(game.id, next)
      setDraft((d) => (d ? { ...d, wants: undefined } : d))
      if (!res.ok) toast.notify('Não deu para salvar. Confira a conexão e tente de novo.')
      return res
    })
  }

  const myWants = draft?.wants ?? mine.wants
  const wantLabel = match
    ? 'Nós dois queremos jogar'
    : myWants ? `Você quer. Falta ${article(partner)}.`
    : theirs.wants ? `${defaultName(partner)} quer jogar. Falta você.`
    : 'Ninguém marcou que quer jogar'
  const dWants = me === 'danilo' ? myWants : game.marks.danilo.wants
  const mWants = me === 'maellen' ? myWants : game.marks.maellen.wants
  const links = game.links.map((l) => l.url)
  const subtitle = [game.year, game.developer].filter(Boolean).join(', ')

  return (
    <div className="page detail">
      <div className="detail-hero">
        <button type="button" className="backbtn" onClick={goBack}>
          <IconBack size={20} />
          Voltar
        </button>
      </div>

      <header className="detail-head">
        <Cover title={game.title} src={game.cover} tilt="a" eager />
        <div>
          <h1 className="h1">{game.title}</h1>
          {subtitle && <p className="quiet">{subtitle}</p>}
        </div>
      </header>

      {game.archived && (
        <div className="archived-note" role="status">
          <p><strong>Este jogo está arquivado.</strong> Ele não aparece na biblioteca nem no sorteio.</p>
          <button type="button" className="btn btn--plain btn--small" onClick={() => void setArchived(game.id, false).then(() => router.refresh())}>Desarquivar</button>
        </div>
      )}

      <div className="detail-cols">
        <div className="detail-main">
          <section className="want" aria-label="Quem quer jogar">
            <Overlap danilo={dWants} maellen={mWants} size={60} label={wantLabel} />
            <div className="want-text">
              <p className="want-state">{match ? <Marker>{wantLabel}</Marker> : wantLabel}</p>
              <button type="button" className={myWants ? 'chip chip--on' : 'chip'} aria-pressed={myWants} disabled={wantSave.pending} onClick={toggleWant}>
                {myWants && <IconCheck size={16} />}
                Quero jogar
              </button>
            </div>
          </section>

          {editing && <EditGame game={game} onDone={() => setEditing(false)} />}
        </div>

        <aside className="detail-side">
          <section className="states" aria-labelledby="h-estado">
            <h2 className="h3" id="h-estado">Situação</h2>
            <p className="quiet states-help">São três estados separados: o da dupla e o de cada um.</p>
            <div className="state state--both">
              <span className="state-who"><PairGlyph size={16} /> Nós dois</span>
              <StatusSelect label="Situação de nós dois" value={draft?.shared ?? game.shared} disabled={statusSave.pending} onChange={savePair} />
            </div>
            <div className="state" data-person={me}>
              <span className="state-who"><Mark person={me} size={28} named={false} /> Você, {defaultName(me)}</span>
              <StatusSelect label="Sua situação" value={draft?.mine ?? mine.status} disabled={statusSave.pending} onChange={saveMine} />
            </div>
            <div className="state" data-person={partner}>
              <span className="state-who"><Mark person={partner} size={28} named={false} /> {defaultName(partner)}</span>
              <span className="state-fixed">{statusLabels[theirs.status]}</span>
            </div>
            <p className="states-saving" role="status">{statusSave.pending ? 'Salvando a situação' : ''}</p>
            {statusSave.failed && <SaveError onRetry={statusSave.retry}>{statusSave.error} A situação que você escolheu continua marcada.</SaveError>}
            <p className="quiet states-help">O estado d{article(partner)} só {partner === 'maellen' ? 'ela' : 'ele'} muda.</p>
          </section>

          <StampCard game={game} me={me} busy={statusSave.pending} onStamp={() => saveMine('zerado')} />

          <section className="sec sec--tight o-tags" aria-labelledby="h-tags">
            <h2 className="h3" id="h-tags">Tags</h2>
            {game.tags.length ? (
              <ul className="tags">
                {game.tags.map((t) => <li key={t.id} className={t.kind === 'nossa' ? 'tag tag--ours' : 'tag'}>{t.kind === 'nossa' && <PairGlyph size={12} />}{t.name}</li>)}
              </ul>
            ) : (
              <p className="quiet">Sem tags por enquanto.</p>
            )}
          </section>

          <section className="sec sec--tight o-about" aria-labelledby="h-sobre">
            <h2 className="h3" id="h-sobre">Sobre o jogo</h2>
            <p className="about">{game.description || 'Sem descrição por enquanto.'}</p>
            <StoreLinks links={links} />
          </section>

          <Manage game={game} editing={editing} onEdit={() => setEditing(!editing)} />
        </aside>
      </div>
    </div>
  )
}
