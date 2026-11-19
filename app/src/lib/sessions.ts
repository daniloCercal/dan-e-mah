import type { Person } from '@/lib/people'

export interface Session {
  id: number
  gameId: number
  /** YYYY-MM-DD */
  date: string
  minutes: number
  note: string | null
  moment: string | null
  who: Person[]
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { ...opts, timeZone: 'UTC' })
}

export function monthLabel(iso: string): string {
  const text = new Date(`${iso.slice(0, 7)}-15T12:00:00Z`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Time played per month, together (both took part) and solo; oldest first. */
export function sessionMonths(sessions: Session[]) {
  const map = new Map<string, { together: number; solo: number; count: number }>()
  for (const s of sessions) {
    const key = s.date.slice(0, 7)
    const row = map.get(key) ?? { together: 0, solo: 0, count: 0 }
    if (s.who.length === 2) row.together += s.minutes
    else row.solo += s.minutes
    row.count++
    map.set(key, row)
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, r]) => ({ key, label: monthLabel(key), ...r }))
}

export const togetherMinutes = (sessions: Session[]) => sessions.filter((s) => s.who.length === 2).reduce((n, s) => n + s.minutes, 0)
