import { useCallback, useState, type ReactNode } from 'react'
import { getGame, statusLabels, type Game, type Status } from '../../data/games'
import { usePrefersReducedMotion, useViewer } from '../../lib/viewer'
import { meta } from './meta'
import { Ratings } from './Ratings'
import Reveal, { type RevealPhase } from './Reveal'
import { Billing, Chip, Icon, PageHead, PosterCard, StatusTag, gameCredits } from './ui'

const statuses = Object.keys(statusLabels) as Status[]

const scale: { name: string; className: string; sample: string; spec: string }[] = [
  { name: 'Título de jogo', className: 'spec-display', sample: 'It Takes Two', spec: 'Gloock 400, 40 a 72px, entrelinha 1,02' },
  { name: 'Título de página', className: 'page-title', sample: 'O que vamos jogar?', spec: 'Gloock 400, 34 a 48px' },
  { name: 'Título de seção', className: 'sec-title', sample: 'Nós dois queremos jogar', spec: 'Gloock 400, 24px' },
  { name: 'Nota', className: 'numeral', sample: '9,5', spec: 'Gloock 400, 56px, algarismos alinhados' },
  { name: 'Texto', className: 'spec-body', sample: 'Chegamos no capítulo do mercado, e a Maellen achou o atalho primeiro.', spec: 'Schibsted Grotesk 400, 16px, entrelinha 1,5' },
  { name: 'Metadado', className: 'quiet', sample: '2 h 30 min, os dois', spec: 'Schibsted Grotesk 400, 14px' },
]

