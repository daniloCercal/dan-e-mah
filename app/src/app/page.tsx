import Link from 'next/link'
import { Cover } from '@/components/Cover'
import { GameLink } from '@/components/GameLink'
import { GameCard } from '@/components/Marks'
import { MascotMoment } from '@/components/MascotMoment'
import { PairGlyph } from '@/components/icons'
import { Shelf } from '@/components/Shelf'
import { listGames } from '@/lib/data/games'
import { listSessions } from '@/lib/data/sessions'
import { SessionNote } from '@/components/SessionNote'
import { isMatch, type Person, type Status } from '@/lib/people'
import { getViewer } from '@/lib/data/viewer'

function greeting(): string {
  const h = Number(new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date())) % 24
  return h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

/** A different nickname each visit; the page is rendered per request, so this is fresh every time. */
function pickOne(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)]
}

/** Where a game has been played, so the rating that is still missing is worth asking for. */
const played: Status[] = ['zerado', 'rejogar', 'abandonado', 'pausado', 'jogando']

export default async function Home() {
  const [viewer, all, sessions] = await Promise.all([getViewer(), listGames(), listSessions()])
  const games = all.filter((g) => !g.archived)
  const me = viewer?.me
  const name = me && (me.useNicknames && me.nicknames.length ? pickOne(me.nicknames) : me.name)
  const hello = name ? `${greeting()}, ${name}` : 'Boas-vindas ao clube'

  if (games.length === 0) {
    return (
      <div className="page">
        <h1 className="hello">{hello}</h1>
        <MascotMoment moment="peek" size={72} />
        <div className="empty">
          <PairGlyph size={36} />
          <h2 className="h2">A estante ainda está vazia</h2>
          <p className="body">
            Quando vocês adicionarem jogos, aparecem aqui o que estão jogando, o que os dois querem jogar e as últimas sessões.
          </p>
          <div className="empty-actions">
            <Link className="btn btn--both" href="/adicionar">Adicionar o primeiro jogo</Link>
            <Link className="btn" href="/biblioteca">Abrir a biblioteca</Link>
          </div>
        </div>
      </div>
    )
  }

  const current = games.find((g) => g.shared === 'jogando')
  const matches = games.filter(isMatch)
  const recent = games.slice(0, 8)
  const titles = new Map(all.map((g) => [g.id, g.title]))
  const lastSessions = sessions.slice(0, 3)
  const mine = viewer?.me.person
  const partner: Person | undefined = mine && (mine === 'danilo' ? 'maellen' : 'danilo')
  const unrated = mine && partner
    ? games
        .filter((g) => g.ratings[mine] === null && played.includes(g.marks[mine].status))
        .sort((a, b) => played.indexOf(a.marks[mine].status) - played.indexOf(b.marks[mine].status))
        .slice(0, 3)
    : []

  return (
    <div className="page home">
      <div className="title-row">
        <h1 className="hello" data-person={viewer?.me.person}>{hello}</h1>
        <MascotMoment moment="appear" once="home" size={52} />
      </div>

      <div className="home-top">
        {current && (
          <GameLink className="now press" id={current.id} slot="now">
            <Cover title={current.title} src={current.cover} eager />
            <span className="now-text">
              <span className="now-label">Vocês estão jogando</span>
              <span className="now-title">{current.title}</span>
              <span className="now-go">Continuar</span>
            </span>
          </GameLink>
        )}

        <Link className="draw-entry press" href="/sortear">
          <span className="draw-entry-text">
            <span className="draw-entry-title">O que vamos jogar hoje?</span>
            <span className="draw-entry-sub">
              {matches.length > 0 ? `${matches.length} ${matches.length === 1 ? 'jogo que nós dois queremos' : 'jogos que nós dois queremos'}. A gente sorteia um.` : 'A gente sorteia um para hoje, sem discussão.'}
            </span>
          </span>
          <PairGlyph size={44} />
        </Link>
      </div>

      <section className="sec" aria-labelledby="h-match">
        <div className="sec-head">
          <h2 className="h2" id="h-match">
            <PairGlyph size={18} />
            Nós dois queremos jogar
          </h2>
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

      <section className="sec" aria-labelledby="h-novos">
        <div className="sec-head">
          <h2 className="h2" id="h-novos">Adicionados por último</h2>
          <Link className="sec-link" href="/biblioteca">Ver a biblioteca</Link>
        </div>
        <Shelf label="Jogos adicionados por último">
          {recent.map((g, i) => (
            <li key={g.id}><GameCard game={g} tilt={i % 2 ? 'b' : 'a'} /></li>
          ))}
        </Shelf>
      </section>

      <div className="home-pair">
        {mine && partner && unrated.length > 0 && (
          <section className="sec" aria-labelledby="h-nota">
            <h2 className="h2" id="h-nota">Falta a sua nota</h2>
            <ul className="rows">
              {unrated.map((g) => (
                <li key={g.id}>
                  <GameLink className="row" id={g.id} slot="row" query="?avaliar=1">
                    <Cover title={g.title} src={g.cover} />
                    <span className="row-text">
                      <span className="row-title">{g.title}</span>
                      <span className="row-meta">
                        {g.ratings[partner] !== null ? `${viewer?.partner?.name ?? 'O outro sócio'} já deu a nota. Falta você.` : 'Você ainda não deu nota.'}
                      </span>
                    </span>
                    <span className="row-go">Dar nota</span>
                  </GameLink>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="sec" aria-labelledby="h-sessoes">
          <div className="sec-head">
            <h2 className="h2" id="h-sessoes">Últimas sessões</h2>
            <Link className="sec-link" href="/diario">Abrir o diário</Link>
          </div>
          {lastSessions.length ? (
            <div className="notes">
              {lastSessions.map((s) => <SessionNote key={s.id} session={s} title={titles.get(s.gameId) ?? 'Jogo removido'} />)}
            </div>
          ) : (
            <p className="quiet">Depois de jogar, registrem a sessão no diário: quanto tempo durou e o que aconteceu de bom.</p>
          )}
        </section>
      </div>
    </div>
  )
}
