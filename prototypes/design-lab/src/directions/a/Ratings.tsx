import { useId, useState, type FormEvent } from 'react'
import { formatRating, jointAverage, other, people, ratingGap, type Game, type PersonId, type Review } from '../../data/games'
import { todayIso, updateGame } from './store'

/** From this gap on, the page stops averaging the two opinions and stages them as opposed reviews. */
export const splitThreshold = 3

export function isSplit(game: Game): boolean {
  const gap = ratingGap(game)
  return gap !== undefined && gap >= splitThreshold
}

function verdict(review: Review): string {
  const first = review.recommends ? 'Recomenda' : 'Não recomenda'
  const second = review.wouldReplay ? 'jogaria de novo' : 'não jogaria de novo'
  return `${first}, ${second}.`
}

function nameOf(person: PersonId, viewer: PersonId): string {
  return person === viewer ? `${people[person].name} (você)` : people[person].name
}

interface Props {
  game: Game
  viewer: PersonId
  editing: boolean
  /** The viewer's numeral was just saved: play the settle once. */
  fresh: boolean
  onEdit: () => void
}

export function Ratings({ game, viewer, editing, fresh, onEdit }: Props) {
  const partner = other(viewer)
  const mine = game.personal[viewer].review
  const theirs = game.personal[partner].review
  const average = jointAverage(game)
  const gap = ratingGap(game)
  const split = isSplit(game)

  return (
    <div className="ratings">
      {split && mine && theirs ? (
        <SplitReview game={game} viewer={viewer} fresh={fresh} />
      ) : (
        <div className="pair">
          {[viewer, partner].map((person) => {
            const review = game.personal[person].review
            return (
              <div className="pair-col" key={person}>
                <p className="pair-name">{nameOf(person, viewer)}</p>
                {review ? (
                  <>
                    <p className={`numeral ${person === viewer && fresh ? 'is-fresh' : ''}`}>{formatRating(review.rating)}</p>
                    {review.comment && <p className="pair-quote">“{review.comment}”</p>}
                    <p className="pair-verdict">{verdict(review)}</p>
                  </>
                ) : (
                  <>
                    <p className="numeral numeral--none">Sem nota</p>
                    <p className="pair-verdict">{person === viewer ? 'Você ainda não deu nota.' : `${people[person].name} ainda não deu nota.`}</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {average !== undefined && gap !== undefined ? (
        <dl className="joint">
          <div>
            <dt>Média da dupla</dt>
            <dd className={editing ? '' : 'is-accent'}>{formatRating(average)}</dd>
          </div>
          <div>
            <dt>Diferença</dt>
            <dd>{gap === 0 ? 'nenhuma' : formatRating(gap)}</dd>
          </div>
        </dl>
      ) : (
        <p className="joint-invite">
          {!mine && !theirs && 'Ninguém deu nota ainda. A média da dupla aparece quando os dois avaliarem.'}
          {!mine && theirs && `Falta a sua nota. A média da dupla só aparece com as duas.`}
          {mine && !theirs && `Falta a nota de ${people[partner].name}. A média da dupla só aparece com as duas.`}
        </p>
      )}

      {!editing && (
        <button type="button" className={`btn ${mine ? 'btn--line' : 'btn--amber'}`} onClick={onEdit}>
          {mine ? 'Mudar minha nota' : 'Dar minha nota'}
        </button>
      )}
    </div>
  )
}

/** “Crítica dividida”: the two reviews face each other like split critics' blurbs on a poster. */
function SplitReview({ game, viewer, fresh }: { game: Game; viewer: PersonId; fresh: boolean }) {
  const order: PersonId[] = [...(['danilo', 'maellen'] as PersonId[])].sort(
    (a, b) => (game.personal[b].review?.rating ?? 0) - (game.personal[a].review?.rating ?? 0),
  )
  return (
    <div className="split">
      {order.map((person, i) => {
        const review = game.personal[person].review
        if (!review) return null
        return (
          <figure className={`blurb ${i === 0 ? 'blurb--for' : 'blurb--against'}`} key={person}>
            <p className={`numeral ${person === viewer && fresh ? 'is-fresh' : ''}`}>{formatRating(review.rating)}</p>
            <blockquote className="blurb-quote">
              {review.comment ? `“${review.comment}”` : i === 0 ? 'Gostou, e não explicou.' : 'Não gostou, e não explicou.'}
            </blockquote>
            <figcaption>
              <span className="blurb-name">{nameOf(person, viewer)}</span>
              <span className="pair-verdict">{verdict(review)}</span>
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}

export function RatingEditor({ game, viewer, onDone }: { game: Game; viewer: PersonId; onDone: (saved: boolean) => void }) {
  const current = game.personal[viewer].review
  const [rating, setRating] = useState(current?.rating ?? 7)
  const [comment, setComment] = useState(current?.comment ?? '')
  const [recommends, setRecommends] = useState(current?.recommends ?? true)
  const [wouldReplay, setWouldReplay] = useState(current?.wouldReplay ?? false)
  const id = useId()

  const step = (delta: number) => setRating((r) => Math.min(10, Math.max(0, r + delta)))

  function save(event: FormEvent) {
    event.preventDefault()
    const review: Review = { rating, comment: comment.trim() || undefined, date: todayIso(), recommends, wouldReplay }
    updateGame(game.id, (g) => ({ ...g, personal: { ...g.personal, [viewer]: { ...g.personal[viewer], review } } }))
    onDone(true)
  }

  function remove() {
    updateGame(game.id, (g) => ({ ...g, personal: { ...g.personal, [viewer]: { ...g.personal[viewer], review: undefined } } }))
    onDone(false)
  }

  return (
    <form className="editor" onSubmit={save} aria-label={`Sua nota para ${game.title}`}>
      <div className="editor-score">
        <button type="button" className="icon-btn icon-btn--line" onClick={() => step(-0.5)} aria-label="Diminuir meio ponto" disabled={rating <= 0}>
          <span aria-hidden="true">−</span>
        </button>
        <output className="numeral numeral--big" htmlFor={`${id}-range`}>{formatRating(rating)}</output>
        <button type="button" className="icon-btn icon-btn--line" onClick={() => step(0.5)} aria-label="Aumentar meio ponto" disabled={rating >= 10}>
          <span aria-hidden="true">+</span>
        </button>
      </div>
      <label className="sr-only" htmlFor={`${id}-range`}>Nota de 0 a 10</label>
      <input
        id={`${id}-range`} className="range" type="range" min={0} max={10} step={0.5} value={rating}
        onChange={(e) => setRating(Number(e.target.value))} aria-valuetext={formatRating(rating)}
        style={{ ['--fill' as string]: `${rating * 10}%` }}
      />
      <div className="range-ends" aria-hidden="true"><span>0</span><span>5</span><span>10</span></div>

      <label className="field" htmlFor={`${id}-comment`}>
        <span className="field-label">Comentário, se quiser</span>
        <textarea id={`${id}-comment`} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Uma frase para lembrar depois" />
      </label>

      <div className="checks">
        <label className="check">
          <input type="checkbox" checked={recommends} onChange={(e) => setRecommends(e.target.checked)} />
          <span>Recomendaria</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={wouldReplay} onChange={(e) => setWouldReplay(e.target.checked)} />
          <span>Jogaria de novo</span>
        </label>
      </div>

      <div className="editor-actions">
        <button type="submit" className="btn btn--amber">Salvar nota</button>
        <button type="button" className="btn btn--ghost" onClick={() => onDone(false)}>Cancelar</button>
        {current && <button type="button" className="btn btn--danger" onClick={remove}>Apagar minha nota</button>}
      </div>
    </form>
  )
}
