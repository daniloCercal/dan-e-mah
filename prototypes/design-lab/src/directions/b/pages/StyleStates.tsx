import { useState } from 'react'
import { Link } from 'react-router-dom'
import { games, type Game } from '../../../data/games'
import { B } from '../store'
import { forgetLoaded } from '../lib/latency'
import { Cover } from '../components/Marks'
import { Loader, PageLoader, SkCard, SkNote, SkNow, SkRow } from '../components/Loading'
import { OfflineBanner, SaveButton, SaveError } from '../components/States'

const sample = games.find((g) => g.id === 'stardew-valley') as Game

function Boom(): never {
  throw new Error('Simulated render error from the style page')
}

/** Waiting, failure and entrance states, each one visible and replayable from the style page. */
export default function StyleStates() {
  const [pending, setPending] = useState(false)
  const [coverKey, setCoverKey] = useState(0)
  const [boom, setBoom] = useState(false)

  const fakeSave = () => {
    setPending(true)
    window.setTimeout(() => setPending(false), 1800)
  }

  return (
    <>
      <section className="sec" aria-labelledby="st-espera">
        <h2 className="h2" id="st-espera">Espera</h2>
        <p className="quiet">
          Para ver tudo devagar, ligue “Simular conexão lenta” em <Link to={`${B}/nos`}>Nós</Link> ou acrescente <code>?lento=1</code> ao endereço. <code>?lento=0</code> deixa tudo instantâneo.
        </p>
        <div className="demo-grid">
          <div className="motion-demo">
            <h3 className="h3">Carregando</h3>
            <div className="motion-stage"><PageLoader /></div>
            <p className="quiet">Os círculos se afastam e voltam. Com movimento reduzido, a marca fica parada e o texto continua.</p>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Botão salvando</h3>
            <div className="motion-stage">
              <SaveButton type="button" pending={pending} label="Guardar nota" onClick={fakeSave} />
            </div>
            <p className="quiet">O rótulo troca, o botão trava e a largura não muda. <span className="demo-item"><Loader size={16} /> é o mesmo indicador, pequeno.</span></p>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Capa chegando</h3>
            <div className="motion-stage"><Cover key={coverKey} game={sample} describe /></div>
            <button type="button" className="btn btn--plain" onClick={() => setCoverKey((k) => k + 1)}>Carregar de novo</button>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Esqueleto: jogando agora</h3>
            <div className="sk-group sk-demo" aria-hidden="true"><SkNow /></div>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Esqueleto: capas</h3>
            <div className="sk-group sk-demo sk-demo--cards" aria-hidden="true"><SkCard /><SkCard /><SkCard /></div>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Esqueleto: linhas e notas</h3>
            <div className="sk-group sk-demo" aria-hidden="true"><SkRow /><SkRow /><SkNote /></div>
          </div>
        </div>
        <div className="demo-row demo-row--links">
          <Link className="btn btn--plain" to={B} onClick={forgetLoaded}>Ver o início carregar</Link>
          <Link className="btn btn--plain" to={`${B}/biblioteca`} onClick={forgetLoaded}>Ver a biblioteca carregar</Link>
          <Link className="btn btn--plain" to={`${B}/jogo/cuphead`} onClick={forgetLoaded}>Ver um jogo carregar</Link>
        </div>
      </section>

      <section className="sec" aria-labelledby="st-erros">
        <h2 className="h2" id="st-erros">Quando dá errado</h2>
        <div className="demo-grid demo-grid--two">
          <div className="motion-demo">
            <h3 className="h3">Falha ao salvar</h3>
            <SaveError onRetry={() => undefined} />
            <p className="quiet">Para provocar: ligue “Simular falha ao salvar” em Nós e guarde uma nota. O que foi digitado fica.</p>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Sem conexão</h3>
            <OfflineBanner force />
            <p className="quiet">Aparece sozinho, abaixo do topo, quando o aparelho fica sem rede.</p>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Busca do catálogo fora do ar</h3>
            <p className="quiet">Em Adicionar jogo, digite <code>erro</code> na busca. A tela diz o que houve e oferece tentar de novo ou cadastrar manualmente.</p>
            <Link className="btn btn--plain" to={`${B}/adicionar`}>Abrir Adicionar jogo</Link>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Telas inteiras</h3>
            <div className="demo-row">
              <Link className="btn btn--plain" to={`${B}/jogo/nao-existe`}>Jogo não encontrado</Link>
              <Link className="btn btn--plain" to={`${B}/pagina-que-nao-existe`}>Página não encontrada</Link>
              <button type="button" className="btn btn--plain" onClick={() => setBoom(true)}>Provocar erro inesperado</button>
              {boom && <Boom />}
            </div>
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="st-porta">
        <h2 className="h2" id="st-porta">Entrada e transições</h2>
        <div className="demo-grid demo-grid--two">
          <div className="motion-demo">
            <h3 className="h3">A porta do clube</h3>
            <p className="quiet">Os dois círculos chegam pelos lados e se sobrepõem, em menos de um segundo. Um toque pula. Recarregue a tela para ver de novo.</p>
            <div className="demo-row">
              <Link className="btn btn--plain" to={`${B}/entrar`}>Abrir a entrada</Link>
              <Link className="btn btn--plain" to={`${B}/sem-acesso`}>Ver “sem acesso”</Link>
            </div>
          </div>
          <div className="motion-demo">
            <h3 className="h3">Capa até a página do jogo</h3>
            <p className="quiet">Toque em uma capa: ela viaja até o cabeçalho do jogo, e “Voltar” devolve a capa ao lugar. Em navegador sem suporte, a troca é direta. Entre páginas há só um fade curto.</p>
            <Link className="btn btn--plain" to={`${B}/biblioteca`}>Abrir a biblioteca</Link>
          </div>
        </div>
      </section>
    </>
  )
}
