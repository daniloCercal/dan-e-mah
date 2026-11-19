'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { GameReviews, Review } from '@/lib/data/reviews'
import { formatRating, gapLine, type Person } from '@/lib/people'
import { rateGame } from '@/app/actions/reviews'
import { useSave } from '@/lib/useSave'
import { RatingLine } from '@/components/Overlap'
import { Mark } from '@/components/Marks'
import { useNameOf } from '@/lib/member'
import { PairGlyph } from '@/components/icons'
import { SaveButton, SaveError } from '@/components/States'

const article: Record<Person, string> = { danilo: 'o Danilo', maellen: 'a Maellen' }
const other = (p: Person): Person => (p === 'danilo' ? 'maellen' : 'danilo')

function Editor({ gameId, me, prev, onDone }: { gameId: number; me: Person; prev: Review | null; onDone: (saved: boolean) => void }) {
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
    void saving.run(async () => {
      const res = await rateGame(gameId, { rating, comment, recommends, wouldReplay })
      if (res.ok) onDone(true)
      return res
    })
  }

  return (
    <form className="editor" data-person={me} onSubmit={save} aria-label="Sua avaliação" aria-busy={saving.pending}>
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
      <textarea id="coment" rows={3} value={comment} maxLength={2000} onChange={(e) => setComment(e.target.value)} placeholder="Uma frase que você diria para a outra metade do clube" />

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

      {saving.failed && <SaveError>{saving.error} Sua nota e o comentário continuam aqui.</SaveError>}
      <div className="editor-actions">
        <SaveButton pending={saving.pending} failed={saving.failed} label="Guardar nota" />
        <button type="button" className="btn btn--plain" disabled={saving.pending} onClick={() => onDone(false)}>Cancelar</button>
      </div>
      <p className="sr-only" role="status">{saving.pending ? 'Salvando a nota' : ''}</p>
    </form>
  )
}

function PersonReview({ person, review, mine, hidden, onEdit }: { person: Person; review: Review | null; mine: boolean; hidden?: boolean; onEdit?: () => void }) {
  const defaultName = useNameOf()
  return (
    <div className="review" data-person={person}>
      <div className="review-head">
        <Mark person={person} size={32} named={false} />
        <span className="review-name">{mine ? `Você, ${defaultName(person)}` : defaultName(person)}</span>
        <span className="review-score">{review ? formatRating(review.rating) : '–'}</span>
      </div>
      {review ? (
        <>
          {review.comment && <p className="review-quote">{review.comment}</p>}
          <p className="review-facts">
            {review.recommends ? 'Recomenda' : 'Não recomenda'}, {review.wouldReplay ? 'jogaria de novo' : 'não jogaria de novo'}. Nota de {new Date(review.ratedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' })}.
          </p>
        </>
      ) : (
        <p className="review-facts">
          {hidden
            ? `${defaultName(person)} já deu a nota. Ela aparece quando você der a sua.`
            : mine ? 'Você ainda não deu nota.' : `${defaultName(person)} ainda não deu nota.`}
        </p>
      )}
      {mine && onEdit && (
        <button type="button" className="link" onClick={onEdit}>{review ? 'Mudar minha nota' : 'Dar minha nota'}</button>
      )}
    </div>
  )
}

export function RatingBlock({ gameId, me, reviews, editing, setEditing }: {
  gameId: number; me: Person; reviews: GameReviews; editing: boolean; setEditing: (v: boolean) => void
}) {
  const defaultName = useNameOf()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const partner = other(me)
  const mine = reviews[me]
  const theirs = reviews[partner]
  const d = reviews.danilo?.rating ?? null
  const m = reviews.maellen?.rating ?? null
  const both = d !== null && m !== null
  const avg = both ? (d + m) / 2 : null
  const gap = both ? Math.abs(d - m) : null
  const split = gap !== null && gap >= 3

  return (
    <section className={split ? 'sec ratings ratings--split' : 'sec ratings'} aria-labelledby="h-notas" id="notas">
      <h2 className="h2" id="h-notas">{split ? 'Um jogo, duas opiniões' : 'Notas'}</h2>

      <div className="rating-card">
        <RatingLine danilo={d} maellen={m} />

        {avg !== null && gap !== null ? (
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
            {!mine && !theirs && !reviews.partnerRated && 'Ninguém deu nota ainda. A nota de nós dois só existe quando os dois avaliam.'}
            {mine && !theirs && `Falta a nota d${article[partner]} para existir a nota de nós dois.`}
            {!mine && (theirs || reviews.partnerRated) && `${defaultName(partner)} já deu a nota. Falta a sua para existir a nota de nós dois.`}
          </p>
        )}
      </div>

      <p className="saved-msg" role="status">{saved ? 'Nota guardada. Os círculos já se mexeram.' : ''}</p>

      {editing ? (
        <Editor
          gameId={gameId} me={me} prev={mine}
          onDone={(ok) => {
            setEditing(false)
            setSaved(ok)
            if (ok) router.refresh()
          }}
        />
      ) : (
        <div className="reviews">
          <PersonReview person={me} review={mine} mine onEdit={() => { setSaved(false); setEditing(true) }} />
          <PersonReview person={partner} review={theirs} mine={false} hidden={!theirs && reviews.partnerRated} />
        </div>
      )}
    </section>
  )
}
