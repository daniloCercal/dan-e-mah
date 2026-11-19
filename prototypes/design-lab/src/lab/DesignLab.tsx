import { useState } from 'react'
import { Link } from 'react-router-dom'
import { people, type PersonId } from '../data/games'
import { useViewer } from '../lib/viewer'
import { meta as a } from '../directions/a/meta'
import { meta as b } from '../directions/b/meta'
import { meta as c } from '../directions/c/meta'
import type { DirectionMeta } from './types'
import './lab.css'

const directions: DirectionMeta[] = [a, b, c]

const screens = [
  { path: '', label: 'Início' },
  { path: 'biblioteca', label: 'Biblioteca' },
  { path: 'biblioteca?genero=Terror&modo=Co-op online', label: 'Filtros ativos' },
  { path: 'jogo/it-takes-two', label: 'Jogo' },
  { path: 'jogo/cuphead', label: 'Notas divergentes' },
  { path: 'adicionar', label: 'Adicionar jogo' },
  { path: 'sortear', label: 'Sortear' },
  { path: 'diario', label: 'Diário' },
  { path: 'nos', label: 'Nós' },
  { path: 'estilo', label: 'Paleta e motion' },
]

/** Comparison page: the same screen of the three directions side by side, in phone-sized frames. */
export default function DesignLab() {
  const [screen, setScreen] = useState(screens[0])
  const { viewer, setViewer } = useViewer()
  // Frames re-mount when the viewer changes so each one re-reads who is "signed in".
  const frameKey = `${screen.path}|${viewer}`

  return (
    <div className="lab">
      <header className="lab-header">
        <div>
          <h1>Três direções para comparar</h1>
          <p>
            Mesmos dados e mesmas telas em três visuais diferentes. Os dados são fictícios: jogos reais, notas e sessões
            inventadas. Toque em um nome para abrir a direção em tela cheia.
          </p>
        </div>
        <fieldset className="lab-viewer">
          <legend>Ver como</legend>
          {(Object.keys(people) as PersonId[]).map((id) => (
            <label key={id}>
              <input type="radio" name="viewer" checked={viewer === id} onChange={() => setViewer(id)} />
              <span>{people[id].name}</span>
            </label>
          ))}
        </fieldset>
      </header>

      <nav className="lab-screens" aria-label="Tela mostrada nos três quadros">
        {screens.map((s) => (
          <button key={s.label} type="button" aria-pressed={s === screen} onClick={() => setScreen(s)}>
            {s.label}
          </button>
        ))}
      </nav>

      <div className="lab-grid">
        {directions.map((d) => {
          const href = `/${d.slug}/${screen.path}`
          return (
            <section key={d.slug} className="lab-direction" aria-labelledby={`lab-${d.slug}`}>
              <h2 id={`lab-${d.slug}`}>
                <span className="lab-letter">{d.slug.toUpperCase()}</span>
                <Link to={`/${d.slug}`}>{d.name}</Link>
              </h2>
              <p className="lab-idea">{d.idea}</p>

              <div className="lab-frame">
                <iframe key={frameKey} src={href} title={`${d.name}: ${screen.label}`} loading="lazy" />
              </div>
              <p className="lab-open">
                <Link to={href}>Abrir “{screen.label}” em tela cheia</Link>
              </p>

              <h3>Paleta</h3>
              <ul className="lab-palette">
                {d.palette.map((p) => (
                  <li key={p.hex + p.name}>
                    <span className="lab-swatch" style={{ background: p.hex }} aria-hidden="true" />
                    <span>
                      <strong>{p.name}</strong> <code>{p.hex}</code>
                    </span>
                  </li>
                ))}
              </ul>

              <h3>Tipografia</h3>
              <ul className="lab-list">
                {d.fonts.map((f) => (
                  <li key={f.family}>
                    <strong>{f.family}</strong>, {f.role.toLowerCase()}
                  </li>
                ))}
              </ul>

              <h3>O que marca esta direção</h3>
              <p>{d.signature}</p>

              <h3>Movimento</h3>
              <ul className="lab-list">
                {d.motion.map((m) => (
                  <li key={m.name}>
                    <Link to={m.where}>{m.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <footer className="lab-footer">
        <p>
          No celular, cada direção abre em tela cheia pelos links acima. As capturas de todas as telas em 375, 768 e
          1440 px estão na pasta <code>artifacts/screenshots</code> do projeto.
        </p>
      </footer>
    </div>
  )
}
