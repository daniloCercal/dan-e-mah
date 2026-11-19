// MOCK DATA — real game titles with invented personal data (ratings, comments, sessions).
// Nothing here comes from a real account. Artwork is fetched by scripts/fetch-covers.mjs.

export type PersonId = 'danilo' | 'maellen'

export const people: Record<PersonId, { id: PersonId; name: string; initial: string }> = {
  danilo: { id: 'danilo', name: 'Danilo', initial: 'D' },
  maellen: { id: 'maellen', name: 'Maellen', initial: 'M' },
}

export const maellenNicknames = ['Mahsterchef', 'Mahdame', 'Mahgnata', 'Mahnhosa', 'Mahmimada'] as const

export type Status = 'quero' | 'lista' | 'jogando' | 'pausado' | 'zerado' | 'abandonado' | 'rejogar'

export const statusLabels: Record<Status, string> = {
  quero: 'Quero jogar',
  lista: 'Na nossa lista',
  jogando: 'Jogando',
  pausado: 'Pausado',
  zerado: 'Zerado',
  abandonado: 'Abandonado',
  rejogar: 'Quero rejogar',
}

export const taxonomy = {
  genres: ['Terror', 'Sobrevivência', 'Puzzle', 'Aventura', 'RPG', 'Estratégia', 'Simulação', 'Plataforma', 'Ação', 'Festa'],
  modes: ['Co-op online', 'Co-op local', 'Competitivo', 'Single-player', 'Crossplay'],
  traits: ['História', 'Mundo aberto', 'Construção de base', 'Crafting', 'Roguelike', 'Investigação', 'Exploração', 'Relaxante', 'Difícil', 'Casual'],
  moods: ['Para rir', 'Para tomar susto', 'Para relaxar', 'Para passar raiva', 'Sessão rápida', 'Para jogar por horas', 'Para zerar no fim de semana'],
  custom: ['Noite de sexta', 'Com pizza'],
} as const

export const taxonomyLabels = {
  genres: 'Gênero',
  modes: 'Modo de jogo',
  traits: 'Características',
  moods: 'Humor ou ocasião',
  custom: 'Nossas tags',
} as const

export type TaxonomyGroup = keyof typeof taxonomy

export interface Review {
  rating: number // 0–10, steps of 0.5
  comment?: string
  date: string // ISO
  recommends: boolean
  wouldReplay: boolean
}

export interface PersonalState {
  status: Status
  wants: boolean
  owned: boolean
  review?: Review
}

export interface Game {
  id: string
  steamId: number
  title: string
  year: number
  developer: string
  description: string
  genres: string[]
  modes: string[]
  traits: string[]
  moods: string[]
  custom: string[]
  /** Shared status of the pair — independent from each person's own status. */
  shared: Status
  personal: Record<PersonId, PersonalState>
  addedAt: string
  inLibrary: boolean
}

export interface Session {
  id: string
  gameId: string
  date: string
  minutes: number
  who: PersonId[]
  note?: string
  moment?: string
}

type P = [status: Status, wants: 0 | 1, owned: 0 | 1, rating?: number, comment?: string, date?: string, recommends?: 0 | 1, replay?: 0 | 1]

function person(p: P): PersonalState {
  const [status, wants, owned, rating, comment, date, recommends, replay] = p
  return {
    status,
    wants: !!wants,
    owned: !!owned,
    review:
      rating === undefined
        ? undefined
        : { rating, comment, date: date ?? '2026-08-01', recommends: recommends !== 0, wouldReplay: !!replay },
  }
}

interface Row {
  id: string
  steamId: number
  title: string
  year: number
  developer: string
  description: string
  genres: string[]
  modes: string[]
  traits?: string[]
  moods?: string[]
  custom?: string[]
  shared?: Status
  d?: P
  m?: P
  addedAt?: string
}

const none: P = ['lista', 0, 0]

