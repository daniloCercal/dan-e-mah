import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { statusLabels, type Game, type Status } from '../../../data/games'
import { usePrefersReducedMotion } from '../../../lib/viewer'
import { Flood, RevealCard, RevealTitle } from '../DrawParts'
import { GameCard } from '../GameCard'
import { meta } from '../meta'
import { Landing, Versus } from '../Scoreboard'
import { findGame, lastSession, useStore } from '../store'
import { Chip, Icon, Player, Score, StatusTag } from '../ui'

const lightOnes = ['#FFD23F', '#FF6B5B', '#5CE1C0']

function Demo({ title, where, children, action }: { title: string; where: string; children: ReactNode; action: ReactNode }) {
  return (
    <li className="c-demo">
      <div className="c-demo__stage">{children}</div>
      <div className="c-demo__text">
        <h3 className="c-h3">{title}</h3>
        <p className="c-muted c-small">Ao vivo em <Link to={where}>{where}</Link></p>
        {action}
      </div>
    </li>
  )
}

export default function StyleGuide() {
  const store = useStore()
  const reduced = usePrefersReducedMotion()
  const sample = findGame(store, 'it-takes-two') as Game
  const cuphead = findGame(store, 'cuphead') as Game
  const longTitle: Game = { ...sample, id: 'demo-long', steamId: 0, title: 'Keep Talking and Nobody Explodes: edição definitiva com o manual completo' }
  const broken: Game = { ...sample, id: 'demo-broken', steamId: 999999999, title: 'Capa que não carregou' }
  const [chips, setChips] = useState(['Para rir'])
  const [draw, setDraw] = useState(0)
  const [flip, setFlip] = useState(false)
  const [score, setScore] = useState(0)
  const [stamp, setStamp] = useState(0)
  const [sheet, setSheet] = useState(false)
  const mode = reduced ? 'none' : 'long'

  return (
    <div className="c-style">
      <section className="c-wrap c-page">
        <h1 className="c-h1">Fliperama</h1>
        <p className="c-lead">{meta.idea}</p>
      </section>

      <section className="c-block c-block--surface" aria-labelledby="c-sg-pal">
        <div className="c-wrap">
          <h2 id="c-sg-pal" className="c-h2 c-style__h">Paleta</h2>
          <ul className="c-swatches">
            {meta.palette.map((c) => (
              <li key={c.hex}>
                <span className="c-swatch" style={{ background: c.hex, color: lightOnes.includes(c.hex) ? '#1A0F40' : '#F5F1FF' }}>Aa</span>
                <strong>{c.name}</strong>
                <code>{c.hex}</code>
                <span className="c-muted c-small">{c.role}</span>
              </li>
            ))}
            <li>
              <span className="c-swatch" style={{ background: '#F5F1FF', color: '#1A0F40' }}>Aa</span>
              <strong>Texto</strong><code>#F5F1FF</code>
              <span className="c-muted c-small">Texto principal e o verso das cartas. Secundário: #BDB2E6.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="c-block" aria-labelledby="c-sg-type">
        <div className="c-wrap c-stack">
          <h2 id="c-sg-type" className="c-h2 c-style__h">Tipografia</h2>
          <div className="c-specimen">
            <p className="c-muted c-small">Anybody 800, largura 112%. Título de página</p>
            <p className="c-h1">O que vamos jogar hoje?</p>
          </div>
          <div className="c-specimen">
            <p className="c-muted c-small">Anybody 800, largura 108%. Título de seção</p>
            <p className="c-h2">Nós dois queremos jogar</p>
          </div>
          <div className="c-specimen">
            <p className="c-muted c-small">Anybody, o eixo de largura de 50% a 150%</p>
            <p className="c-axis">
              {[50, 75, 100, 125, 150].map((w) => <span key={w} style={{ fontStretch: `${w}%` }}>Sortear</span>)}
            </p>
          </div>
          <div className="c-specimen">
            <p className="c-muted c-small">Familjen Grotesk 400 e 700, 16 px. Texto e interface</p>
            <p>Um navio, um mapa do tesouro e um oceano compartilhado com outras tripulações. <strong>Registrar sessão</strong>, filtrar por humor, dar nota.</p>
            <p className="c-muted">Texto secundário para apoio, datas e explicações curtas.</p>
          </div>
          <div className="c-specimen">
            <p className="c-muted c-small">Martian Mono 600. Só números de placar, contadores e tempo</p>
            <p className="c-num c-specimen__num">9,75 <span>8,5</span> <span>2 h 30 min</span></p>
          </div>
        </div>
      </section>

      <section className="c-block c-block--surface" aria-labelledby="c-sg-comp">
        <div className="c-wrap c-stack c-style__comps">
          <h2 id="c-sg-comp" className="c-h2 c-style__h">Componentes</h2>

          <h3 className="c-h3">Botões</h3>
          <div className="c-chips">
            <button type="button" className="c-btn c-btn--primary c-btn--big">Sortear</button>
            <button type="button" className="c-btn c-btn--primary">Salvar nota</button>
            <button type="button" className="c-btn">Registrar sessão</button>
            <button type="button" className="c-btn c-btn--quiet">Cancelar</button>
            <button type="button" className="c-btn c-btn--primary" disabled>Desativado</button>
            <button type="button" className="c-link">Limpar tudo</button>
          </div>
          <p className="c-muted c-small">Ao pressionar, o botão desce sobre a borda de tinta. No botão grande, a largura da letra também aperta.</p>

          <h3 className="c-h3">Chips de filtro</h3>
          <div className="c-chips">
            {['Para rir', 'Para tomar susto', 'Sessão rápida'].map((c) => (
              <Chip key={c} pressed={chips.includes(c)} onClick={() => setChips(chips.includes(c) ? chips.filter((x) => x !== c) : [...chips, c])}>{c}</Chip>
            ))}
            <button type="button" className="c-chip c-chip--remove">Terror <Icon name="close" size={16} /></button>
            <span className="c-chip c-chip--tag">Co-op online</span>
          </div>

          <h3 className="c-h3">Estados</h3>
          <div className="c-chips">
            {(Object.keys(statusLabels) as Status[]).map((s) => <StatusTag key={s} status={s} />)}
          </div>

          <h3 className="c-h3">Jogadores e notas</h3>
          <div className="c-chips c-style__players">
            <Player id="danilo" size="lg" /> <Score value={8.5} className="c-style__score" />
            <Player id="maellen" size="lg" /> <Score value={undefined} className="c-style__score" />
          </div>
          <div className="c-style__versus"><Versus game={cuphead} /></div>

          <h3 className="c-h3">Carta de jogo</h3>
          <div className="c-grid c-style__cards">
            <GameCard game={sample} last={lastSession(store, sample.id)} />
            <GameCard game={longTitle} />
            <GameCard game={broken} />
          </div>
          <p className="c-muted c-small">Da esquerda para a direita: capa normal, título muito longo sem capa e capa que falhou ao carregar.</p>
        </div>
      </section>

      <section className="c-block" aria-labelledby="c-sg-motion">
        <div className="c-wrap">
          <h2 id="c-sg-motion" className="c-h2 c-style__h">Motion</h2>
          <p className="c-lead">Um momento orquestrado (o sorteio) e respostas curtas a ações. Com “reduzir movimento” ligado no sistema, tudo aparece sem deslocamento.</p>
          <ul className="c-demos">
            <Demo title="Baralho da noite" where="/c/sortear" action={<button type="button" className="c-btn" onClick={() => setDraw(draw + 1)}>Repetir</button>}>
              <div className="c-demo__draw" key={draw}>
                {draw > 0 && <Flood x={90} y={250} tone="coral" animate={!reduced} slow />}
                <RevealCard game={sample} mode={draw > 0 ? mode : 'none'} />
                <RevealTitle title={sample.title} mode={draw > 0 ? mode : 'none'} />
              </div>
            </Demo>
            <Demo title="Carta com frente e verso" where="/c/biblioteca" action={<button type="button" className="c-btn" onClick={() => setFlip(!flip)}>Virar</button>}>
              <div className="c-demo__card"><GameCard game={cuphead} last={lastSession(store, 'cuphead')} flipped={flip} onFlip={setFlip} /></div>
            </Demo>
            <Demo title="Nota que pousa no placar" where="/c/jogo/valheim" action={<button type="button" className="c-btn" onClick={() => setScore(score + 1)}>Repetir</button>}>
              <div className="c-demo__score"><Player id="danilo" size="lg" /><Landing key={score} value={8.5} fresh={score > 0} /></div>
            </Demo>
            <Demo title="Estado carimbado" where="/c/jogo/it-takes-two" action={<button type="button" className="c-btn" onClick={() => setStamp(stamp + 1)}>Repetir</button>}>
              <motion.div
                key={stamp} initial={stamp ? { scale: 1.9, rotate: -10 } : false} animate={{ scale: 1.4, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 460, damping: 15 }}
              >
                <StatusTag status="zerado" />
              </motion.div>
            </Demo>
            <Demo title="Folha de filtros" where="/c/biblioteca" action={<button type="button" className="c-btn" onClick={() => setSheet(!sheet)}>{sheet ? 'Fechar' : 'Abrir'}</button>}>
              <div className="c-demo__sheet">
                <AnimatePresence>
                  {sheet && (
                    <motion.div
                      className="c-demo__sheetpanel" initial={reduced ? { opacity: 0 } : { y: '100%' }} animate={{ y: 0, opacity: 1 }}
                      exit={reduced ? { opacity: 0 } : { y: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                    >
                      <strong>Humor ou ocasião</strong>
                      <div className="c-chips"><Chip pressed onClick={() => undefined}>Para rir</Chip></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Demo>
          </ul>
          <p className="c-muted c-small">O indicador que desliza entre as abas está na própria navegação: troque de aba para ver.</p>
        </div>
      </section>
    </div>
  )
}
