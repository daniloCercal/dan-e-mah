/** Each direction exports one of these from src/directions/<x>/meta.ts so /design-lab can compare them. */
export interface DirectionMeta {
  slug: 'a' | 'b' | 'c'
  name: string
  /** One sentence, PT-BR, describing the idea in plain words. */
  idea: string
  /** 4–7 named colours actually used by the direction. */
  palette: { name: string; hex: string; role: string }[]
  fonts: { role: string; family: string; sample: string }[]
  /** The one thing this direction should be remembered for. */
  signature: string
  /** Motion moments that can be seen in the prototype, with the route where each lives. */
  motion: { name: string; where: string }[]
}

export const screens = [
  { path: '', label: 'Início' },
  { path: 'biblioteca', label: 'Biblioteca' },
  { path: 'biblioteca?genero=Terror&modo=Co-op online', label: 'Filtros ativos' },
  { path: 'jogo/it-takes-two', label: 'Detalhes do jogo' },
  { path: 'jogo/cuphead', label: 'Notas divergentes' },
  { path: 'adicionar', label: 'Adicionar jogo' },
  { path: 'estilo', label: 'Paleta, tipografia e motion' },
] as const