function game(r: Row, inLibrary = true): Game {
  return {
    id: r.id,
    steamId: r.steamId,
    title: r.title,
    year: r.year,
    developer: r.developer,
    description: r.description,
    genres: r.genres,
    modes: r.modes,
    traits: r.traits ?? [],
    moods: r.moods ?? [],
    custom: r.custom ?? [],
    shared: r.shared ?? 'lista',
    personal: { danilo: person(r.d ?? none), maellen: person(r.m ?? none) },
    addedAt: r.addedAt ?? '2026-03-10',
    inLibrary,
  }
}

const library: Row[] = [
  {
    id: 'it-takes-two', steamId: 1426210, title: 'It Takes Two', year: 2021, developer: 'Hazelight Studios',
    description: 'Aventura feita só para dois: um casal transformado em bonecos precisa cooperar em fases que mudam de mecânica o tempo todo.',
    genres: ['Aventura', 'Plataforma'], modes: ['Co-op online', 'Co-op local'], traits: ['História'], moods: ['Para rir', 'Para zerar no fim de semana'], custom: ['Com pizza'],
    shared: 'zerado', addedAt: '2025-11-02',
    d: ['zerado', 0, 1, 9.5, 'A fase do relógio é a melhor coisa que jogamos juntos.', '2026-01-18', 1, 1],
    m: ['zerado', 0, 1, 10, 'Chorei no elefante. Não perdoo.', '2026-01-18', 1, 1],
  },
  {
    id: 'split-fiction', steamId: 2001120, title: 'Split Fiction', year: 2025, developer: 'Hazelight Studios',
    description: 'Duas escritoras presas dentro das próprias histórias, alternando entre ficção científica e fantasia em tela dividida.',
    genres: ['Aventura', 'Ação'], modes: ['Co-op online', 'Co-op local', 'Crossplay'], traits: ['História'], moods: ['Para jogar por horas', 'Para zerar no fim de semana'], custom: ['Noite de sexta'],
    shared: 'jogando', addedAt: '2026-09-20',
    d: ['jogando', 1, 1], m: ['jogando', 1, 1],
  },
  {
    id: 'phasmophobia', steamId: 739630, title: 'Phasmophobia', year: 2020, developer: 'Kinetic Games',
    description: 'Investigação paranormal em equipe: entrar na casa, reunir provas e descobrir qual fantasma está ali antes que ele encontre vocês.',
    genres: ['Terror'], modes: ['Co-op online', 'Crossplay'], traits: ['Investigação'], moods: ['Para tomar susto', 'Sessão rápida'], custom: ['Noite de sexta'],
    shared: 'jogando', addedAt: '2025-12-05',
    d: ['jogando', 1, 1, 8, 'Melhor quando a gente não sabe o que está fazendo.', '2026-03-02', 1, 1],
    m: ['jogando', 1, 1, 6, 'Eu fico no caminhão. Sempre.', '2026-03-03', 1, 0],
  },
  {
    id: 'stardew-valley', steamId: 413150, title: 'Stardew Valley', year: 2016, developer: 'ConcernedApe',
    description: 'Uma fazenda herdada, uma vila cheia de gente e todo o tempo do mundo para plantar, pescar e reformar a casa juntos.',
    genres: ['Simulação', 'RPG'], modes: ['Co-op online', 'Co-op local', 'Single-player'], traits: ['Relaxante', 'Crafting', 'Casual'], moods: ['Para relaxar', 'Para jogar por horas'],
    shared: 'pausado', addedAt: '2025-10-12',
    d: ['pausado', 0, 1, 7.5, 'Gosto, mas a Maellen administra a fazenda como uma empresa.', '2026-02-10', 1, 0],
    m: ['jogando', 1, 1, 9.5, 'Minha fazenda, minhas regras.', '2026-02-11', 1, 1],
  },
  {
    id: 'overcooked-2', steamId: 728880, title: 'Overcooked! 2', year: 2018, developer: 'Ghost Town Games',
    description: 'Cozinhas impossíveis, pedidos acumulando e uma dupla que precisa se organizar aos gritos para servir os pratos a tempo.',
    genres: ['Festa', 'Simulação'], modes: ['Co-op online', 'Co-op local'], traits: ['Casual'], moods: ['Para rir', 'Para passar raiva', 'Sessão rápida'], custom: ['Com pizza'],
    shared: 'zerado', addedAt: '2025-10-30',
    d: ['zerado', 0, 1, 8, 'Três estrelas em tudo ou nada.', '2025-12-20', 1, 1],
    m: ['rejogar', 1, 1, 9, 'Mahsterchef não aceita menos que três estrelas.', '2025-12-20', 1, 1],
  },
  {
    id: 'portal-2', steamId: 620, title: 'Portal 2', year: 2011, developer: 'Valve',
    description: 'Campanha cooperativa de quebra-cabeças com portais, dois robôs e uma inteligência artificial sarcástica avaliando cada erro.',
    genres: ['Puzzle'], modes: ['Co-op online', 'Co-op local', 'Single-player'], traits: ['História'], moods: ['Para rir', 'Para zerar no fim de semana'],
    shared: 'zerado', addedAt: '2025-09-14',
    d: ['zerado', 0, 1, 10, 'Perfeito. Não tem o que tirar.', '2025-11-08', 1, 1],
    m: ['zerado', 0, 1, 8.5, 'Ótimo, mas você me jogou no ácido de propósito.', '2025-11-08', 1, 0],
  },
  {
    id: 'a-way-out', steamId: 1222700, title: 'A Way Out', year: 2018, developer: 'Hazelight Studios',
    description: 'Dois presos planejam uma fuga e precisam confiar um no outro, sempre em tela dividida, do pátio da prisão até o fim da estrada.',
    genres: ['Aventura', 'Ação'], modes: ['Co-op online', 'Co-op local'], traits: ['História'], moods: ['Para zerar no fim de semana'],
    shared: 'zerado', addedAt: '2025-08-22',
    d: ['zerado', 0, 1, 8.5, 'O final ainda dói.', '2025-09-01', 1, 0],
    m: ['zerado', 0, 1, 5, 'Não gostei de como termina e pronto.', '2025-09-01', 0, 0],
  },
  {
    id: 'lethal-company', steamId: 1966720, title: 'Lethal Company', year: 2023, developer: 'Zeekerss',
    description: 'Coletar sucata em luas abandonadas para bater a cota da empresa, torcendo para voltar à nave antes de escurecer.',
    genres: ['Terror', 'Sobrevivência'], modes: ['Co-op online'], traits: ['Exploração'], moods: ['Para rir', 'Para tomar susto', 'Sessão rápida'], custom: ['Noite de sexta'],
    shared: 'jogando', addedAt: '2026-02-14',
    d: ['jogando', 1, 1, 9, 'O jogo mais engraçado que já me matou.', '2026-04-12', 1, 1],
    m: ['jogando', 1, 1, 7.5, undefined, '2026-04-13', 1, 1],
  },
  {
    id: 'valheim', steamId: 892970, title: 'Valheim', year: 2021, developer: 'Iron Gate',
    description: 'Sobrevivência viking em um mundo gerado proceduralmente: construir a base, navegar e enfrentar chefes cada vez maiores.',
    genres: ['Sobrevivência', 'Aventura'], modes: ['Co-op online', 'Crossplay'], traits: ['Mundo aberto', 'Construção de base', 'Crafting', 'Exploração'], moods: ['Para jogar por horas'],
    shared: 'pausado', addedAt: '2026-01-07',
    d: ['pausado', 1, 1, 8.5, 'Quero voltar para terminar o pântano.', '2026-05-20', 1, 1],
    m: ['pausado', 0, 1],
  },
  {
    id: 'dont-starve-together', steamId: 322330, title: "Don't Starve Together", year: 2016, developer: 'Klei Entertainment',
    description: 'Sobreviver ao inverno em um mundo desenhado à mão onde quase tudo quer comer vocês, inclusive a fome.',
    genres: ['Sobrevivência'], modes: ['Co-op online'], traits: ['Crafting', 'Difícil', 'Construção de base'], moods: ['Para passar raiva', 'Para jogar por horas'],
    shared: 'abandonado', addedAt: '2025-07-19',
    d: ['abandonado', 0, 1, 6, 'Bonito, mas cansativo recomeçar toda vez.', '2025-08-30', 0, 0],
    m: ['abandonado', 0, 1, 4.5, 'Morri de fome mais vezes que na vida real.', '2025-08-30', 0, 0],
  },
  {
    id: 'raft', steamId: 648800, title: 'Raft', year: 2022, developer: 'Redbeet Interactive',
    description: 'Uma jangada, um gancho e um tubarão insistente. Pescar destroços até transformar quatro tábuas em uma casa flutuante.',
    genres: ['Sobrevivência', 'Aventura'], modes: ['Co-op online'], traits: ['Construção de base', 'Crafting', 'Exploração', 'Relaxante'], moods: ['Para relaxar', 'Para jogar por horas'],
    shared: 'zerado', addedAt: '2025-06-03',
    d: ['zerado', 0, 1, 8, 'Nossa jangada tinha três andares e nenhuma lógica.', '2025-07-27', 1, 0],
    m: ['zerado', 0, 1, 8.5, 'O tubarão tem nome e é Roberto.', '2025-07-27', 1, 1],
  },
  {
    id: 'deep-rock-galactic', steamId: 548430, title: 'Deep Rock Galactic', year: 2020, developer: 'Ghost Ship Games',
    description: 'Anões mineradores espaciais descendo em cavernas destrutíveis, cada um com sua classe, contra enxames de insetos.',
    genres: ['Ação'], modes: ['Co-op online'], traits: ['Exploração'], moods: ['Sessão rápida', 'Para rir'],
    shared: 'lista', addedAt: '2026-06-11',
    d: ['quero', 1, 1], m: ['lista', 0, 0],
  },
  {
    id: 'terraria', steamId: 105600, title: 'Terraria', year: 2011, developer: 'Re-Logic',
    description: 'Cavar, construir e lutar em um mundo 2D enorme, com centenas de itens e chefes para descobrir no próprio ritmo.',
    genres: ['Aventura', 'Ação'], modes: ['Co-op online', 'Single-player'], traits: ['Mundo aberto', 'Crafting', 'Construção de base', 'Exploração'], moods: ['Para jogar por horas'],
    shared: 'lista', addedAt: '2026-04-02',
    d: ['quero', 1, 1], m: ['quero', 1, 0],
  },
  {
    id: 'cuphead', steamId: 268910, title: 'Cuphead', year: 2017, developer: 'Studio MDHR',
    description: 'Batalhas contra chefes desenhadas como um desenho animado dos anos 30, tão bonitas quanto implacáveis.',
    genres: ['Plataforma', 'Ação'], modes: ['Co-op local', 'Single-player'], traits: ['Difícil'], moods: ['Para passar raiva', 'Sessão rápida'],
    shared: 'pausado', addedAt: '2025-12-28',
    d: ['pausado', 1, 1, 8.5, 'Lindo e cruel.', '2026-02-01', 1, 1],
    m: ['abandonado', 0, 1, 3.5, 'Isso não é diversão, é castigo.', '2026-02-01', 0, 0],
  },
  {
    id: 'unravel-two', steamId: 1225570, title: 'Unravel Two', year: 2018, developer: 'Coldwood Interactive',
    description: 'Dois bonequinhos de lã ligados por um fio atravessam paisagens nórdicas resolvendo puzzles de física com calma.',
    genres: ['Plataforma', 'Puzzle'], modes: ['Co-op local', 'Single-player'], traits: ['Relaxante', 'Casual'], moods: ['Para relaxar', 'Para zerar no fim de semana'],
    shared: 'lista', addedAt: '2026-07-15',
    d: ['lista', 1, 0], m: ['quero', 1, 0],
  },
  {
    id: 'sea-of-thieves', steamId: 1172620, title: 'Sea of Thieves', year: 2018, developer: 'Rare',
    description: 'Um navio, um mapa do tesouro e um oceano compartilhado com outras tripulações que podem ou não ser amigáveis.',
    genres: ['Aventura', 'Ação'], modes: ['Co-op online', 'Competitivo', 'Crossplay'], traits: ['Mundo aberto', 'Exploração'], moods: ['Para rir', 'Para jogar por horas'],
    shared: 'lista', addedAt: '2026-05-09',
    d: ['quero', 1, 0], m: ['lista', 0, 0],
  },
  {
    id: 'the-forest', steamId: 242760, title: 'The Forest', year: 2018, developer: 'Endnight Games',
    description: 'Depois de um acidente de avião, sobreviver em uma floresta habitada por algo que observa o acampamento todas as noites.',
    genres: ['Terror', 'Sobrevivência'], modes: ['Co-op online'], traits: ['Mundo aberto', 'Construção de base', 'Crafting'], moods: ['Para tomar susto', 'Para jogar por horas'],
    shared: 'zerado', addedAt: '2025-05-11',
    d: ['zerado', 0, 1, 8, 'As cavernas são o ponto alto.', '2025-06-22', 1, 0],
    m: ['zerado', 0, 1, 7, 'Construí uma casa na árvore e não desci mais.', '2025-06-22', 1, 0],
  },
  {
    id: 'sons-of-the-forest', steamId: 1326470, title: 'Sons of the Forest', year: 2024, developer: 'Endnight Games',
    description: 'A continuação de The Forest: uma ilha maior, estações do ano e companheiros controlados pelo jogo ajudando na base.',
    genres: ['Terror', 'Sobrevivência'], modes: ['Co-op online'], traits: ['Mundo aberto', 'Construção de base', 'Crafting'], moods: ['Para tomar susto', 'Para jogar por horas'],
    shared: 'lista', addedAt: '2026-08-03',
    d: ['quero', 1, 1], m: ['quero', 1, 1],
  },
  {
    id: 'baldurs-gate-3', steamId: 1086940, title: "Baldur's Gate 3", year: 2023, developer: 'Larian Studios',
    description: 'RPG de mesa transformado em jogo: escolhas com consequência, combate por turnos e uma campanha inteira jogável em dupla.',
    genres: ['RPG', 'Estratégia'], modes: ['Co-op online', 'Co-op local', 'Single-player'], traits: ['História', 'Mundo aberto', 'Exploração'], moods: ['Para jogar por horas'],
    shared: 'pausado', addedAt: '2026-01-25',
    d: ['pausado', 1, 1], m: ['pausado', 1, 1],
  },
  {
    id: 'hades', steamId: 1145360, title: 'Hades', year: 2020, developer: 'Supergiant Games',
    description: 'Fugir do submundo grego uma tentativa de cada vez, com combate rápido e uma história que avança a cada morte.',
    genres: ['Ação', 'RPG'], modes: ['Single-player'], traits: ['Roguelike', 'História', 'Difícil'], moods: ['Sessão rápida'],
    shared: 'lista', addedAt: '2026-03-30',
    d: ['zerado', 0, 1, 9.5, 'Um dos melhores que já joguei sozinho.', '2026-06-14', 1, 1],
    m: ['lista', 0, 0],
  },
  {
    id: 'repo', steamId: 3241660, title: 'R.E.P.O.', year: 2025, developer: 'semiwork',
    description: 'Robôs desajeitados carregando objetos frágeis por lugares assombrados, com física que transforma tudo em comédia.',
    genres: ['Terror', 'Festa'], modes: ['Co-op online'], traits: ['Casual'], moods: ['Para rir', 'Para tomar susto', 'Sessão rápida'], custom: ['Noite de sexta'],
    shared: 'lista', addedAt: '2026-10-02',
    d: ['quero', 1, 0], m: ['quero', 1, 0],
  },
  {
    id: 'we-were-here-together', steamId: 865360, title: 'We Were Here Together', year: 2019, developer: 'Total Mayhem Games',
    description: 'Puzzles em que cada pessoa vê metade da solução e só existe um jeito de avançar: descrever muito bem o que está na tela.',
    genres: ['Puzzle', 'Aventura'], modes: ['Co-op online'], traits: ['Investigação'], moods: ['Para zerar no fim de semana'],
    shared: 'zerado', addedAt: '2026-02-20',
    d: ['zerado', 0, 1, 7.5, undefined, '2026-03-15', 1, 0],
    m: ['zerado', 0, 1],
  },
  {
    id: 'escape-simulator', steamId: 1435790, title: 'Escape Simulator', year: 2021, developer: 'Pine Studio',
    description: 'Salas de escape em primeira pessoa onde quase todo objeto pode ser pego, girado, quebrado ou escondido do parceiro.',
    genres: ['Puzzle'], modes: ['Co-op online', 'Single-player'], traits: ['Investigação', 'Casual'], moods: ['Sessão rápida', 'Para relaxar'], custom: ['Com pizza'],
    shared: 'jogando', addedAt: '2026-08-28',
    d: ['jogando', 1, 1], m: ['jogando', 1, 1, 8, 'Melhor que sala de escape de verdade: dá para pausar.', '2026-09-12', 1, 1],
  },
  {
    id: 'keep-talking', steamId: 341800, title: 'Keep Talking and Nobody Explodes', year: 2015, developer: 'Steel Crate Games',
    description: 'Uma pessoa vê a bomba, a outra tem o manual. O resto é comunicação sob pressão e alguns fios cortados errado.',
    genres: ['Puzzle', 'Festa'], modes: ['Co-op local'], traits: ['Casual'], moods: ['Para rir', 'Para passar raiva', 'Sessão rápida'],
    shared: 'lista', addedAt: '2026-09-05',
    d: ['lista', 0, 0], m: ['quero', 1, 0],
  },
  {
    id: 'moving-out', steamId: 996770, title: 'Moving Out', year: 2020, developer: 'SMG Studio',
    description: 'Simulador de mudança sem nenhum cuidado: arremessar sofás pela janela faz parte do serviço.',
    genres: ['Festa', 'Simulação'], modes: ['Co-op local'], traits: ['Casual'], moods: ['Para rir', 'Sessão rápida'],
    shared: 'lista', addedAt: '2026-07-01',
    d: ['lista', 0, 0], m: ['lista', 0, 0],
  },
  {
    id: 'plateup', steamId: 1599600, title: 'PlateUp!', year: 2022, developer: "It's Happening",
    description: 'Montar e automatizar um restaurante dia após dia, escolhendo cardápio e layout, até a primeira falha encerrar tudo.',
    genres: ['Simulação', 'Estratégia'], modes: ['Co-op online', 'Co-op local'], traits: ['Roguelike', 'Casual'], moods: ['Sessão rápida', 'Para passar raiva'],
    shared: 'lista', addedAt: '2026-10-19',
    d: ['lista', 0, 0], m: ['quero', 1, 1],
  },
  {
    id: 'human-fall-flat', steamId: 477160, title: 'Human Fall Flat', year: 2016, developer: 'No Brakes Games',
    description: 'Bonecos molengas tentando resolver puzzles de física em cenários de sonho, quase sempre do jeito errado.',
    genres: ['Puzzle', 'Plataforma'], modes: ['Co-op online', 'Co-op local'], traits: ['Casual'], moods: ['Para rir', 'Para relaxar'],
    shared: 'zerado', addedAt: '2025-04-18',
    d: ['zerado', 0, 1, 7, 'Divertido por umas horas.', '2025-05-04', 1, 0],
    m: ['zerado', 0, 1, 7.5, undefined, '2025-05-04', 1, 0],
  },
]

