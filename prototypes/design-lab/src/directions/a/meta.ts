import type { DirectionMeta } from '../../lab/types'

export const meta: DirectionMeta = {
  slug: 'a',
  name: 'Sala de projeção',
  idea: 'A biblioteca é um cinema particular para dois: cada jogo é um filme em cartaz e a escolha da noite é uma estreia.',
  palette: [
    { name: 'Fundo', hex: '#0E1116', role: 'Azul-noite quase preto, base de todas as telas' },
    { name: 'Superfície', hex: '#181D26', role: 'Painel de filtros, campos e a barra de navegação' },
    { name: 'Linha', hex: '#2A303C', role: 'Fios que separam seções no lugar de caixas' },
    { name: 'Texto', hex: '#EFE9DD', role: 'Títulos e texto principal' },
    { name: 'Texto secundário', hex: '#A29C90', role: 'Metadados, legendas e etiquetas de estado' },
    { name: 'Acento', hex: '#E9B24C', role: 'Âmbar de letreiro: um elemento por tela, sempre a ação principal' },
    { name: 'Sinal', hex: '#D4634A', role: 'Só para “abandonado” e ações destrutivas' },
  ],
  fonts: [
    { role: 'Títulos', family: 'Gloock', sample: 'Hoje tem It Takes Two' },
    { role: 'Texto e interface', family: 'Schibsted Grotesk', sample: 'Nós dois queremos jogar' },
    { role: 'Créditos do cartaz', family: 'Sofia Sans Extra Condensed', sample: 'UM JOGO DE HAZELIGHT STUDIOS' },
  ],
  signature:
    'Os créditos de cartaz: os dados do jogo compostos como o rodapé de um pôster de cinema, na página do jogo e na revelação “Sessão de hoje” do sorteio.',
  motion: [
    { name: 'Sessão de hoje: a capa cresce até virar o fundo e o título sobe por uma linha', where: '/a/sortear' },
    { name: 'Capa que viaja da grade até a página do jogo', where: '/a/biblioteca' },
    { name: 'Painel de filtros que sobe de baixo', where: '/a/biblioteca' },
    { name: 'Nota que assenta ao salvar', where: '/a/jogo/it-takes-two' },
    { name: 'Fio que se fecha ao marcar como zerado', where: '/a/jogo/split-fiction' },
  ],
}
