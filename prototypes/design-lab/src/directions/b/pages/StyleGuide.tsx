import { useState } from 'react'
import { Marker } from '../components/Marker'
import { games, type Game } from '../../../data/games'
import { meta } from '../meta'
import { Overlap, RatingLine } from '../components/Overlap'
import { Cover, GameCard, Mark, Stamp, StatusTag, WhoMarks } from '../components/Marks'
import { IconCheck, IconClose, IconPlus, PairGlyph } from '../components/icons'
import { isMatch } from '../../../data/games'
import { burst } from '../lib/media'
import { DrawReveal } from './Draw'
import StyleStates from './StyleStates'
import StyleNew from './StyleNew'

const sample = games.find((g) => g.id === 'it-takes-two') as Game
const longTitle: Game = { ...sample, id: 'longo', title: 'Keep Talking and Nobody Explodes: edição com um subtítulo comprido demais para caber' }
const noCover: Game = { ...sample, id: 'sem-capa', steamId: 0, title: 'Jogo cadastrado à mão' }
const drawSample = games.find((g) => g.id === 'sons-of-the-forest') as Game

const scale = [
  { cls: 'hello', name: 'Display, Bricolage Grotesque 750, largura 80', text: 'Boa noite, Mahdame' },
  { cls: 'h1', name: 'Título de página, Bricolage Grotesque 700, largura 85', text: 'O que vamos jogar hoje?' },
  { cls: 'h2', name: 'Título de seção, Bricolage Grotesque 650', text: 'Nós dois queremos jogar' },
  { cls: 'h3', name: 'Subtítulo, Bricolage Grotesque 650', text: 'Carimbos de quem zerou' },
  { cls: 'body', name: 'Texto, Onest 400, 16px', text: 'Uma pessoa vê a bomba, a outra tem o manual. O resto é comunicação sob pressão.' },
  { cls: 'quiet', name: 'Apoio, Onest 400, 15px', text: 'Última sessão sábado, 14 de nov., 2 h 30 min' },
]