const catalogOnly: Row[] = [
  { id: 'content-warning', steamId: 2881650, title: 'Content Warning', year: 2024, developer: 'Landfall', description: 'Filmar os amigos em situações assustadoras para viralizar e pagar o equipamento da próxima expedição.', genres: ['Terror', 'Festa'], modes: ['Co-op online'], moods: ['Para rir', 'Para tomar susto'] },
  { id: 'core-keeper', steamId: 1621690, title: 'Core Keeper', year: 2024, developer: 'Pugstorm', description: 'Mineração e sobrevivência em uma caverna gigante vista de cima, com base, fazenda e chefes.', genres: ['Sobrevivência', 'Aventura'], modes: ['Co-op online'], traits: ['Crafting', 'Construção de base', 'Exploração'] },
  { id: 'grounded', steamId: 962130, title: 'Grounded', year: 2022, developer: 'Obsidian Entertainment', description: 'Encolhidos ao tamanho de formigas, sobreviver no quintal de casa entre insetos gigantes.', genres: ['Sobrevivência', 'Aventura'], modes: ['Co-op online', 'Crossplay'], traits: ['Mundo aberto', 'Crafting', 'Construção de base'] },
  { id: 'chained-together', steamId: 2567870, title: 'Chained Together', year: 2024, developer: 'Anegar Games', description: 'Escalar do inferno até o topo acorrentados um ao outro. Cada queda é dos dois.', genres: ['Plataforma'], modes: ['Co-op online', 'Co-op local'], traits: ['Difícil'], moods: ['Para passar raiva', 'Para rir'] },
  { id: 'outer-wilds', steamId: 753640, title: 'Outer Wilds', year: 2019, developer: 'Mobius Digital', description: 'Um sistema solar pequeno preso em um ciclo de 22 minutos e um mistério que só se resolve explorando.', genres: ['Aventura', 'Puzzle'], modes: ['Single-player'], traits: ['Exploração', 'História', 'Investigação'] },
  { id: 'celeste', steamId: 504230, title: 'Celeste', year: 2018, developer: 'Maddy Makes Games', description: 'Subir uma montanha tela por tela em um jogo de plataforma exigente e gentil ao mesmo tempo.', genres: ['Plataforma'], modes: ['Single-player'], traits: ['Difícil', 'História'] },
  { id: 'elden-ring', steamId: 1245620, title: 'Elden Ring', year: 2022, developer: 'FromSoftware', description: 'Mundo aberto enorme e hostil, com chefes que exigem paciência e liberdade para ir a quase qualquer lugar.', genres: ['RPG', 'Ação'], modes: ['Single-player', 'Co-op online'], traits: ['Mundo aberto', 'Difícil', 'Exploração'] },
  { id: 'hollow-knight', steamId: 367520, title: 'Hollow Knight', year: 2017, developer: 'Team Cherry', description: 'Um reino subterrâneo de insetos desenhado à mão, cheio de caminhos escondidos e combates precisos.', genres: ['Plataforma', 'Ação'], modes: ['Single-player'], traits: ['Exploração', 'Difícil'] },
]

