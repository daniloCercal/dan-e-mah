import { useState } from 'react'
import { motion } from 'motion/react'
import { formatRating, jointAverage, other, people, ratingGap, type Game, type PersonId, type Review } from '../../data/games'
import { todayIso } from './store'
import { Chip, Icon, Player, Score } from './ui'

const order: PersonId[] = ['danilo', 'maellen']
/** From this gap on, the ratings are shown as a versus split instead of a table. */
export const DIVERGENT_GAP = 3

function verdict(r: Review): string {
  const a = r.recommends ? 'Recomenda' : 'Não recomenda'
  const b = r.wouldReplay ? 'jogaria de novo' : 'não jogaria de novo'
  return `${a}, ${b}`
}

/** A numeral that lands with a spring when its value was just saved. */
export function Landing({ value, fresh, className }: { value: number | undefined; fresh: boolean; className?: string }) {
  return (
    <motion.span
      key={`${value}-${fresh}`} style={{ display: 'inline-block', transformOrigin: '100% 60%' }}
      initial={fresh ? { scale: 1.6, y: -10 } : false} animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 14 }}
    >
      <Score value={value} className={className} />
    </motion.span>
  )
}

export function Versus({ game, fresh, quotes = true }: { game: Game; fresh?: PersonId | null; quotes?: boolean }) {
  const d = game.personal.danilo.review
  const m = game.personal.maellen.review
  if (!d || !m) return null
  const total = d.rating + m.rating || 1
  const leftShare = Math.min(60, Math.max(40, (d.rating / total) * 100))
  return (
    <div className="c-versus">
      <div className="c-versus__split">
        {order.map((id) => {
          const r = game.personal[id].review!
          return (
            <div key={id} className={`c-versus__side c-versus__side--${id}`} style={{ flex: `${id === 'danilo' ? leftShare : 100 - leftShare} 1 0` }}>
              <Player id={id} />
              <Landing value={r.rating} fresh={fresh === id} />
              {quotes && r.comment && <p className="c-versus__quote">“{r.comment}”</p>}
            </div>
          )
        })}
        <span className="c-versus__vs" style={{ left: `${leftShare}%` }} aria-hidden="true">vs</span>
      </div>
      <div className="c-versus__gap">
        <strong>
          <Score value={ratingGap(game)} /> pontos de distância
        </strong>
        <span>
          Média da dupla <Score value={jointAverage(game)} />
        </span>
      </div>
    </div>
  )
}

interface BoardProps {
  game: Game
  viewer: PersonId
  fresh: PersonId | null
  onRate: () => void
  editing: boolean
}

export function Scoreboard({ game, viewer, fresh, onRate, editing }: BoardProps) {
  const partner = other(viewer)
  const mine = game.personal[viewer].review
  const theirs = game.personal[partner].review
  const joint = jointAverage(game)
  const gap = ratingGap(game)

  if (gap !== undefined && gap >= DIVERGENT_GAP) {
    return (
      <div className="c-stack">
        <Versus game={game} fresh={fresh} />
        {!editing && <button type="button" className="c-link" onClick={onRate}>Mudar a minha nota</button>}
      </div>
    )
  }

  return (
    <div className="c-board">
      {order.map((id) => {
        const r = game.personal[id].review
        return (
          <div className="c-board__row" key={id}>
            <Player id={id} size="lg" />
            {r ? <Landing value={r.rating} fresh={fresh === id} /> : <span className="c-num c-num--empty" aria-label="sem nota">–,–</span>}
            {r?.comment && <p className="c-board__note">“{r.comment}”</p>}
            {r && <p className="c-board__note c-small">{verdict(r)}</p>}
          </div>
        )
      })}
      {joint !== undefined ? (
        <div className="c-board__joint">
          <div>
            <p className="c-h3">Placar da dupla</p>
            <p className="c-muted">
              {gap === 0 ? 'Notas iguais.' : <><span className="c-num">{formatRating(gap)}</span> de diferença entre vocês.</>}
            </p>
            {!editing && <button type="button" className="c-link" onClick={onRate}>Mudar a minha nota</button>}
          </div>
          <Landing value={joint} fresh={fresh !== null} className="c-board__total" />
        </div>
      ) : (
        <div className="c-board__invite">
          <p>
            {!mine && !theirs && 'Ninguém marcou ponto ainda. A média só aparece com as duas notas.'}
            {!mine && theirs && `Falta a sua nota para fechar o placar da dupla.`}
            {mine && !theirs && `Falta a nota de ${people[partner].name}. A média aparece quando os dois avaliarem.`}
          </p>
          {!editing && (
            <button type="button" className={`c-btn ${mine ? '' : 'c-btn--primary'}`} onClick={onRate}>
              {mine ? 'Mudar a minha nota' : 'Dar a minha nota'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface EditorProps {
  initial?: Review
  onSave: (review: Review) => void
  onCancel: () => void
}

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="c-editor__yn" role="group" aria-label={label}>
      <span className="c-label">{label}</span>
      <div className="c-chips">
        <Chip pressed={value} onClick={() => onChange(true)}>Sim</Chip>
        <Chip pressed={!value} onClick={() => onChange(false)}>Não</Chip>
      </div>
    </div>
  )
}

/** In-place rating editor: 0–10 in steps of 0.5, slider plus buttons. */
export function RatingEditor({ initial, onSave, onCancel }: EditorProps) {
  const [rating, setRating] = useState(initial?.rating ?? 7)
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [recommends, setRecommends] = useState(initial?.recommends ?? true)
  const [wouldReplay, setWouldReplay] = useState(initial?.wouldReplay ?? false)
  const step = (by: number) => setRating((r) => Math.min(10, Math.max(0, r + by)))

  return (
    <form
      className="c-editor"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ rating, comment: comment.trim() || undefined, date: todayIso(), recommends, wouldReplay })
      }}
    >
      <div className="c-field">
        <label className="c-label" htmlFor="c-rating">Sua nota</label>
        <div className="c-editor__score">
          <button type="button" className="c-iconbtn" onClick={() => step(-0.5)} disabled={rating <= 0} aria-label="Meio ponto a menos">
            <Icon name="minus" />
          </button>
          <output className="c-num" htmlFor="c-rating">{formatRating(rating)}</output>
          <button type="button" className="c-iconbtn" onClick={() => step(0.5)} disabled={rating >= 10} aria-label="Meio ponto a mais">
            <Icon name="plus" />
          </button>
        </div>
        <input
          id="c-rating" className="c-range" type="range" min={0} max={10} step={0.5} value={rating}
          onChange={(e) => setRating(Number(e.target.value))} aria-valuetext={`${formatRating(rating)} de 10`}
        />
      </div>
      <div className="c-field">
        <label className="c-label" htmlFor="c-comment">Comentário <span className="c-muted">(opcional)</span></label>
        <textarea id="c-comment" className="c-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="O que ficou na memória?" />
      </div>
      <YesNo label="Recomendaria?" value={recommends} onChange={setRecommends} />
      <YesNo label="Jogaria de novo?" value={wouldReplay} onChange={setWouldReplay} />
      <div className="c-editor__actions">
        <button type="submit" className="c-btn c-btn--primary">Salvar nota</button>
        <button type="button" className="c-btn c-btn--quiet" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}
