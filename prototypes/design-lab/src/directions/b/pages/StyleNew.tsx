import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import faceSvg from '../assets/rosto-anim.svg?raw'
import { games, isMatch, type Game } from '../../../data/games'
import { B } from '../store'
import { useTheme } from '../lib/theme'
import { useCalm } from '../lib/profile'
import { tile, wallpapers } from '../lib/wallpaper'
import { GameCard } from '../components/Marks'
import { Shelf } from '../components/Shelf'
import { PackReveal } from './PackReveal'

const packSample = games.find((g) => g.id === 'it-takes-two') as Game
const shelfGames = games.filter(isMatch).slice(0, 7)

/** The night palette: same identity, values from the dark block of more.css. */
const darkPalette = [
  { name: 'Fundo', hex: '#1A1326', role: 'Berinjela funda, a página' },
  { name: 'Superfície', hex: '#261C37', role: 'Cartões, campos e painéis' },
  { name: 'Tinta', hex: '#F2EDFB', role: 'Texto e contornos claros' },
  { name: 'Tinta 2', hex: '#B6ABD0', role: 'Texto de apoio' },
  { name: 'Danilo', hex: '#1D7C86', role: 'Preenchimento; carimbo e nota em #5CC3CC' },
  { name: 'Maellen', hex: '#C23A6E', role: 'Preenchimento; carimbo e nota em #F27FAB' },
  { name: 'Nós dois', hex: '#F2C14E', role: 'Igual ao claro, sempre com tinta escura por cima' },
  { name: 'Sombra', hex: '#0B0712', role: 'A sombra dura cai abaixo da página' },
]

const pillTabs = ['Início', 'Biblioteca', 'Nós']

/** Newer pieces of direction B: dark mode, wallpaper, pack draw, nav pill, shelf, pointer feedback, the wink. */
export default function StyleNew() {
  const { dark } = useTheme()
  const calm = useCalm()
  const [packKey, setPackKey] = useState(0)
  const [tab, setTab] = useState(0)
  const [wink, setWink] = useState(0)
  const preview = ['pixels', 'brilhos', 'controles'].flatMap((id) => wallpapers.filter((w) => w.id === id))

  return (
    <>
      <section className="sec" aria-labelledby="st-escuro">
        <h2 className="h2" id="st-escuro">Modo escuro</h2>
        <p className="quiet">
          A mesma identidade à noite. Segue o aparelho até alguém escolher no botão do topo ou em Nós, Preferências.
          Agora a página está no modo {dark ? 'escuro' : 'claro'}.
        </p>
        <ul className="swatches">
          {darkPalette.map((c) => (
            <li key={c.name}>
              <span className="swatch" style={{ background: c.hex }} />
              <strong>{c.name}</strong>
              <code>{c.hex}</code>
              <span className="quiet">{c.role}</span>
            </li>
          ))}
        </ul>
        <p className="quiet">Tudo que é mostarda continua com texto e ícones escuros. Sombras duras viram uma queda escura, e o marca-texto passa a sublinhar o número.</p>
        <div className="demo-row demo-row--links">
          <Link className="btn btn--plain" to={`${B}/estilo?tema=escuro`}>Ver esta página no escuro</Link>
          <Link className="btn btn--plain" to={`${B}/estilo?tema=claro`}>Ver no claro</Link>
        </div>
      </section>

      <section className="sec" aria-labelledby="st-novos">
        <h2 className="h2" id="st-novos">Peças novas</h2>
        <div className="demo-grid">
          <div className="motion-demo motion-demo--tall">
            <h3 className="h3">Sorteio em pacote</h3>
            <div className="motion-stage motion-stage--draw">
              <PackReveal key={packKey} picked={packSample} animate={packKey > 0} />
            </div>
            <button type="button" className="btn btn--plain" onClick={() => setPackKey((k) => k + 1)}>Fechar outro pacote</button>
            <p className="quiet">Rasgue na linha pontilhada, toque ou aperte Enter. Duas cartas voam e a última vira: é o jogo de hoje. O pacote é sempre mostarda com tinta escura, nos dois modos.</p>
          </div>

          <div className="motion-demo">
            <h3 className="h3">Fila mais lenta</h3>
            <p className="quiet">O outro jeito de sortear: a fila desliza por 4,2 segundos e freia devagar no escolhido. Um toque pula. A demonstração está em Motion, acima.</p>
            <Link className="btn btn--plain" to={`${B}/sortear?jeito=fila`}>Abrir o sorteio em fila</Link>
          </div>

          <div className="motion-demo">
            <h3 className="h3">Pílula da aba ativa</h3>
            <div className="motion-stage">
              <div className="pill-demo" role="tablist" aria-label="Demonstração das abas">
                {pillTabs.map((t, i) => (
                  <button key={t} type="button" role="tab" aria-selected={tab === i} className={tab === i ? 'pill-demo-tab active' : 'pill-demo-tab'} onClick={() => setTab(i)}>
                    {tab === i && <motion.span layoutId="b-pill-demo" className="nav-ind" transition={calm ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />}
                    <span className="nav-label">{t}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="quiet">A pílula da aba ativa desliza da aba antiga para a nova, nas barras de cima e de baixo. Com movimento reduzido, ela só troca de lugar.</p>
          </div>

          <div className="motion-demo">
            <h3 className="h3">O rosto pisca</h3>
            <div className="motion-stage">
              <span key={wink} className={wink ? 'face-demo face-demo--wink' : 'face-demo'} aria-hidden="true" dangerouslySetInnerHTML={{ __html: faceSvg }} />
            </div>
            <button type="button" className="btn btn--plain" onClick={() => setWink((k) => k + 1)}>Piscar</button>
            <p className="quiet">No topo, o rosto pisca uma vez quando o cursor ou o foco do teclado chega na marca. No toque, não pisca.</p>
          </div>

          <div className="motion-demo">
            <h3 className="h3">Retorno do cursor</h3>
            <div className="demo-row">
              <button type="button" className="btn btn--both">Botão</button>
              <button type="button" className="chip">Chip</button>
              <button type="button" className="link">Link de texto</button>
            </div>
            <p className="quiet">Com mouse: o que se aperta sobe com a sombra mais dura, chips ganham fundo mostarda claro e links ganham um sublinhado de marca-texto. No toque, só o afundar ao apertar.</p>
          </div>

          <div className="motion-demo">
            <h3 className="h3">Papel de parede</h3>
            <div className="wall-demo" aria-hidden="true">
              {preview.map((w) => {
                const t = tile(w.id, 'forte', dark)
                const k = Math.min(1, 120 / w.size[0])
                return <span key={w.id} className="wall-swatch" style={t ? { backgroundImage: t.image, backgroundSize: `${w.size[0] * k}px ${w.size[1] * k}px` } : undefined} />
              })}
            </div>
            <p className="quiet">Cada um escolhe o desenho do fundo e a intensidade no perfil. Os desenhos têm versão clara e escura.</p>
            <Link className="btn btn--plain" to={`${B}/perfil#papel`}>Escolher no perfil</Link>
          </div>
        </div>

        <h3 className="h3">Prateleira com setas e arrasto</h3>
        <Shelf label="Demonstração da prateleira">
          {shelfGames.map((g, i) => (
            <li key={g.id}><GameCard game={g} tilt={i % 2 ? 'b' : 'a'} /></li>
          ))}
        </Shelf>
        <p className="quiet">No celular, desliza com o dedo. Com mouse, setas nos lados (cada uma some no fim da fila), e dá para arrastar segurando o botão; a capa sob o cursor se endireita e sobe.</p>
      </section>
    </>
  )
}
