import { useState } from 'react'
import { Marker } from '../components/Marker'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { art, isMatch, statusLabels, type PersonId, type Status } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { B, finishedBy, linksOf, monthLabel, useClub } from '../store'
import { nameOf } from '../lib/profile'
import { useLoaded, useSave } from '../lib/latency'
import { burst } from '../lib/media'
import { withViewTransition } from '../lib/transitions'
import { Overlap } from '../components/Overlap'
import { Cover, Mark } from '../components/Marks'
import { NewTag, StoreLinks } from '../components/Fields'
import { Busy, SkBlock, SkLine } from '../components/Loading'
import { GameNotFound, SaveError } from '../components/States'
import { IconBack, IconCheck, IconPlus, PairGlyph } from '../components/icons'
import { SessionNote } from './Home'
import { EditGame, Manage, StampCard, StatusSelect } from './GameParts'
import RatingBlock from './RatingBlock'
import SessionForm from './SessionForm'

type Panel = 'avaliar' | 'sessao' | 'editar'

export default function GameDetail() {
  const { id } = useParams()
  const { viewer, partner } = useViewer()
  const { findGame, inLibrary, extraOf, sessions, updatePersonal, setShared, updateGame, setArchived, addMilestone } = useClub()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [fresh, setFresh] = useState<PersonId | null>(null)
  const [heroFailed, setHeroFailed] = useState(false)
  const ready = useLoaded(`jogo:${id ?? ''}`)
  const statusSave = useSave()
  // What the person picked while the save is pending or failed, so the choice is never lost.
  const [draft, setDraft] = useState<{ shared?: Status; mine?: Status } | null>(null)
  const game = findGame(id)

  const open = (['avaliar', 'sessao', 'editar'] as Panel[]).find((k) => params.get(k) === '1')
  const setPanel = (key: Panel | null) => setParams(key ? { [key]: '1' } : {}, { replace: true })

  const back = (
    <button
      type="button" className="backbtn"
      onClick={() => withViewTransition(() => (location.key !== 'default' ? navigate(-1) : navigate(`${B}/biblioteca`)))}
    >
      <IconBack size={20} />
      Voltar
    </button>
  )

  if (!ready) {
    const known = game && inLibrary(game.id) && (location.state as { fromCover?: boolean } | null)?.fromCover ? game : undefined
    return (
      <div className="page detail" aria-busy="true">
        <p className="sr-only" role="status">Carregando o jogo</p>
        <div className="detail-hero">
          {known && !!known.steamId && <img src={art(known, 'hero')} alt="" width={1920} height={620} />}
          {back}
        </div>
        <header className="detail-head">
          {known ? <Cover game={known} tilt="a" eager /> : <span className="sk sk-cover" />}
          <div>
            {known ? (
              <>
                <h1 className="h1">{known.title}</h1>
                <p className="quiet">{known.year ? `${known.year}, ` : ''}{known.developer}</p>
              </>
            ) : (
              <>
                <SkLine w="70%" tall />
                <SkLine w="45%" />
              </>
            )}
          </div>
        </header>
        <Busy label="Carregando notas e sessões" className="detail-sk">
          <SkBlock h={236} />
          <SkBlock h={92} />
          <SkBlock h={48} />
          <SkBlock h={250} />
        </Busy>
      </div>
    )
  }
  if (!game) return <GameNotFound />
  if (!inLibrary(game.id)) {
    return (
      <div className="page">
        {back}
        <h1 className="h1">{game.title}</h1>
        <p className="quiet">Esse jogo ainda não está na biblioteca de vocês.</p>
        <p><Link className="btn btn--both" to={`${B}/adicionar?q=${encodeURIComponent(game.title)}`}>Adicionar jogo</Link></p>
      </div>
    )
  }

  const extra = extraOf(game.id)
  const me = game.personal[viewer]
  const them = game.personal[partner]
  const match = isMatch(game)
  const gameSessions = sessions.filter((s) => s.gameId === game.id)
  const partnerArticle = partner === 'maellen' ? 'a Maellen' : 'o Danilo'

  const setMine = (status: Status) => {
    const was = finishedBy(game, viewer)
    const finishing = !was && (status === 'zerado' || status === 'rejogar')
    setDraft({ mine: status })
    void statusSave.run(() => {
      updatePersonal(game.id, viewer, { status })
      setFresh(finishing ? viewer : null)
      setDraft(null)
      // The second stamp: the one celebration of the product, once.
      if (finishing && finishedBy(game, partner)) {
        addMilestone(game.id)
        window.setTimeout(() => burst(document.querySelector('.dir-b .stampcard--both .h3')), 280)
      }
    })
  }
  const setPair = (status: Status) => {
    setDraft({ shared: status })
    void statusSave.run(() => {
      setShared(game.id, status)
      setDraft(null)
    })
  }

  const wantLabel = match
    ? 'Nós dois queremos jogar'
    : me.wants ? `Você quer. Falta ${partnerArticle}.`
    : them.wants ? `${nameOf(partner)} quer jogar. Falta você.`
    : 'Ninguém marcou que quer jogar'

  return (
    <div className="page detail">
      <div className="detail-hero">
        {!heroFailed && !!game.steamId && (
          <img src={art(game, 'hero')} alt="" width={1920} height={620} onError={() => setHeroFailed(true)} />
        )}
        {back}
      </div>

      <header className="detail-head">
        <Cover game={game} tilt="a" eager />
        <div>
          <h1 className="h1">{game.title}</h1>
          <p className="quiet">{game.year ? `${game.year}, ` : ''}{game.developer}</p>
        </div>
      </header>

      {extra.archived && (
        <div className="archived-note" role="status">
          <p><strong>Este jogo está arquivado.</strong> Ele não aparece na biblioteca nem no sorteio.</p>
          <button type="button" className="btn btn--plain btn--small" onClick={() => setArchived([game.id], false)}>Desarquivar</button>
        </div>
      )}

      <div className="detail-cols">
        <div className="detail-main">
          <section className="want" aria-label="Quem quer jogar">
            <Overlap danilo={game.personal.danilo.wants} maellen={game.personal.maellen.wants} size={60} label={wantLabel} />
            <div className="want-text">
              <p className="want-state">{match ? <Marker>{wantLabel}</Marker> : wantLabel}</p>
              <button type="button" className={me.wants ? 'chip chip--on' : 'chip'} aria-pressed={me.wants} onClick={() => updatePersonal(game.id, viewer, { wants: !me.wants })}>
                {me.wants && <IconCheck size={16} />}
                Quero jogar
              </button>
            </div>
          </section>

          <div className="actions">
            <button type="button" className="btn btn--plain" aria-expanded={open === 'sessao'} onClick={() => setPanel(open === 'sessao' ? null : 'sessao')}>
              <IconPlus size={20} />
              Registrar sessão
            </button>
            <button type="button" className="btn btn--ink" aria-expanded={open === 'avaliar'} onClick={() => setPanel(open === 'avaliar' ? null : 'avaliar')}>
              {me.review ? 'Mudar minha nota' : 'Avaliar'}
            </button>
          </div>

          {open === 'sessao' && <SessionForm game={game} onDone={() => setPanel(null)} />}
          {open === 'editar' && <EditGame game={game} onDone={() => setPanel(null)} />}

          <RatingBlock game={game} editing={open === 'avaliar'} setEditing={(v) => setPanel(v ? 'avaliar' : null)} />

          <section className="sec o-sessions" aria-labelledby="h-sessoes">
            <h2 className="h2" id="h-sessoes">Sessões deste jogo</h2>
            {gameSessions.length ? (
              <div className="notes">
                {gameSessions.map((s) => (
                  <div key={s.id} className="note-wrap">
                    <p className="note-month">{monthLabel(s.date)}</p>
                    <SessionNote session={s} game={game} showGame={false} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="quiet">Nenhuma sessão registrada ainda.</p>
            )}
          </section>
        </div>

        <aside className="detail-side">
          <section className="states" aria-labelledby="h-estado">
            <h2 className="h3" id="h-estado">Situação</h2>
            <p className="quiet states-help">São três estados separados: o da dupla e o de cada um.</p>
            <div className="state state--both">
              <span className="state-who"><PairGlyph size={16} /> Nós dois</span>
              <StatusSelect label="Situação de nós dois" value={draft?.shared ?? game.shared} disabled={statusSave.pending} onChange={setPair} />
            </div>
            <div className="state" data-person={viewer}>
              <span className="state-who"><Mark person={viewer} size={28} named={false} /> Você, {nameOf(viewer)}</span>
              <StatusSelect label="Sua situação" value={draft?.mine ?? me.status} disabled={statusSave.pending} onChange={setMine} />
            </div>
            <div className="state" data-person={partner}>
              <span className="state-who"><Mark person={partner} size={28} named={false} /> {nameOf(partner)}</span>
              <span className="state-fixed">{statusLabels[them.status]}</span>
            </div>
            <p className="states-saving" role="status">{statusSave.pending ? 'Salvando a situação' : ''}</p>
            {statusSave.failed && (
              <SaveError onRetry={statusSave.retry}>A situação que você escolheu continua marcada. Confira a conexão e tente de novo.</SaveError>
            )}
            <p className="quiet states-help">O estado d{partnerArticle} só {partner === 'maellen' ? 'ela' : 'ele'} muda.</p>
          </section>

          <StampCard game={game} fresh={fresh} busy={statusSave.pending} onStamp={() => setMine('zerado')} />

          <section className="sec sec--tight o-tags" aria-labelledby="h-tags">
            <h2 className="h3" id="h-tags">Tags</h2>
            <ul className="tags">
              {[...game.moods, ...game.modes, ...game.genres, ...game.traits].map((t) => <li key={t} className="tag">{t}</li>)}
              {game.custom.map((t) => <li key={t} className="tag tag--ours"><PairGlyph size={12} />{t}</li>)}
            </ul>
            <div className="tags-new">
              <NewTag onCreate={(t) => !game.custom.includes(t) && updateGame(game.id, { custom: [...game.custom, t] })} />
            </div>
          </section>

          <section className="sec sec--tight o-about" aria-labelledby="h-sobre">
            <h2 className="h3" id="h-sobre">Sobre o jogo</h2>
            <p className="about">{game.description || 'Sem descrição por enquanto.'}</p>
            <StoreLinks links={linksOf(game, extra)} />
            <p className="quiet">
              {me.owned && them.owned ? 'Os dois já têm.' : me.owned ? `Só você tem. ${nameOf(partner)} ainda não.` : them.owned ? `Só ${nameOf(partner)} tem.` : 'Nenhum dos dois tem ainda.'}
            </p>
          </section>

          <Manage game={game} editing={open === 'editar'} onEdit={() => setPanel(open === 'editar' ? null : 'editar')} />
        </aside>
      </div>
    </div>
  )
}
