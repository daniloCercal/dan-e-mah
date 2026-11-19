import { Link } from 'react-router-dom'
import { formatMinutes, isMatch, jointAverage, people, ratingGap, type PersonId } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { Versus } from '../Scoreboard'
import { useStore } from '../store'
import { Cover, Icon, Score } from '../ui'

const order: PersonId[] = ['danilo', 'maellen']

export default function Us() {
  const { viewer, setViewer, greetingName } = useViewer()
  const store = useStore()
  // Same definitions as pairStats(), computed over the live in-memory library so edits made in the prototype show up.
  const both = store.library.filter((g) => jointAverage(g) !== undefined)
  const average = both.length ? both.reduce((sum, g) => sum + (jointAverage(g) ?? 0), 0) / both.length : undefined
  const together = store.sessions.filter((s) => s.who.length === 2).reduce((sum, s) => sum + s.minutes, 0)
  const divisive = [...both].sort((a, b) => (ratingGap(b) ?? 0) - (ratingGap(a) ?? 0)).slice(0, 3)
  const top = [...both].sort((a, b) => (jointAverage(b) ?? 0) - (jointAverage(a) ?? 0)).slice(0, 5)
  const rows: [string, string][] = [
    ['Jogos na estante', String(store.library.length)],
    ['Zerados pela dupla', String(store.library.filter((g) => g.shared === 'zerado').length)],
    ['Jogando agora', String(store.library.filter((g) => g.shared === 'jogando').length)],
    ['Os dois querem jogar', String(store.library.filter(isMatch).length)],
    ['Tempo jogando juntos', formatMinutes(together)],
  ]

  return (
    <div className="c-us">
      <section className="c-wrap c-page">
        <h1 className="c-h1">Nós</h1>
        <div className="c-us__select" role="group" aria-labelledby="c-who-label">
          <p id="c-who-label" className="c-lead">Quem está com o controle?</p>
          <div className="c-us__players">
            {order.map((id, i) => (
              <button key={id} type="button" className={`c-us__player c-us__player--${id}`} aria-pressed={viewer === id} onClick={() => setViewer(id)}>
                <span className="c-us__initial" aria-hidden="true">{people[id].initial}</span>
                <span className="c-us__name">{people[id].name}</span>
                <span className="c-us__slot">Jogador {i + 1}{viewer === id ? ', é você' : ''}</span>
                {viewer === id && <Icon name="check" size={20} />}
              </button>
            ))}
          </div>
          <p className="c-muted c-small">
            No protótipo isso troca quem está vendo o app. {viewer === 'maellen' ? `Hoje a saudação é para ${greetingName}.` : ''}
          </p>
        </div>
      </section>

      <section className="c-block c-block--surface" aria-labelledby="c-stats-title">
        <div className="c-wrap c-us__stats">
          <div>
            <h2 id="c-stats-title" className="c-h2">Placar geral</h2>
            {average !== undefined && (
              <p className="c-us__avg">
                <Score value={average} />
                <span>média da dupla em {both.length} jogos avaliados pelos dois</span>
              </p>
            )}
          </div>
          <dl className="c-us__table">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className="c-num">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="c-block" aria-labelledby="c-div-title">
        <div className="c-wrap">
          <h2 id="c-div-title" className="c-h2">Onde a gente mais discorda</h2>
          <ul className="c-us__divisive">
            {divisive.map((g) => (
              <li key={g.id}>
                <Link to={`/c/jogo/${g.id}`} className="c-us__game"><Cover game={g} kind="header" decorative /> <strong>{g.title}</strong></Link>
                <Versus game={g} quotes={false} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="c-block c-block--surface" aria-labelledby="c-top-title">
        <div className="c-wrap">
          <h2 id="c-top-title" className="c-h2">Recordes da dupla</h2>
          <ol className="c-us__top">
            {top.map((g, i) => (
              <li key={g.id}>
                <Link to={`/c/jogo/${g.id}`} className="c-row" style={{ ['--cols' as string]: '36px 44px 1fr auto' }}>
                  <span className="c-num c-us__rank">{i + 1}º</span>
                  <Cover game={g} decorative />
                  <span className="c-row__title">{g.title}</span>
                  <span className="c-num c-num--joint"><Score value={jointAverage(g)} /></span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
