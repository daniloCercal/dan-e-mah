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
}

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
