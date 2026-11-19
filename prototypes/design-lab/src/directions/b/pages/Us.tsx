import { Link } from 'react-router-dom'
import { Marker } from '../components/Marker'
import { formatMinutes, formatRating, type PersonId } from '../../../data/games'
import { useViewer } from '../../../lib/viewer'
import { B, clubStats, useClub } from '../store'
import { nameOf } from '../lib/profile'
import { useLoaded } from '../lib/latency'
import { Mark } from '../components/Marks'
import { PageLoader } from '../components/Loading'
import { PairGlyph } from '../components/icons'
import UsStats from './UsStats'
import UsPrefs from './UsPrefs'

export default function Us() {
  const { viewer } = useViewer()
  const { games, sessions } = useClub()
  const ready = useLoaded('nos')
  const stats = clubStats(games, sessions)

  return (
    <div className="page us">
      <h1 className="h1">Nós</h1>

      <section className="sec" aria-labelledby="h-socios">
        <h2 className="h2" id="h-socios">Os dois sócios</h2>
        <ul className="members">
          {(['danilo', 'maellen'] as PersonId[]).map((p) => (
            <li key={p}>
              <Link className="member press" data-person={p} data-me={viewer === p || undefined} to={viewer === p ? `${B}/perfil` : `${B}/perfil/${p}`}>
                <Mark person={p} size={56} named={false} />
                <span className="member-name">{nameOf(p)}</span>
                <span className="member-state">{viewer === p ? 'É você. Editar perfil e foto' : 'Ver perfil'}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {!ready && <PageLoader label="Fazendo as contas do clube" />}

      {ready && (
        <>
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
              <div><dt>nota média de nós dois</dt><dd><Marker>{formatRating(stats.average)}</Marker></dd></div>
              <div><dt>jogando juntos</dt><dd><Marker>{formatMinutes(stats.togetherMinutes)}</Marker></dd></div>
            </dl>
            <p className="quiet">A média só conta jogos que os dois avaliaram. Tudo aqui é calculado do que vocês registraram.</p>
          </section>
          <UsStats stats={stats} />
        </>
      )}

      <UsPrefs />
    </div>
  )
}
