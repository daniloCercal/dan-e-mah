import { Link } from 'react-router-dom'
import { formatMinutes, formatRating, jointAverage, pairStats, people, ratingGap, type Game, type PersonId } from '../../data/games'
import { useViewer } from '../../lib/viewer'
import { PageHead, Poster, base, useFrom, useOpenGame } from './ui'

const ids: PersonId[] = ['danilo', 'maellen']

export default function Us() {
  const { viewer, setViewer, greetingName } = useViewer()
  const stats = pairStats()

  const numbers: { label: string; value: string }[] = [
    { label: 'jogos na biblioteca', value: String(stats.total) },
    { label: 'zerados pela dupla', value: String(stats.finished) },
    { label: 'em andamento', value: String(stats.playing) },
    { label: 'que nós dois queremos', value: String(stats.matches) },
    { label: 'jogando juntos, pelo diário', value: formatMinutes(stats.togetherMinutes) },
  ]

  return (
    <div className="page us">
      <PageHead title="Nós" />

      <fieldset className="who">
        <legend>Quem está vendo</legend>
        <div className="segmented">
          {ids.map((id) => (
            <label key={id}>
              <input type="radio" name="viewer" checked={viewer === id} onChange={() => setViewer(id)} />
              <span>{people[id].name}</span>
            </label>
          ))}
        </div>
        <p className="quiet">
          {viewer === 'maellen'
            ? `Hoje a casa te chama de ${greetingName}. Notas, “quero jogar” e avisos passam a ser os seus.`
            : 'Notas, “quero jogar” e avisos passam a ser os de quem está vendo.'}
        </p>
      </fieldset>

      <section className="sec" aria-labelledby="us-numbers">
        <h2 id="us-numbers" className="sec-title">A dupla em números</h2>
        {stats.average !== undefined && (
          <p className="us-average">
            <span className="numeral numeral--big">{formatRating(Math.round(stats.average * 10) / 10)}</span>
            <span className="quiet">é a média da dupla nos jogos que os dois avaliaram.</span>
          </p>
        )}
        <dl className="ledger">
          {numbers.map((n) => (
            <div key={n.label}>
              <dd>{n.value}</dd>
              <dt>{n.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="us-lists">
        <section className="sec" aria-labelledby="us-divisive">
          <h2 id="us-divisive" className="sec-title">Onde mais discordamos</h2>
          <ol className="rank">
            {stats.mostDivisive.map((g) => <RankRow key={g.id} game={g} detail={`${formatRating(ratingGap(g))} de diferença`} />)}
          </ol>
        </section>

        <section className="sec" aria-labelledby="us-top">
          <h2 id="us-top" className="sec-title">As melhores médias</h2>
          <ol className="rank">
            {stats.top.map((g) => <RankRow key={g.id} game={g} detail={`média ${formatRating(jointAverage(g))}`} />)}
          </ol>
        </section>
      </div>
    </div>
  )
}

function RankRow({ game, detail }: { game: Game; detail: string }) {
  const open = useOpenGame()
  const state = useFrom()
  return (
    <li className="rank-row">
      <Link className="rank-link" to={`${base}/jogo/${game.id}`} state={state} onClick={(e) => open(game, e)}>
        <span className="row-poster"><Poster game={game} decorative /></span>
        <span className="row-text">
          <span className="row-title">{game.title}</span>
          <span className="quiet">{detail}</span>
        </span>
      </Link>
      <dl className="rank-notes">
        {ids.map((id) => (
          <div key={id}>
            <dt>{people[id].name}</dt>
            <dd>{formatRating(game.personal[id].review?.rating)}</dd>
          </div>
        ))}
      </dl>
    </li>
  )
}
