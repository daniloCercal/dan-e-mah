import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { formatDate, jointAverage, people, statusLabels, type Game, type PersonId, type Session } from '../../data/games'
import { Cover, Icon, Player, Score, StatusTag, tap } from './ui'

const flipSpring = { type: 'spring', stiffness: 260, damping: 24 } as const
const order: PersonId[] = ['danilo', 'maellen']

interface Props {
  game: Game
  last?: Session
  eager?: boolean
  /** Controlled flip, used by the style page. */
  flipped?: boolean
  onFlip?: (next: boolean) => void
}

/** Front: the cover. Back: what the two of them lived with this game. */
export function GameCard({ game, last, eager, flipped: controlled, onFlip }: Props) {
  const [own, setOwn] = useState(false)
  const flipped = controlled ?? own
  const flip = () => {
    setOwn(!flipped)
    onFlip?.(!flipped)
  }
  const joint = jointAverage(game)
  const to = `/c/jogo/${game.id}`

  return (
    <motion.article className="c-card" whileTap={tap} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
      <div className="c-card__stage">
        <motion.div className="c-card__inner" initial={false} animate={{ rotateY: flipped ? 180 : 0 }} transition={flipSpring}>
          <Link to={to} className="c-card__face c-card__front" inert={flipped} tabIndex={flipped ? -1 : undefined}>
            <Cover game={game} eager={eager} />
          </Link>
          <div className="c-card__face c-card__back" inert={!flipped} aria-hidden={!flipped}>
            <h4>Nossa história</h4>
            <StatusTag status={game.shared} />
            <div className="c-card__rows">
              {order.map((id) => (
                <div className="c-card__row" key={id}>
                  <Player id={id} name={false} />
                  <span>
                    <span className="c-sr">{people[id].name}: </span>
                    {statusLabels[game.personal[id].status]}
                  </span>
                  <Score value={game.personal[id].review?.rating} />
                </div>
              ))}
            </div>
            {joint !== undefined && (
              <p>
                Média da dupla <Score value={joint} />
              </p>
            )}
            <p className="c-card__last">{last ? `Última sessão em ${formatDate(last.date)}` : 'Ainda sem sessões'}</p>
            <Link to={to} className="c-card__open">Abrir</Link>
          </div>
        </motion.div>
      </div>
      <div className="c-card__foot">
        <div>
          <Link to={to} className="c-card__title">{game.title}</Link>
          <StatusTag status={game.shared} />
        </div>
        <button type="button" className="c-flipbtn" aria-pressed={flipped} onClick={flip} aria-label={`Virar a carta de ${game.title}`}>
          <Icon name="flip" size={18} />
          <span aria-hidden="true">virar</span>
        </button>
      </div>
    </motion.article>
  )
}