export default function StyleGuide() {
  const [stampKey, setStampKey] = useState(0)
  const [mWants, setMWants] = useState(false)
  const [drawKey, setDrawKey] = useState(0)
  const [agree, setAgree] = useState(false)
  const [chipOn, setChipOn] = useState(true)
  const [markKey, setMarkKey] = useState(0)

  return (
    <div className="page style">
      <h1 className="h1">Paleta, tipografia e motion</h1>
      <p className="style-idea">{meta.idea}</p>

      <section className="sec" aria-labelledby="st-paleta">
        <h2 className="h2" id="st-paleta">Paleta</h2>
        <ul className="swatches">
          {meta.palette.map((c) => (
            <li key={c.hex}>
              <span className="swatch" style={{ background: c.hex }} />
              <strong>{c.name}</strong>
              <code>{c.hex}</code>
              <span className="quiet">{c.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sec" aria-labelledby="st-tipo">
        <h2 className="h2" id="st-tipo">Tipografia</h2>
        <ul className="specimens">
          {scale.map((s) => (
            <li key={s.cls}>
              <p className={s.cls}>{s.text}</p>
              <p className="specimen-name">{s.name}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="sec" aria-labelledby="st-marcas">
        <h2 className="h2" id="st-marcas">De quem é</h2>
        <div className="demo-row">
          <span className="demo-item"><Mark person="danilo" size={36} named={false} /> Danilo</span>
          <span className="demo-item"><Mark person="maellen" size={36} named={false} /> Maellen</span>
          <span className="demo-item"><WhoMarks who={['danilo', 'maellen']} size={36} /> Juntos</span>
          <span className="demo-item"><PairGlyph size={30} /> Nós dois</span>
          <span className="demo-item"><Stamp person="danilo" /> <Stamp person="maellen" /> Carimbos</span>
        </div>
        <p className="quiet">Com foto no perfil, ela entra no lugar da inicial, dentro do anel da cor da pessoa e com a inicial num selo no canto. Os carimbos continuam sendo a inicial em tinta.</p>
        <h3 className="h3">Marca-texto</h3>
        <p className="body" key={`b${markKey}`}>
          Número ou frase curta que é dos dois, no meio de um texto: nota de nós dois <Marker>7,69</Marker>, <Marker>23 h 30 min</Marker> jogando juntos, <Marker>Nós dois queremos jogar</Marker>.
        </p>
        <p className="marker-big" key={`m${markKey}`}><Marker>9,75</Marker> <Marker>8,5</Marker> <Marker>24 h</Marker></p>
        <button type="button" className="btn btn--plain" onClick={() => setMarkKey((k) => k + 1)}>Riscar de novo</button>
        <p className="quiet">Um traço de marca-texto mostarda atrás do texto, sem contorno e sem sombra, com três variações para não repetir o mesmo traço. Ele é riscado da esquerda para a direita uma vez, quando aparece; o texto não se mexe. Botões, chips e pílulas continuam como eram.</p>
        <h3 className="h3">Comemoração única</h3>
        <div className="demo-row">
          <button type="button" className="btn btn--plain" onClick={(e) => burst(e.currentTarget)}>Soltar o papel picado</button>
          <span className="quiet">Só acontece quando o segundo carimbo cai e o jogo vira “Zeramos juntos”.</span>
        </div>
      </section>

      <section className="sec" aria-labelledby="st-comp">
        <h2 className="h2" id="st-comp">Componentes</h2>
        <h3 className="h3">Botões</h3>
        <div className="demo-row">
          <button type="button" className="btn btn--both">Sortear</button>
          <button type="button" className="btn btn--ink">Guardar nota</button>
          <button type="button" className="btn btn--plain"><IconPlus size={20} />Registrar sessão</button>
          <button type="button" className="btn btn--both" disabled>Desativado</button>
          <button type="button" className="link">Limpar tudo</button>
        </div>
        <h3 className="h3">Chips</h3>
        <div className="demo-row">
          <button type="button" className={chipOn ? 'chip chip--on' : 'chip'} aria-pressed={chipOn} onClick={() => setChipOn(!chipOn)}>
            {chipOn && <IconCheck size={16} />}Para rir
          </button>
          <button type="button" className="chip">Co-op local</button>
          <button type="button" className="chip chip--on chip--x">Terror<IconClose size={16} /></button>
          <button type="button" className="chip" disabled>Indisponível</button>
        </div>
        <h3 className="h3">Estados</h3>
        <div className="demo-row">
          <StatusTag status="jogando" owner="both" />
          <StatusTag status="pausado" owner="danilo" />
          <StatusTag status="abandonado" owner="maellen" />
          <StatusTag status="zerado" />
          <StatusTag status="quero" />
        </div>
        <h3 className="h3">Notas</h3>
        <div className="demo-grid">
          <div className="rating-card"><RatingLine danilo={9.5} maellen={10} /><p className="quiet">Concordam: os círculos se sobrepõem.</p></div>
          <div className="rating-card"><RatingLine danilo={8.5} maellen={3.5} /><p className="quiet">Discordam: a distância é o gráfico.</p></div>
          <div className="rating-card"><RatingLine danilo={8.5} /><p className="quiet">Só um avaliou: não existe nota de nós dois.</p></div>
        </div>
        <h3 className="h3">Capas</h3>
        <ul className="grid grid--demo">
          <li><GameCard game={sample} /></li>
          <li><GameCard game={longTitle} /></li>
          <li><GameCard game={noCover} /></li>
          <li><GameCard game={drawSample} tilt="a" /></li>
        </ul>
      </section>

      <section className="sec" aria-labelledby="st-motion">
        <h2 className="h2" id="st-motion">Motion</h2>
        <p className="quiet">Com “reduzir movimento” ligado no sistema, tudo abaixo vira um fade curto ou nada.</p>
        <div className="demo-grid">
          <div className="motion-demo">
            <h3 className="h3">Carimbo a dois</h3>
            <div className="motion-stage">
              <Stamp key={`d${stampKey}`} person="danilo" press={stampKey > 0} />
              <Stamp key={`m${stampKey}`} person="maellen" press={stampKey > 0} delay={160} />
            </div>
            <button type="button" className="btn btn--plain" onClick={() => setStampKey((k) => k + 1)}>Carimbar de novo</button>
          </div>
          <div className="motion-demo">
            <h3 className="h3">A sobreposição</h3>
            <div className="motion-stage">
              <Overlap danilo maellen={mWants} size={72} label={mWants ? 'Nós dois queremos jogar' : 'Danilo quer, falta a Maellen'} />
            </div>
            <button type="button" className="btn btn--plain" onClick={() => setMWants(!mWants)}>{mWants ? 'Maellen desiste' : 'Maellen diz “quero”'}</button>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Nota guardada</h3>
            <div className="motion-stage"><RatingLine danilo={8} maellen={agree ? 8.5 : 4} /></div>
            <button type="button" className="btn btn--plain" onClick={() => setAgree(!agree)}>{agree ? 'Maellen muda para 4' : 'Maellen muda para 8,5'}</button>
          </div>
          <div className="motion-demo motion-demo--tall">
            <h3 className="h3">Sorteio: a fila freia no escolhido</h3>
            <div className="motion-stage motion-stage--draw">
              <DrawReveal key={drawKey} pool={games.filter(isMatch)} picked={drawSample} animate={drawKey > 0} />
            </div>
            <button type="button" className="btn btn--plain" onClick={() => setDrawKey((k) => k + 1)}>Sortear de novo</button>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Apertar</h3>
            <div className="motion-stage">
              <button type="button" className="btn btn--both btn--big">Aperte e segure</button>
            </div>
            <p className="quiet">O que se aperta afunda 2px e a sombra encolhe.</p>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Painel de filtros</h3>
            <div className="motion-stage"><Cover game={sample} /></div>
            <p className="quiet">Sobe de baixo no celular e entra pela direita no desktop. Veja em Biblioteca, botão Filtros.</p>
          </div>
        </div>
      </section>

      <StyleNew />
      <StyleStates />
    </div>
  )
}
