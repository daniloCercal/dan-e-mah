import type { DirectionMeta } from '../../lab/types'

export const meta: DirectionMeta = {
  slug: 'c',
  name: 'Fliperama',
  idea: 'O fliperama particular do casal: a biblioteca é um baralho de cartas, escolher o jogo da noite é tirar uma carta e as notas são um placar de dois jogadores.',
  palette: [
    { name: 'Fundo', hex: '#23125A', role: 'Ultravioleta profundo, a base de todas as telas' },
    { name: 'Superfície', hex: '#2F1A75', role: 'Blocos de seção alternados' },
    { name: 'Superfície elevada', hex: '#3C2594', role: 'Chips, botões secundários, indicador da navegação' },
    { name: 'Ficha', hex: '#FFD23F', role: 'Ação principal e Danilo no placar, sempre com texto Tinta' },
    { name: 'Coral', hex: '#FF6B5B', role: 'Maellen no placar, avisos e a inundação do sorteio' },
    { name: 'Menta', hex: '#5CE1C0', role: 'Zerado, salvo e escolha confirmada' },
    { name: 'Tinta', hex: '#1A0F40', role: 'Texto sobre cores claras, contornos e a borda inferior dos botões' },
  ],
  fonts: [
    { role: 'Títulos (largura variável)', family: 'Anybody', sample: 'O que vamos jogar?' },
    { role: 'Texto e interface', family: 'Familjen Grotesk', sample: 'Segure para embaralhar e solte para tirar a carta.' },
    { role: 'Números do placar', family: 'Martian Mono', sample: '8,5 vs 3,5' },
  ],
  signature: 'Baralho da noite: segure a ficha “Sortear”, as capas embaralham cada vez mais rápido e, ao soltar, uma carta salta, vira e pousa enquanto um bloco de cor chapada inunda o fundo a partir do dedo.',
  motion: [
    { name: 'Baralho da noite (embaralhar, virar, inundar)', where: '/c/sortear' },
    { name: 'Carta com frente e verso (botão “virar”)', where: '/c/biblioteca' },
    { name: 'Nota que pousa no placar ao salvar', where: '/c/jogo/valheim' },
    { name: 'Estado carimbado ao mudar', where: '/c/jogo/it-takes-two' },
    { name: 'Folha de filtros e chips que afundam', where: '/c/biblioteca' },
    { name: 'Indicador deslizante da navegação', where: '/c' },
  ],
}