/** Games in the pair's library. */
export const games: Game[] = library.map((r) => game(r))

/** Everything the mock catalog search can return (library games included, so duplicates can be flagged). */
export const catalog: Game[] = [...games, ...catalogOnly.map((r) => game(r, false))]

export const sessions: Session[] = [
  { id: 's12', gameId: 'split-fiction', date: '2026-11-14', minutes: 150, who: ['danilo', 'maellen'], note: 'Chegamos no capítulo do mercado.', moment: 'A Maellen descobriu o atalho antes de mim e não deixou eu esquecer.' },
  { id: 's11', gameId: 'lethal-company', date: '2026-11-08', minutes: 95, who: ['danilo', 'maellen'], moment: 'Batemos a cota faltando dois segundos.' },
  { id: 's10', gameId: 'escape-simulator', date: '2026-11-01', minutes: 60, who: ['danilo', 'maellen'], note: 'Duas salas do pacote egípcio.' },
  { id: 's9', gameId: 'phasmophobia', date: '2026-10-31', minutes: 120, who: ['danilo', 'maellen'], note: 'Especial de Halloween.', moment: 'Era um Poltergeist. Era óbvio. Erramos mesmo assim.' },
  { id: 's8', gameId: 'split-fiction', date: '2026-10-24', minutes: 180, who: ['danilo', 'maellen'] },
  { id: 's7', gameId: 'stardew-valley', date: '2026-10-11', minutes: 200, who: ['maellen'], note: 'Reforma do celeiro.' },
  { id: 's6', gameId: 'lethal-company', date: '2026-10-03', minutes: 80, who: ['danilo', 'maellen'] },
  { id: 's5', gameId: 'baldurs-gate-3', date: '2026-09-19', minutes: 240, who: ['danilo', 'maellen'], note: 'Fim do primeiro ato.' },
  { id: 's4', gameId: 'escape-simulator', date: '2026-09-12', minutes: 75, who: ['danilo', 'maellen'] },
  { id: 's3', gameId: 'valheim', date: '2026-08-30', minutes: 210, who: ['danilo', 'maellen'], moment: 'O troll derrubou a casa inteira.' },
  { id: 's2', gameId: 'overcooked-2', date: '2026-08-16', minutes: 90, who: ['danilo', 'maellen'], note: 'Revanche nas fases de três estrelas.' },
  { id: 's1', gameId: 'phasmophobia', date: '2026-08-02', minutes: 110, who: ['danilo', 'maellen'] },
]

