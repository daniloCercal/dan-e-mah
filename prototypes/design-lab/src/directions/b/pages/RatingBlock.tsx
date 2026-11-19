import { useEffect, useRef, useState, type FormEvent } from 'react'
import { nameOf } from '../lib/profile'
import { formatDate, formatRating, jointAverage, ratingGap, type Game, type PersonId, type Review } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { useClub } from '../store'
import { RatingLine } from '../components/Overlap'
import { Mark } from '../components/Marks'
import { PairGlyph } from '../components/icons'
import { SaveButton, SaveError } from '../components/States'
import { useSave } from '../lib/latency'

const article: Record<PersonId, string> = { danilo: 'o Danilo', maellen: 'a Maellen' }

/** Short line about how far apart the two ratings are. */
export function gapLine(gap: number): string {
  const n = gap.toLocaleString('pt-BR')
  if (gap >= 4) return `${n} pontos de distância. Nesse aqui o clube rachou ao meio.`
  if (gap >= 2.5) return `${n} pontos de distância. Dá para conversar, mas vai demorar.`
  if (gap >= 1) return `${n} ${gap === 1 ? 'ponto' : 'pontos'} de diferença. Nada que estrague o jantar.`
  if (gap > 0) return 'Meio ponto de diferença. Praticamente a mesma pessoa.'
  return 'Mesma nota, sem combinar. Acontece pouco.'
}

function Editor({ game, onDone }: { game: Game; onDone: (saved: boolean) => void }) {
  const { viewer } = useViewer()
  const { updatePersonal } = useClub()
  const prev = game.personal[viewer].review
  const [rating, setRating] = useState(prev?.rating ?? 7)
  const [comment, setComment] = useState(prev?.comment ?? '')
  const [recommends, setRecommends] = useState(prev?.recommends ?? true)
  const [wouldReplay, setWouldReplay] = useState(prev?.wouldReplay ?? false)
  const slider = useRef<HTMLInputElement>(null)
  const saving = useSave()

  useEffect(() => {
    slider.current?.focus({ preventScroll: true })
    slider.current?.closest('form')?.scrollIntoView({ block: 'nearest' })
  }, [])

  const save = (e: FormEvent) => {
    e.preventDefault()
    const review: Review = { rating, comment: comment.trim() || undefined, date: new Date().toISOString().slice(0, 10), recommends, wouldReplay }
    void saving.run(() => {
      updatePersonal(game.id, viewer, { review })
      onDone(true)
    })
  }

  return (
    <form className="editor" data-person={viewer} onSubmit={save} aria-label="Sua avaliação" aria-busy={saving.pending}>
      <div className="editor-top">
        <label htmlFor="nota" className="editor-label">Sua nota</label>
        <output className="editor-value" htmlFor="nota">{formatRating(rating)}</output>
      </div>
      <input
        ref={slider} id="nota" className="slider" type="range" min={0} max={10} step={0.5} value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        style={{ ['--fill' as string]: `${rating * 10}%` }}
        aria-valuetext={`${formatRating(rating)} de 10`}
      />
      <div className="slider-scale" aria-hidden="true"><span>0</span><span>5</span><span>10</span></div>

      <label htmlFor="coment" className="editor-label">Comentário (opcional)</label>
      <textarea id="coment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Uma frase que você diria para a outra metade do clube" />

      <div className="switches">
        <label className="switch">
          <input type="checkbox" checked={recommends} onChange={(e) => setRecommends(e.target.checked)} />
          <span className="switch-ui" aria-hidden="true" />
          Recomendaria?
        </label>
        <label className="switch">
          <input type="checkbox" checked={wouldReplay} onChange={(e) => setWouldReplay(e.target.checked)} />
          <span className="switch-ui" aria-hidden="true" />
          Jogaria de novo?
        </label>
      </div>

      {saving.failed && <SaveError>Sua nota e o comentário continuam aqui. Confira a conexão e tente de novo.</SaveError>}
      <div className="editor-actions">
        <SaveButton pending={saving.pending} failed={saving.failed} label="Guardar nota" />
        <button type="button" className="btn btn--plain" disabled={saving.pending} onClick={() => onDone(false)}>Cancelar</button>
      </div>
      <p className="sr-only" role="status">{saving.pending ? 'Salvando a nota' : ''}</p>
    </form>
  )
}

function PersonReview({ game, person, mine, onEdit }: { game: Game; person: PersonId; mine: boolean; onEdit?: () => void }) {
  const review = game.personal[person].review
  return (
    <div className="review" data-person={person}>
      <div className="review-head">
        <Mark person={person} size={32} named={false} />
        <span className="review-name">{mine ? `Você, ${nameOf(person)}` : nameOf(person)}</span>
        <span className="review-score">{review ? formatRating(review.rating) : '–'}</span>
      </div>
      {review ? (
        <>
          {review.comment && <p className="review-quote">{review.comment}</p>}
          <p className="review-facts">
            {review.recommends ? 'Recomenda' : 'Não recomenda'}, {review.wouldReplay ? 'jogaria de novo' : 'não jogaria de novo'}. Nota de {formatDate(review.date, { day: 'numeric', month: 'short', year: 'numeric' })}.
          </p>
        </>
      ) : (
        <p className="review-facts">{mine ? 'Você ainda não deu nota.' : `${nameOf(person)} ainda não deu nota.`}</p>
      )}
      {mine && onEdit && (
        <button type="button" className="link" onClick={onEdit}>{review ? 'Mudar minha nota' : 'Dar minha nota'}</button>
      )}
    </div>
  )
}

export default function RatingBlock({ game, editing, setEditing }: { game: Game; editing: boolean; setEditing: (v: boolean) => void }) {
  const { viewer, partner } = useViewer()
  const [saved, setSaved] = useState(false)
  const mine = game.personal[viewer].review
  const theirs = game.personal[partner].review
  const avg = jointAverage(game)
  const gap = ratingGap(game)
  const split = gap !== undefined && gap >= 3

  return (
    <section className={split ? 'sec ratings ratings--split' : 'sec ratings'} aria-labelledby="h-notas" id="notas">
      <h2 className="h2" id="h-notas">{split ? 'Um jogo, duas opiniões' : 'Notas'}</h2>

      <div className="rating-card">
        <RatingLine danilo={game.personal.danilo.review?.rating} maellen={game.personal.maellen.review?.rating} />

        {avg !== undefined && gap !== undefined ? (
          <div className="joint">
            <p className="joint-avg">
              <PairGlyph size={16} />
              <span>Nota de nós dois</span>
              <strong>{formatRating(avg)}</strong>
            </p>
            <p className="joint-gap">{gapLine(gap)}</p>
          </div>
        ) : (
          <p className="joint-missing">
            {!mine && !theirs && 'Ninguém deu nota ainda. A nota de nós dois só existe quando os dois avaliam.'}
            {mine && !theirs && `Falta a nota d${article[partner]} para existir a nota de nós dois.`}
            {!mine && theirs && `${nameOf(partner)} já deu a nota. Falta a sua para existir a nota de nós dois.`}
          </p>
        )}
      </div>

      <p className="saved-msg" role="status">{saved ? 'Nota guardada. Os círculos já se mexeram.' : ''}</p>

      {editing ? (
        <Editor game={game} onDone={(ok) => { setEditing(false); setSaved(ok) }} />
      ) : (
        <div className="reviews">
          <PersonReview game={game} person={viewer} mine onEdit={() => { setSaved(false); setEditing(true) }} />
          <PersonReview game={game} person={partner} mine={false} />
        </div>
      )}
    </section>
  )
}
