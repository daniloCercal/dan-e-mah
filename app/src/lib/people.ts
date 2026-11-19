import type { MascotId } from '@/components/Mascot'

export type Slot = 1 | 2
export type Person = 'danilo' | 'maellen'

export const personOf = (slot: Slot): Person => (slot === 1 ? 'danilo' : 'maellen')
export const slotOf = (person: Person): Slot => (person === 'danilo' ? 1 : 2)
export const initialOf = (person: Person) => (person === 'danilo' ? 'D' : 'M')
export const defaultMascot = (slot: Slot): MascotId => (slot === 1 ? 'fantasma' : 'roxinha')

export interface Member {
  userId: string
  slot: Slot
  person: Person
  name: string
  mascot: MascotId | null
  /** Short-lived signed address of the profile photo, null without one. */
  photo: string | null
  photoPath: string | null
  nicknames: string[]
  useNicknames: boolean
}

export const defaultName = (p: Person) => (p === 'danilo' ? 'Danilo' : 'Maellen')

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
export const allStatuses = Object.keys(statusLabels) as Status[]

export const isFinished = (s: Status) => s === 'zerado' || s === 'rejogar'

/** A match: both want to play it and the pair has not finished or dropped it. */
export const isMatch = (g: { shared: Status; marks: Record<Person, { wants: boolean }> }) =>
  g.marks.danilo.wants && g.marks.maellen.wants && g.shared !== 'zerado' && g.shared !== 'abandonado'

export type Ratings = Record<Person, number | null>

/** The pair's rating exists only when both have rated. */
export const jointAverage = (g: { ratings: Ratings }): number | null =>
  g.ratings.danilo !== null && g.ratings.maellen !== null ? (g.ratings.danilo + g.ratings.maellen) / 2 : null

export const ratingGap = (g: { ratings: Ratings }): number | null =>
  g.ratings.danilo !== null && g.ratings.maellen !== null ? Math.abs(g.ratings.danilo - g.ratings.maellen) : null

export const formatRating = (n: number | null | undefined): string =>
  n === null || n === undefined ? '–' : n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })

/** Short line about how far apart the two ratings are. */
export function gapLine(gap: number): string {
  const n = gap.toLocaleString('pt-BR')
  if (gap >= 4) return `${n} pontos de distância. Nesse aqui o clube rachou ao meio.`
  if (gap >= 2.5) return `${n} pontos de distância. Dá para conversar, mas vai demorar.`
  if (gap >= 1) return `${n} ${gap === 1 ? 'ponto' : 'pontos'} de diferença. Nada que estrague o jantar.`
  if (gap > 0) return 'Meio ponto de diferença. Praticamente a mesma pessoa.'
  return 'Mesma nota, sem combinar. Acontece pouco.'
}