// ---------- helpers ----------

export type ArtKind = 'cover' | 'hero' | 'header'

/** cover = 600×900 portrait, hero = 1920×620 wide art without logo, header = 460×215 with logo. */
export function art(game: Pick<Game, 'steamId'>, kind: ArtKind = 'cover'): string {
  return `/covers/${game.steamId}-${kind}.jpg`
}

export function getGame(id: string | undefined): Game | undefined {
  return catalog.find((g) => g.id === id)
}

export function other(person: PersonId): PersonId {
  return person === 'danilo' ? 'maellen' : 'danilo'
}

/** Joint average — only defined when both have rated. */
export function jointAverage(game: Game): number | undefined {
  const d = game.personal.danilo.review
  const m = game.personal.maellen.review
  if (!d || !m) return undefined
  return (d.rating + m.rating) / 2
}

/** Absolute gap between the two ratings — only defined when both have rated. */
export function ratingGap(game: Game): number | undefined {
  const d = game.personal.danilo.review
  const m = game.personal.maellen.review
  if (!d || !m) return undefined
  return Math.abs(d.rating - m.rating)
}

const finished: Status[] = ['zerado', 'abandonado']

/** A match: both want to play and the pair hasn't finished or dropped it. */
export function isMatch(game: Game): boolean {
  return game.personal.danilo.wants && game.personal.maellen.wants && !finished.includes(game.shared)
}

