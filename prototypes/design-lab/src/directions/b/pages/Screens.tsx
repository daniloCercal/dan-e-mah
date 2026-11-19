import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { B } from '../store'
import { forgetLoaded, resetOverrides } from '../lib/latency'
import { clearForcedTheme } from '../lib/theme'

interface Screen { name: string; what: string; to: string }
const groups: { area: string; screens: Screen[] }[] = [
  {
    area: 'Entrada',
    screens: [
      { name: 'Entrar', what: 'A porta do clube, com o logo e o botão do Google.', to: 'entrar' },
      { name: 'Entrando', what: 'O botão em espera depois do toque (abra e toque em “Entrar com Google”).', to: 'entrar?lento=1' },
      { name: 'Sem acesso', what: 'O que vê quem entra com uma conta que não é de um dos dois.', to: 'sem-acesso' },
    ],
  },
  {
    area: 'Início',
    screens: [
      { name: 'Início', what: 'Saudação, o jogo em andamento, o sorteio, o que os dois querem, notas pendentes e últimas sessões.', to: '' },
      { name: 'Início carregando', what: 'Esqueletos no formato do conteúdo final.', to: '?lento=1' },
      { name: 'Prateleira e abas', what: 'Com mouse: setas nos lados da prateleira e arrasto; a pílula da aba ativa desliza ao trocar de aba.', to: '' },
    ],
  },
  {
    area: 'Biblioteca',
    screens: [
      { name: 'Grade de capas', what: 'Busca, filtros, ordenação e atalhos salvos.', to: 'biblioteca' },
      { name: 'Lista compacta', what: 'A mesma biblioteca em linhas, com a nota de nós dois.', to: 'biblioteca?ver=lista' },
      { name: 'Filtros abertos', what: 'Painel de filtros, com “Nova tag” no fim.', to: 'biblioteca?filtros=1' },
      { name: 'Filtros ativos', what: 'Chips removíveis, contagem e “Salvar este filtro”.', to: 'biblioteca?genero=Terror&modo=Co-op online' },
      { name: 'Nenhum resultado', what: 'Estado vazio que sugere qual filtro tirar.', to: 'biblioteca?genero=Estratégia&humor=Para tomar susto' },
      { name: 'Seleção de vários', what: 'Marcar jogos e agir em lote: situação, tag, arquivar.', to: 'biblioteca?selecionar=1' },
      { name: 'Biblioteca carregando', what: 'Esqueleto da grade.', to: 'biblioteca?lento=1' },
    ],
  },
  {
    area: 'Jogo',
    screens: [
      { name: 'Página do jogo', what: 'Situações, quem quer, notas, carimbos, tags, sessões, lojas.', to: 'jogo/it-takes-two' },
      { name: 'Notas divergentes', what: 'Um jogo, duas opiniões: a distância entre os círculos é o gráfico.', to: 'jogo/cuphead' },
      { name: 'Avaliar', what: 'Editor de nota no lugar.', to: 'jogo/cuphead?avaliar=1' },
      { name: 'Registrar sessão', what: 'Formulário de sessão dentro da página do jogo.', to: 'jogo/split-fiction?sessao=1' },
      { name: 'Editar jogo', what: 'Título, capa, links de loja e tags. Arquivar e remover ficam em “Gerenciar”.', to: 'jogo/raft?editar=1' },
      { name: 'Falta um carimbo', what: 'Só um dos dois zerou; carimbar aqui dispara a única comemoração.', to: 'jogo/we-were-here-together' },
      { name: 'Jogo carregando', what: 'Esqueleto do cabeçalho e dos blocos.', to: 'jogo/cuphead?lento=1' },
      { name: 'Jogo não encontrado', what: 'Link quebrado ou jogo removido.', to: 'jogo/nao-existe' },
    ],
  },
  {
    area: 'Adicionar',
    screens: [
      { name: 'Buscar', what: 'Busca no catálogo.', to: 'adicionar' },
      { name: 'Resultados', what: 'Resultados com capa; quem já está na biblioteca aparece marcado.', to: 'adicionar?q=it' },
      { name: 'Sem resultado', what: 'Nada encontrado, com o caminho manual.', to: 'adicionar?q=zzzz' },
      { name: 'Cadastro manual', what: 'Título, capa por foto ou endereço, links de lojas e preenchimento pela Steam.', to: 'adicionar?manual=1' },
      { name: 'Busca fora do ar', what: 'O catálogo não respondeu.', to: 'adicionar?q=erro' },
    ],
  },
  {
    area: 'Sortear',
    screens: [
      { name: 'Sortear em fila', what: 'A fila desliza pela mesa por 4,2 s e freia no escolhido (toque em “Sortear”).', to: 'sortear?jeito=fila' },
      { name: 'Sortear em pacote', what: 'Toque em “Sortear” e rasgue o pacote: duas cartas voam e a última vira.', to: 'sortear?jeito=pacote' },
    ],
  },
  {
    area: 'Diário',
    screens: [
      { name: 'Diário', what: 'Sessões por mês e a fileira “Zeramos juntos”.', to: 'diario' },
      { name: 'Registrar sessão pelo diário', what: 'Formulário com escolha do jogo.', to: 'diario?nova=1' },
      { name: 'Editar sessão', what: 'A sessão vira formulário no lugar, com “Remover sessão”.', to: 'diario?editar=s12' },
    ],
  },
  {
    area: 'Nós e perfil',
    screens: [
      { name: 'Nós', what: 'Os dois sócios, números do clube, atividade por mês, top 10, gêneros, divergências, preferências.', to: 'nos' },
      { name: 'Meu perfil', what: 'Foto, nome e, para a Maellen, apelidos.', to: 'perfil' },
      { name: 'Papel de parede', what: 'O desenho do fundo e a intensidade, no perfil.', to: 'perfil#papel' },
      { name: 'Perfil do outro sócio', what: 'Só leitura: cada um muda o seu.', to: 'perfil/maellen' },
    ],
  },
  {
    area: 'Modo escuro',
    screens: [
      { name: 'Início no escuro', what: 'A mesma tela à noite. O link força o escuro só nesta visita.', to: '?tema=escuro' },
      { name: 'Biblioteca no escuro', what: 'Grade de capas, filtros e seleção.', to: 'biblioteca?tema=escuro' },
      { name: 'Jogo no escuro', what: 'Notas divergentes, carimbos e os painéis de cada um.', to: 'jogo/cuphead?tema=escuro' },
      { name: 'Avaliar no escuro', what: 'Editor de nota, régua e chaves.', to: 'jogo/cuphead?avaliar=1&tema=escuro' },
      { name: 'Sorteio em pacote no escuro', what: 'O pacote continua mostarda com tinta escura.', to: 'sortear?jeito=pacote&tema=escuro' },
      { name: 'Nós no escuro', what: 'Números com marca-texto, barras por mês e a chave “Modo escuro”.', to: 'nos?tema=escuro' },
      { name: 'Papel de parede no escuro', what: 'Os desenhos na versão escura; experimente “Forte”.', to: 'perfil?tema=escuro#papel' },
      { name: 'Entrar no escuro', what: 'O logo com contorno e sombra em berinjela clara.', to: 'entrar?tema=escuro' },
      { name: 'Carregando no escuro', what: 'Esqueletos à noite.', to: '?lento=1&tema=escuro' },
      { name: 'Falha ao salvar no escuro', what: 'Guarde a nota: o aviso aparece e o texto fica.', to: 'jogo/cuphead?avaliar=1&falha=1&lento=0&tema=escuro' },
    ],
  },
  {
    area: 'Estados de espera e falha',
    screens: [
      { name: 'Falha ao salvar', what: 'Guarde a nota: o aviso aparece e o que foi digitado fica.', to: 'jogo/cuphead?avaliar=1&falha=1&lento=0' },
      { name: 'Página não encontrada', what: 'Endereço que não existe.', to: 'pagina-que-nao-existe' },
      { name: 'Paleta, tipografia e motion', what: 'Componentes e animações com botões para repetir: modo escuro, pacote, pílula das abas, prateleira, cursor, piscada e o aviso de sem conexão.', to: 'estilo' },
    ],
  },
]

/** Index of every screen and state, for approval. Opening it resets the speed and failure overrides. */
export default function Screens() {
  useEffect(() => {
    resetOverrides()
    // Each link sets its own theme; coming back here drops a theme forced by an earlier link.
    if (!new URLSearchParams(window.location.search).has('tema')) clearForcedTheme()
  }, [])
  return (
    <div className="page telas">
      <h1 className="h1">Todas as telas</h1>
      <p className="telas-lede">
        Cada link abre a tela já no estado descrito. Os links de carregamento e de falha mudam a velocidade só naquela visita; voltar a esta página desfaz.
      </p>
      {groups.map((g) => (
        <section key={g.area} className="sec telas-group" aria-label={g.area}>
          <h2 className="h2">{g.area}</h2>
          <ul className="telas-list">
            {g.screens.map((s) => (
              <li key={s.name}>
                <Link to={`${B}/${s.to}`} onClick={forgetLoaded}>{s.name}</Link>
                <span>{s.what}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