export default function StyleGuide() {
  const itt = getGame('it-takes-two') as Game
  const cuphead = getGame('cuphead') as Game
  const valheim = getGame('valheim') as Game
  const { viewer } = useViewer()
  const [chipOn, setChipOn] = useState(true)

  const longTitle: Game = { ...itt, id: 'keep-talking', title: 'Keep Talking and Nobody Explodes: edição de aniversário para dois jogadores', steamId: 341800, year: 2015, shared: 'abandonado' }
  const noCover: Game = { ...itt, id: 'moving-out', title: 'Um jogo cadastrado à mão', steamId: 0, year: 2024, shared: 'lista' }

  return (
    <div className="page style">
      <PageHead title="Paleta, tipografia e motion" />
      <p className="lede">{meta.idea}</p>

      <section className="sec" aria-labelledby="st-palette">
        <h2 id="st-palette" className="sec-title">Paleta</h2>
        <ul className="swatches">
          {meta.palette.map((c) => (
            <li key={c.hex}>
              <span className="swatch" style={{ background: c.hex }} aria-hidden="true" />
              <span className="swatch-name">{c.name}</span>
              <code className="swatch-hex">{c.hex}</code>
              <span className="quiet">{c.role}</span>
            </li>
          ))}
        </ul>
        <p className="quiet">O único degradê é o véu que escurece a arte para o texto continuar legível. O fundo da página do jogo e do sorteio é tingido pela própria capa.</p>
      </section>

      <section className="sec" aria-labelledby="st-type">
        <h2 id="st-type" className="sec-title">Tipografia</h2>
        <ul className="specimens">
          {scale.map((s) => (
            <li key={s.name}>
              <p className={s.className}>{s.sample}</p>
              <p className="quiet">{s.name}: {s.spec}</p>
            </li>
          ))}
          <li>
            <Billing credits={gameCredits(itt, [{ role: 'na companhia de', name: 'Danilo e Maellen' }])} />
            <p className="quiet">Créditos de cartaz: Sofia Sans Extra Condensed, caixa alta. Só aparece uma vez por página, no jogo e no sorteio.</p>
          </li>
        </ul>
      </section>

      <section className="sec" aria-labelledby="st-components">
        <h2 id="st-components" className="sec-title">Componentes</h2>

        <h3 className="spec-label">Botões</h3>
        <div className="btn-row">
          <button type="button" className="btn btn--amber">Sortear</button>
          <button type="button" className="btn btn--light">Continuar</button>
          <button type="button" className="btn btn--line">Registrar sessão</button>
          <button type="button" className="btn btn--line" aria-pressed="true"><Icon name="check" size={18} /> Quero jogar</button>
          <button type="button" className="btn btn--ghost">Cancelar</button>
          <button type="button" className="btn btn--danger">Apagar minha nota</button>
          <button type="button" className="btn btn--amber" disabled>Desativado</button>
        </div>

        <h3 className="spec-label">Chips de filtro</h3>
        <div className="chips">
          <Chip pressed={chipOn} onClick={() => setChipOn((v) => !v)}>Para rir</Chip>
          <Chip pressed={!chipOn} onClick={() => setChipOn((v) => !v)}>Co-op local</Chip>
          <button type="button" className="chip chip--remove">Terror <Icon name="close" size={16} /></button>
        </div>

        <h3 className="spec-label">Etiquetas de estado</h3>
        <p className="status-row">{statuses.map((s) => <StatusTag key={s} status={s} />)}</p>

        <h3 className="spec-label">Notas: os dois avaliaram</h3>
        <Ratings game={itt} viewer={viewer} editing fresh={false} onEdit={() => {}} />
        <h3 className="spec-label">Notas: só um avaliou, sem média</h3>
        <Ratings game={valheim} viewer={viewer} editing fresh={false} onEdit={() => {}} />
        <h3 className="spec-label">Crítica dividida: diferença de 3 pontos ou mais</h3>
        <Ratings game={cuphead} viewer={viewer} editing fresh={false} onEdit={() => {}} />

        <h3 className="spec-label">Capas: normal, título muito longo e sem capa</h3>
        <ul className="grid grid--spec">
          <li><PosterCard game={itt} /></li>
          <li><PosterCard game={longTitle} /></li>
          <li><PosterCard game={noCover} /></li>
        </ul>
      </section>

      <section className="sec" aria-labelledby="st-motion">
        <h2 id="st-motion" className="sec-title">Motion</h2>
        <p className="quiet">Um momento orquestrado e quatro respostas a ações. Com “reduzir movimento” ligado no sistema, tudo vira um corte ou um fade curto.</p>
        <RevealDemo game={itt} />
        <Replay title="Painel de filtros que sobe de baixo" note="280ms, só transform. No desktop entra pela lateral.">
          <div className="demo-stage"><div className="demo-sheet"><span className="sheet-title">Filtros</span></div></div>
        </Replay>
        <Replay title="Nota que assenta ao salvar" note="320ms, sobe 10px e firma.">
          <p className="numeral is-fresh">9,5</p>
        </Replay>
        <Replay title="Fio que se fecha ao marcar como zerado" note="420ms, um fio atravessa a linha do estado.">
          <ul className="states"><li className="state is-settled"><span>A dupla</span><StatusTag status="zerado" /></li></ul>
        </Replay>
        <div className="demo">
          <h3 className="spec-label">Capa que viaja até a página do jogo</h3>
          <p className="quiet">Toque na capa de It Takes Two logo acima, em “Capas”. Usa a View Transitions API; onde ela não existe, a troca é direta.</p>
        </div>
      </section>
    </div>
  )
}

function Replay({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  const [run, setRun] = useState(0)
  return (
    <div className="demo">
      <h3 className="spec-label">{title}</h3>
      <div className="demo-box" key={run}>{children}</div>
      <p className="demo-foot">
        <button type="button" className="btn btn--line btn--small" onClick={() => setRun((r) => r + 1)}>Repetir</button>
        <span className="quiet">{note}</span>
      </p>
    </div>
  )
}

function RevealDemo({ game }: { game: Game }) {
  const reduced = usePrefersReducedMotion()
  const [run, setRun] = useState(0)
  const [phase, setPhase] = useState<RevealPhase>('done')
  const settle = useCallback(() => setPhase('done'), [])
  return (
    <div className="demo">
      <h3 className="spec-label">Sessão de hoje, a revelação do sorteio</h3>
      <div className="demo-reveal">
        <Reveal key={run} game={game} phase={phase} reduced={reduced} onSettle={settle} contained />
      </div>
      <p className="demo-foot">
        <button type="button" className="btn btn--line btn--small" onClick={() => { setPhase('playing'); setRun((r) => r + 1) }}>Repetir</button>
        <span className="quiet">Cerca de 900ms. Um toque pula para o fim.</span>
      </p>
    </div>
  )
}
