'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { addGame } from '@/app/actions/games'
import { useMember } from '@/lib/member'
import { statusLabels, type Status } from '@/lib/people'
import { useSave } from '@/lib/useSave'
import { Cover } from '@/components/Cover'
import { StoreLinks } from '@/components/Fields'
import { IconCheck, IconSearch } from '@/components/icons'
import { Busy, Loader, SkRow } from '@/components/Loading'
import { Overlap } from '@/components/Overlap'
import { SaveButton, SaveError } from '@/components/States'
import { ManualForm, type Draft } from './ManualForm'

interface Hit {
  igdbId: number; title: string; year: number | null; developer: string | null; cover: string | null
  description: string | null; tags: number; inLibraryId: number | null
}
type Found = { status: 'idle' | 'searching' | 'error' | 'slow'; results: Hit[] } | { status: 'done'; results: Hit[] }

type Step = 'buscar' | 'confirmar' | 'salvo'
const steps: { id: Step; label: string }[] = [
  { id: 'buscar', label: 'Buscar' },
  { id: 'confirmar', label: 'Confirmar e ajustar' },
  { id: 'salvo', label: 'Pronto' },
]
const startStatuses: Status[] = ['lista', 'jogando', 'zerado']

export function AddGame({ initialQuery, startManual }: { initialQuery: string; startManual: boolean }) {
  const member = useMember()
  const [step, setStep] = useState<Step>('buscar')
  const [text, setText] = useState(initialQuery)
  const [query, setQuery] = useState(initialQuery)
  const [manual, setManual] = useState(startManual)
  const [mTitle, setMTitle] = useState(initialQuery)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [fromManual, setFromManual] = useState(false)
  const [status, setStatus] = useState<Status>('lista')
  const [wants, setWants] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [dupeId, setDupeId] = useState<number | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const [found, setFound] = useState<Found>({ status: 'idle', results: [] })
  const [attempt, setAttempt] = useState(0)
  const saving = useSave()

  useEffect(() => {
    const t = setTimeout(() => setQuery(text), 300)
    return () => clearTimeout(t)
  }, [text])

  useEffect(() => {
    if (step !== 'buscar') heading.current?.focus()
  }, [step])

  // The catalog answers through our server; a newer query cancels the older one.
  useEffect(() => {
    if (query.trim().length < 2) {
      setFound({ status: 'idle', results: [] })
      return
    }
    const ctl = new AbortController()
    setFound({ status: 'searching', results: [] })
    fetch(`/api/igdb/search?q=${encodeURIComponent(query.trim())}`, { signal: ctl.signal })
      .then(async (res) => {
        if (res.status === 429) return setFound({ status: 'slow', results: [] })
        if (!res.ok || !res.headers.get('content-type')?.includes('json')) return setFound({ status: 'error', results: [] })
        const body = (await res.json()) as { results: Hit[] }
        setFound({ status: 'done', results: body.results })
      })
      .catch((e) => { if ((e as Error).name !== 'AbortError') setFound({ status: 'error', results: [] }) })
    return () => ctl.abort()
  }, [query, attempt])

  const results = found.results
  const searched = found.status === 'done'
  const typing = text.trim().length >= 2 && (text !== query || found.status === 'searching')

  const pickHit = (h: Hit) => {
    setDraft({ igdbId: h.igdbId, title: h.title, year: h.year, developer: h.developer ?? '', description: h.description, catalogCover: h.cover, links: [] })
    setFromManual(false)
    resetChoices()
  }
  const pickManual = (d: Draft) => {
    setDraft(d)
    setFromManual(true)
    resetChoices()
  }
  const resetChoices = () => {
    setStatus('lista')
    setWants(false)
    setDupeId(null)
    setStep('confirmar')
  }
  const restart = () => {
    setDraft(null)
    setManual(false)
    setText('')
    setQuery('')
    setMTitle('')
    setSavedId(null)
    setStep('buscar')
  }
  const goManual = (title: string) => { setMTitle(title); setManual(true) }

  const save = () => {
    if (!draft) return
    const d = draft
    void saving.run(async () => {
      const res = await addGame({
        igdbId: d.igdbId,
        manual: fromManual
          ? { title: d.title, year: d.year, developer: d.developer, cover: d.cover?.input ?? null, links: d.links }
          : undefined,
        shared: status, wants,
      })
      if (res.ok) {
        setSavedId(res.id)
        setStep('salvo')
      } else if ('duplicateId' in res && res.duplicateId) {
        setDupeId(res.duplicateId)
      }
      return res
    })
  }

  const partner = member ? (member.person === 'danilo' ? 'a Maellen' : 'o Danilo') : 'a outra pessoa'
  const wantsLabel = wants ? `${member?.name ?? 'Você'} quer jogar` : 'Ninguém marcou que quer jogar ainda'

  return (
    <div className="page add">
      <h1 className="h1">Adicionar jogo</h1>
      <ol className="steps" aria-label="Etapas">
        {steps.map((s, i) => (
          <li key={s.id} aria-current={s.id === step ? 'step' : undefined} data-done={steps.findIndex((x) => x.id === step) > i || undefined}>
            <span className="steps-n">{i + 1}</span>
            {s.label}
          </li>
        ))}
      </ol>

      {step === 'buscar' && !manual && (
        <section className="add-step" aria-label="Buscar jogo">
          <label className="search search--big">
            <span className="sr-only">Nome do jogo</span>
            <IconSearch size={22} />
            <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Nome do jogo" autoComplete="off" autoFocus />
          </label>
          <p className="quiet search-status" role="status">
            {typing && <><Loader size={16} /> Procurando “{text.trim()}”</>}
            {!typing && found.status === 'idle' && 'Digite pelo menos duas letras.'}
            {!typing && searched && results.length > 0 && `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`}
            {!typing && searched && results.length === 0 && `Nada com “${query}”.`}
            {!typing && found.status === 'error' && 'A busca não respondeu.'}
            {!typing && found.status === 'slow' && 'Muitas buscas seguidas.'}
          </p>

          {typing && <Busy label="Procurando no catálogo"><SkRow /><SkRow /><SkRow /></Busy>}

          {!typing && (found.status === 'error' || found.status === 'slow') && (
            <div className="alert alert--block" role="alert">
              <h2 className="h3">{found.status === 'slow' ? 'Calma, muitas buscas seguidas' : 'Não deu para buscar no catálogo'}</h2>
              <p>
                {found.status === 'slow'
                  ? 'Espere um minutinho e tente de novo, ou cadastre o jogo do seu jeito.'
                  : 'O catálogo de jogos não respondeu agora. A sua biblioteca não foi afetada. Tente de novo em instantes ou cadastre o jogo do seu jeito.'}
              </p>
              <div className="editor-actions">
                <button type="button" className="btn btn--both" onClick={() => setAttempt((n) => n + 1)}>Tentar de novo</button>
                <button type="button" className="btn btn--plain" onClick={() => goManual(text.trim())}>Cadastrar manualmente</button>
              </div>
            </div>
          )}

          {!typing && results.length > 0 && (
            <ul className="rows">
              {results.map((h) => {
                const body = (
                  <>
                    <Cover title={h.title} src={h.cover} />
                    <span className="row-text">
                      <span className="row-title">{h.title}</span>
                      <span className="row-meta">{[h.year, h.developer].filter(Boolean).join(', ') || 'Sem detalhes'}</span>
                      {h.inLibraryId && <span className="row-meta row-have"><IconCheck size={16} /> Já está na biblioteca</span>}
                    </span>
                    <span className="row-go">{h.inLibraryId ? 'Abrir' : 'Escolher'}</span>
                  </>
                )
                return (
                  <li key={h.igdbId}>
                    {h.inLibraryId ? (
                      <Link className="row row--have" href={`/jogo/${h.inLibraryId}`}>{body}</Link>
                    ) : (
                      <button type="button" className="row" onClick={() => pickHit(h)}>{body}</button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {!typing && searched && results.length === 0 && (
            <div className="empty empty--left">
              <h2 className="h2">Não achamos esse</h2>
              <p>Confira se o nome está certo ou cadastre do seu jeito. Só o título é obrigatório.</p>
              <button type="button" className="btn btn--both" onClick={() => goManual(text.trim())}>Cadastrar manualmente</button>
            </div>
          )}
          {!(searched && results.length === 0) && found.status !== 'error' && found.status !== 'slow' && (
            <button type="button" className="link" onClick={() => goManual(text.trim())}>Não achei, quero cadastrar manualmente</button>
          )}
        </section>
      )}

      {step === 'buscar' && manual && (
        <ManualForm initialTitle={mTitle} onReady={pickManual} onCancel={() => setManual(false)} />
      )}

      {step === 'confirmar' && draft && (
        <section className="add-step" aria-labelledby="h-confirma">
          <h2 className="h2" id="h-confirma" tabIndex={-1} ref={heading}>É esse aqui?</h2>
          <div className="confirm">
            <Cover title={draft.title} src={draft.cover?.preview ?? draft.catalogCover} eager />
            <div className="confirm-text">
              <p className="confirm-title">{draft.title}</p>
              <p className="quiet">{[draft.year, draft.developer].filter(Boolean).join(', ')}</p>
              {draft.description && <p>{draft.description.length > 280 ? `${draft.description.slice(0, 280).trimEnd()}…` : draft.description}</p>}
              {draft.links.length > 0 && <StoreLinks links={draft.links} />}
            </div>
          </div>

          {dupeId && (
            <div className="alert" role="alert">
              <p><strong>Esse jogo já está na biblioteca.</strong> <Link href={`/jogo/${dupeId}`}>Abrir o jogo</Link></p>
            </div>
          )}
          {saving.failed && !dupeId && <SaveError>{saving.error} O jogo e os ajustes que você escolheu continuam aqui.</SaveError>}
          <div className="editor-actions">
            <SaveButton type="button" className="btn btn--both btn--big" pending={saving.pending} failed={saving.failed && !dupeId} label="Salvar na biblioteca" onClick={save} />
            <button type="button" className="btn btn--plain" disabled={saving.pending} onClick={restart}>Escolher outro</button>
          </div>
          <p className="sr-only" role="status">{saving.pending ? 'Salvando o jogo' : ''}</p>

          <div className="optional">
            <h3 className="h3">Se quiser, já ajuste (opcional)</h3>
            <fieldset className="field">
              <legend className="editor-label">Situação de nós dois</legend>
              <div className="chips">
                {startStatuses.map((s) => (
                  <button key={s} type="button" className={status === s ? 'chip chip--on' : 'chip'} aria-pressed={status === s} onClick={() => setStatus(s)}>
                    {status === s && <IconCheck size={16} />}
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="field">
              <legend className="editor-label">Você quer jogar?</legend>
              <button type="button" className={wants ? 'chip chip--on' : 'chip'} aria-pressed={wants} onClick={() => setWants(!wants)}>
                {wants && <IconCheck size={16} />}
                Quero jogar
              </button>
            </fieldset>
          </div>
        </section>
      )}

      {step === 'salvo' && draft && (
        <section className="add-step saved-card" aria-labelledby="h-salvo">
          <Cover title={draft.title} src={draft.cover?.preview ?? draft.catalogCover} tilt="b" />
          <div>
            <h2 className="h2" id="h-salvo" tabIndex={-1} ref={heading}>{draft.title} entrou para o clube</h2>
            <div className="saved-want">
              <Overlap danilo={member?.person === 'danilo' && wants} maellen={member?.person === 'maellen' && wants} size={44} label={wantsLabel} />
              <p>{wants ? `Você já marcou que quer jogar. Falta ${partner} dizer o mesmo.` : 'Está na lista de vocês, sem ninguém marcado ainda.'}</p>
            </div>
            <div className="editor-actions">
              {savedId && <Link className="btn btn--ink" href={`/jogo/${savedId}`}>Abrir o jogo</Link>}
              <button type="button" className="btn btn--plain" onClick={restart}>Adicionar outro</button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
