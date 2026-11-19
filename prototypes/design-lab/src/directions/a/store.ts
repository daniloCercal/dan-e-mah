// In-memory overlay on top of the shared mock data. Nothing here mutates src/data/games.ts,
// so edits made in this direction never leak into the other two.
import { useMemo, useSyncExternalStore } from 'react'
import { games, getGame, sessions as baseSessions, type Game, type Session } from '../../data/games'

interface State {
  overrides: Record<string, Game>
  added: Game[]
  sessions: Session[]
}

let state: State = { overrides: {}, added: [], sessions: [] }
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

function useStore(): State {
  return useSyncExternalStore(subscribe, () => state)
}

function resolve(s: State, id: string | undefined): Game | undefined {
  if (!id) return undefined
  return s.overrides[id] ?? s.added.find((g) => g.id === id) ?? getGame(id)
}

/** The pair's library: shared mock games with local edits applied, plus games added in this visit. */
export function useLibrary(): Game[] {
  const s = useStore()
  return useMemo(() => [...s.added, ...games.map((g) => s.overrides[g.id] ?? g)], [s])
}

export function useGame(id: string | undefined): Game | undefined {
  const s = useStore()
  return resolve(s, id)
}

export function useSessions(): Session[] {
  const s = useStore()
  return useMemo(() => [...s.sessions, ...baseSessions].sort((a, b) => b.date.localeCompare(a.date)), [s])
}

export function updateGame(id: string, change: (game: Game) => Game) {
  const current = resolve(state, id)
  if (!current) return
  const next = change(current)
  if (state.added.some((g) => g.id === id)) {
    commit({ ...state, added: state.added.map((g) => (g.id === id ? next : g)) })
  } else {
    commit({ ...state, overrides: { ...state.overrides, [id]: next } })
  }
}

export function addGame(game: Game) {
  if (resolve(state, game.id)?.inLibrary) return
  commit({ ...state, added: [{ ...game, inLibrary: true }, ...state.added] })
}

export function addSession(session: Omit<Session, 'id'>) {
  commit({ ...state, sessions: [{ ...session, id: `local-${state.sessions.length + 1}` }, ...state.sessions] })
}

export function todayIso(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
