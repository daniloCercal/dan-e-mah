// In-memory state for direction C. Shared mock data is never mutated: edits live in copies here.
import { useSyncExternalStore } from 'react'
import {
  catalog, games, sessions as seedSessions,
  type Game, type PersonalState, type PersonId, type Review, type Session, type Status,
} from '../../data/games'

interface State {
  library: Game[]
  sessions: Session[]
}

let state: State = { library: games, sessions: seedSessions }
const listeners = new Set<() => void>()

function commit(next: State) {
  state = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useStore(): State {
  return useSyncExternalStore(subscribe, () => state)
}

/** Library first (it carries edits), then the rest of the mock catalog. */
export function findGame(s: State, id: string | undefined): Game | undefined {
  return s.library.find((g) => g.id === id) ?? catalog.find((g) => g.id === id)
}

function patchGame(id: string, fn: (g: Game) => Game) {
  commit({ ...state, library: state.library.map((g) => (g.id === id ? fn(g) : g)) })
}

export function setPersonal(id: string, who: PersonId, patch: Partial<PersonalState>) {
  patchGame(id, (g) => ({ ...g, personal: { ...g.personal, [who]: { ...g.personal[who], ...patch } } }))
}

export function setReview(id: string, who: PersonId, review: Review) {
  setPersonal(id, who, { review })
}

export function setShared(id: string, shared: Status) {
  patchGame(id, (g) => ({ ...g, shared }))
}

export function addToLibrary(game: Game) {
  if (state.library.some((g) => g.id === game.id)) return
  commit({ ...state, library: [{ ...game, inLibrary: true }, ...state.library] })
}

export function addSession(session: Omit<Session, 'id'>) {
  commit({ ...state, sessions: [{ ...session, id: `n${state.sessions.length + 1}` }, ...state.sessions] })
}

export function todayIso(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function lastSession(s: State, gameId: string): Session | undefined {
  return s.sessions.filter((x) => x.gameId === gameId).sort((a, b) => b.date.localeCompare(a.date))[0]
}

/** Viewer played or finished it but has not rated it yet. */
export function needsRating(game: Game, viewer: PersonId): boolean {
  const me = game.personal[viewer]
  return !me.review && ['zerado', 'abandonado', 'jogando', 'pausado'].includes(me.status)
}
