import type { Metadata } from 'next'
import Link from 'next/link'
import { listGames } from '@/lib/data/games'
import { listTags } from '@/lib/data/tags'
import { getViewer } from '@/lib/data/viewer'
import { clubStats } from '@/lib/stats'
import { formatRating, gapLine, jointAverage, ratingGap } from '@/lib/people'
import { EmptyPage } from '@/components/States'
import { Cover } from '@/components/Cover'
import { GameCard } from '@/components/Marks'
import { Shelf } from '@/components/Shelf'
import { isMatch } from '@/lib/people'
import { Mark } from '@/components/Marks'
import { Marker } from '@/components/Marker'
import { RatingLine } from '@/components/Overlap'
import { PairGlyph } from '@/components/icons'
import { NosPrefs } from './NosPrefs'

export const metadata: Metadata = { title: 'Nós' }

export default async function Us() {
  const [viewer, games, tags] = await Promise.all([getViewer(), listGames(), listTags()])
  if (!viewer) return null
  const stats = clubStats(games, tags)
  const matches = games.filter((g) => !g.archived && isMatch(g))
  const people = [viewer.me, viewer.partner].filter((m) => m !== null)
  const names = { danilo: 'Danilo', maellen: 'Maellen', ...Object.fromEntries(people.map((m) => [m.person, m.name])) }

  if (stats.total === 0) {
    return (
      <EmptyPage
        title="Nós"
        heading="A história da dupla começa aqui"
        actions={<Link className="btn btn--both" href="/adicionar">Adicionar jogo</Link>}
      >
        <p>Os jogos que os dois querem e onde as notas batem aparecem aqui.</p>
      </EmptyPage>
    )
  }

  return (
    <div className="page us">
      <h1 className="h1">Nós</h1>

      <section className="sec" aria-labelledby="h-socios">
        <h2 className="h2" id="h-socios">Os dois sócios</h2>
        <ul className="members">
          {people.map((m) => (
            <li key={m.userId}>
              {m.userId === viewer.me.userId ? (
                <Link className="member press" data-person={m.person} data-me="true" href="/perfil">
                  <Mark person={m.person} size={56} named={false} />
                  <span className="member-name">{m.name}</span>
                  <span className="member-state">É você. Editar perfil</span>
                </Link>
              ) : (
                <div className="member" data-person={m.person}>
                  <Mark person={m.person} size={56} named={false} />
                  <span className="member-name">{m.name}</span>
                  <span className="member-state">Sócio do clube</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="sec" aria-labelledby="h-numeros">
        <h2 className="h2" id="h-numeros">
          <PairGlyph size={18} />
          O clube em números
        </h2>
        <dl className="facts">
          <div><dt>jogos na biblioteca</dt><dd>{stats.total}</dd></div>
          <div><dt>zerados pela dupla</dt><dd>{stats.finished}</dd></div>
          <div><dt>em andamento</dt><dd>{stats.playing}</dd></div>
          <div><dt>que nós dois queremos</dt><dd>{stats.matches}</dd></div>
          <div><dt>nota média de nós dois</dt><dd>{stats.average === null ? '–' : <Marker>{formatRating(stats.average)}</Marker>}</dd></div>
        </dl>
        <p className="quiet">A média só conta jogos que os dois avaliaram. Tudo aqui é calculado do que vocês registraram.</p>
      </section>

      <section className="sec" aria-labelledby="h-match">
        <div className="sec-head">
          <h2 className="h2" id="h-match">
            <PairGlyph size={18} />
            Nós dois queremos jogar
          </h2>
          {matches.length > 0 && <Link className="sec-link" href="/sortear">Sortear um</Link>}
        </div>
        {matches.length ? (
          <Shelf label="Jogos que nós dois queremos">
            {matches.map((g, i) => (
              <li key={g.id}><GameCard game={g} tilt={i % 2 ? 'b' : 'a'} /></li>
            ))}
          </Shelf>
        ) : (
          <p className="quiet">Ainda não tem jogo que os dois marcaram. Marque “quero jogar” em algum e espere a outra metade.</p>
        )}
      </section>

      <div className="us-cols">
        <section className="sec" aria-labelledby="h-top">
          <h2 className="h2" id="h-top">Os que a gente mais gostou</h2>
          {stats.top.length ? (
            <ol className="rows rows--rank">
              {stats.top.map((g, i) => (
                <li key={g.id}>
                  <Link className="row row--rank" href={`/jogo/${g.id}`}>
                    <span className="rank" aria-hidden="true">{i + 1}</span>
                    <Cover title={g.title} src={g.cover} />
                    <span className="row-text">
                      <span className="row-title">{g.title}</span>
                      <span className="row-meta">
                        {names.danilo} {formatRating(g.ratings.danilo)}, {names.maellen} {formatRating(g.ratings.maellen)}
                      </span>
                    </span>
                    <span className="row-score">
                      <PairGlyph size={12} />
                      <span className="sr-only">Nota de nós dois</span>
                      {formatRating(jointAverage(g))}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="quiet">Ainda não tem jogo que os dois avaliaram. A nota de nós dois só existe quando as duas notas existem.</p>
          )}
        </section>

        <div>
          <section className="sec" aria-labelledby="h-generos">
            <h2 className="h2" id="h-generos">Gêneros que agradam os dois</h2>
            {stats.genres.length ? (
              <>
                <ul className="genres">
                  {stats.genres.map((g) => (
                    <li key={g.slug}>
                      <Link href={`/biblioteca?genero=${encodeURIComponent(g.slug)}`}>{g.name}</Link>
                      <span className="quiet">{g.count} jogos, {g.rated} com nota dos dois</span>
                      <span className="genres-score"><Marker>{formatRating(g.average)}</Marker></span>
                    </li>
                  ))}
                </ul>
                <p className="quiet">Ordenado pela nota média de nós dois; só entram gêneros com pelo menos dois jogos avaliados pelos dois.</p>
              </>
            ) : (
              <p className="quiet">Aparecem aqui quando houver gêneros com pelo menos dois jogos avaliados pelos dois.</p>
            )}
          </section>

          <section className="sec" aria-labelledby="h-diverge">
            <h2 className="h2" id="h-diverge">Onde a gente mais discorda</h2>
            {stats.mostDivisive.length ? (
              <ul className="diverge">
                {stats.mostDivisive.map((g) => (
                  <li key={g.id}>
                    <Link className="diverge-item" href={`/jogo/${g.id}`}>
                      <span className="diverge-title">{g.title}</span>
                      <RatingLine danilo={g.ratings.danilo} maellen={g.ratings.maellen} />
                      <span className="diverge-line">{gapLine(ratingGap(g) ?? 0)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="quiet">Nenhuma divergência por enquanto: precisa de um jogo avaliado pelos dois com notas diferentes.</p>
            )}
          </section>
        </div>
      </div>

      <NosPrefs blindRatings={viewer.prefs.blindRatings} drawMode={viewer.prefs.drawMode} />
    </div>
  )
}
