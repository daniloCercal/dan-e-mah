import { Link } from 'react-router-dom'
import { Marker } from '../components/Marker'
import { formatMinutes, formatRating, jointAverage, ratingGap } from '../../../data/games'
import { B, type clubStats } from '../store'
import { nameOf } from '../lib/profile'
import { RatingLine } from '../components/Overlap'
import { Cover } from '../components/Marks'
import { GameLink } from '../components/GameLink'
import { PairGlyph } from '../components/icons'
import { gapLine } from './RatingBlock'

/** Longer sections of Nós: activity, top 10, genres, disagreements. All computed, nothing typed in. */
export default function UsStats({ stats }: { stats: ReturnType<typeof clubStats> }) {
  const longest = Math.max(1, ...stats.months.map((m) => m.together + m.solo))
  return (
    <>
      <section className="sec" aria-labelledby="h-meses">
        <h2 className="h2" id="h-meses">Quanto jogamos por mês</h2>
        {stats.months.length ? (
          <>
            {/* One measure (time played), one axis; every bar carries its value as text. */}
            <ul className="months">
              {stats.months.map((m) => (
                <li key={m.key}>
                  <span className="months-label">{m.label.replace(' de ', ' ')}</span>
                  <span className="months-track" aria-hidden="true">
                    {m.together > 0 && <span className="months-bar months-bar--both" style={{ width: `${(m.together / longest) * 100}%` }} />}
                    {m.solo > 0 && <span className="months-bar months-bar--solo" style={{ width: `${(m.solo / longest) * 100}%` }} />}
                  </span>
                  <span className="months-value">
                    <strong>{formatMinutes(m.together)}</strong> juntos{m.solo > 0 && `, mais ${formatMinutes(m.solo)} de alguém sozinho`}
                    <span className="quiet"> em {m.count} {m.count === 1 ? 'sessão' : 'sessões'}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="months-key quiet">
              <span className="months-swatch months-bar--both" aria-hidden="true" /> juntos
              <span className="months-swatch months-bar--solo" aria-hidden="true" /> sozinho
            </p>
          </>
        ) : (
          <p className="quiet">Ainda não há sessões registradas.</p>
        )}
      </section>

      <div className="us-cols">
        <section className="sec" aria-labelledby="h-top">
          <h2 className="h2" id="h-top">Os 10 que a gente mais gostou</h2>
          <ol className="rows rows--rank">
            {stats.top.map((g, i) => (
              <li key={g.id}>
                <GameLink className="row row--rank" id={g.id} slot="top">
                  <span className="rank" aria-hidden="true">{i + 1}</span>
                  <Cover game={g} />
                  <span className="row-text">
                    <span className="row-title">{g.title}</span>
                    <span className="row-meta">
                      {nameOf('danilo')} {formatRating(g.personal.danilo.review?.rating)}, {nameOf('maellen')} {formatRating(g.personal.maellen.review?.rating)}
                    </span>
                  </span>
                  <span className="row-score">
                    <PairGlyph size={12} />
                    <span className="sr-only">Nota de nós dois</span>
                    {formatRating(jointAverage(g))}
                  </span>
                </GameLink>
              </li>
            ))}
          </ol>
        </section>

        <div>
          <section className="sec" aria-labelledby="h-generos">
            <h2 className="h2" id="h-generos">Gêneros que agradam os dois</h2>
            <ul className="genres">
              {stats.genres.map((g) => (
                <li key={g.name}>
                  <Link to={`${B}/biblioteca?genero=${encodeURIComponent(g.name)}`}>{g.name}</Link>
                  <span className="quiet">{g.count} jogos, {g.rated} com nota dos dois</span>
                  <span className="genres-score"><Marker>{formatRating(g.average)}</Marker></span>
                </li>
              ))}
            </ul>
            <p className="quiet">Ordenado pela nota média de nós dois; só entram gêneros com pelo menos dois jogos avaliados pelos dois.</p>
          </section>

          <section className="sec" aria-labelledby="h-diverge">
            <h2 className="h2" id="h-diverge">Onde a gente mais discorda</h2>
            <ul className="diverge">
              {stats.mostDivisive.map((g) => (
                <li key={g.id}>
                  <Link className="diverge-item" to={`${B}/jogo/${g.id}`}>
                    <span className="diverge-title">{g.title}</span>
                    <RatingLine danilo={g.personal.danilo.review?.rating} maellen={g.personal.maellen.review?.rating} />
                    <span className="diverge-line">{gapLine(ratingGap(g) ?? 0)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