export function sessionsFor(gameId: string): Session[] {
  return sessions.filter((s) => s.gameId === gameId)
}

export function formatRating(n: number | undefined): string {
  return n === undefined ? '–' : n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', opts)
}

/** Mock catalog search (stands in for IGDB/RAWG). */
export function searchCatalog(query: string): Game[] {
  const q = normalize(query)
  if (q.length < 2) return []
  return catalog.filter((g) => normalize(g.title).includes(q)).slice(0, 8)
}

export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function pickRandom<T>(list: T[], except?: T): T | undefined {
  const pool = list.length > 1 && except !== undefined ? list.filter((x) => x !== except) : list
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Stats computed from the mock data — never hard-coded. */
export function pairStats() {
  const both = games.filter((g) => jointAverage(g) !== undefined)
  const avg = both.length ? both.reduce((sum, g) => sum + (jointAverage(g) ?? 0), 0) / both.length : undefined
  const togetherMinutes = sessions.filter((s) => s.who.length === 2).reduce((sum, s) => sum + s.minutes, 0)
  return {
    total: games.length,
    finished: games.filter((g) => g.shared === 'zerado').length,
    playing: games.filter((g) => g.shared === 'jogando').length,
    matches: games.filter(isMatch).length,
    average: avg,
    togetherMinutes,
    mostDivisive: [...both].sort((a, b) => (ratingGap(b) ?? 0) - (ratingGap(a) ?? 0)).slice(0, 3),
    top: [...both].sort((a, b) => (jointAverage(b) ?? 0) - (jointAverage(a) ?? 0)).slice(0, 5),
  }
}
