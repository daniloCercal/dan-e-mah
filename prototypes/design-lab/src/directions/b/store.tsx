import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  games as baseGames, sessions as baseSessions, getGame as getCatalogGame, isMatch, jointAverage, ratingGap, taxonomy,
  type Game, type PersonId, type PersonalState, type Session, type Status,
} from '../../data/games'
import { savedFilters as baseSaved } from '../../lib/filters'

/** Base path of this direction. */
export const B = '/b'

/** What the shared Game type does not carry: own cover, store links, archived flag. */
export interface GameExtra { cover?: string; links?: string[]; archived?: boolean }
export interface Milestone { gameId: string; date: string }
export interface Toast { id: number; text: string; undo?: () => void }
export interface SavedFilter { name: string; query: string }

interface Club {
  /** Library without archived games. */
  games: Game[]
  archived: Game[]
  sessions: Session[]
  milestones: Milestone[]
  customTags: string[]
  saved: SavedFilter[]
  toast: Toast | null
  /** Library first (with in-memory edits), then the mock catalog. */
  findGame: (id: string | undefined) => Game | undefined
  inLibrary: (id: string) => boolean
  extraOf: (id: string | undefined) => GameExtra
  updatePersonal: (id: string, person: PersonId, patch: Partial<PersonalState>) => void
  setShared: (id: string, status: Status) => void
  updateGame: (id: string, patch: Partial<Game>, extra?: GameExtra) => void
  addGame: (game: Game, extra?: GameExtra) => void
  removeGame: (id: string) => void
  setArchived: (ids: string[], on: boolean) => void
  tagGames: (ids: string[], tag: string) => void
  addCustomTag: (tag: string) => string | undefined
  addSession: (session: Omit<Session, 'id'>) => void
  updateSession: (id: string, patch: Partial<Session>) => void
  removeSession: (id: string) => void
  addMilestone: (gameId: string) => void
  saveFilter: (f: SavedFilter) => void
  removeFilter: (name: string) => void
  notify: (text: string, undo?: () => void) => void
  dismissToast: () => void
}

const Ctx = createContext<Club | null>(null)

function clone(g: Game): Game {
  return { ...g, custom: [...g.custom], personal: { danilo: { ...g.personal.danilo }, maellen: { ...g.personal.maellen } } }
}
const byDate = (a: Session, b: Session) => b.date.localeCompare(a.date)
const today = () => new Date().toISOString().slice(0, 10)

/** In-memory copy of the mock data so edits survive navigation without touching the shared module. */
export function ClubProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Game[]>(() => baseGames.map(clone))
  const [extras, setExtras] = useState<Record<string, GameExtra>>({})
  const [sessions, setSessions] = useState<Session[]>(() => [...baseSessions])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [customTags, setCustomTags] = useState<string[]>(() => [...taxonomy.custom])
  const [saved, setSaved] = useState<SavedFilter[]>(() => [...baseSaved])
  const [toast, setToast] = useState<Toast | null>(null)
  const counter = useRef(0)

  const patchExtra = useCallback((ids: string[], patch: GameExtra) => {
    setExtras((e) => {
      const next = { ...e }
      for (const id of ids) next[id] = { ...next[id], ...patch }
      return next
    })
  }, [])
  const map = useCallback((id: string, fn: (g: Game) => Game) => setAll((list) => list.map((g) => (g.id === id ? fn(g) : g))), [])

  const api = useMemo(() => ({
    updatePersonal: (id: string, person: PersonId, patch: Partial<PersonalState>) =>
      map(id, (g) => ({ ...g, personal: { ...g.personal, [person]: { ...g.personal[person], ...patch } } })),
    setShared: (id: string, status: Status) => map(id, (g) => ({ ...g, shared: status })),
    updateGame: (id: string, patch: Partial<Game>, extra?: GameExtra) => {
      map(id, (g) => ({ ...g, ...patch }))
      if (extra) patchExtra([id], extra)
    },
    addGame: (game: Game, extra?: GameExtra) => {
      setAll((list) => (list.some((g) => g.id === game.id) ? list : [{ ...clone(game), inLibrary: true }, ...list]))
      if (extra) patchExtra([game.id], extra)
    },
    removeGame: (id: string) => setAll((list) => list.filter((g) => g.id !== id)),
    setArchived: (ids: string[], on: boolean) => patchExtra(ids, { archived: on }),
    tagGames: (ids: string[], tag: string) =>
      setAll((list) => list.map((g) => (ids.includes(g.id) && !g.custom.includes(tag) ? { ...g, custom: [...g.custom, tag] } : g))),
    addSession: (session: Omit<Session, 'id'>) =>
      setSessions((list) => [{ ...session, id: `n${Date.now()}${list.length}` }, ...list].sort(byDate)),
    updateSession: (id: string, patch: Partial<Session>) =>
      setSessions((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)).sort(byDate)),
    removeSession: (id: string) => setSessions((list) => list.filter((s) => s.id !== id)),
    addMilestone: (gameId: string) => setMilestones((list) => [{ gameId, date: today() }, ...list.filter((m) => m.gameId !== gameId)]),
    saveFilter: (f: SavedFilter) => setSaved((list) => [...list.filter((x) => x.name !== f.name), f]),
    removeFilter: (name: string) => setSaved((list) => list.filter((x) => x.name !== name)),
    notify: (text: string, undo?: () => void) => setToast({ id: ++counter.current, text, undo }),
    dismissToast: () => setToast(null),
  }), [map, patchExtra])

  /** Returns the tag as stored, or undefined when the text is empty. Existing tags are reused, not duplicated. */
  const addCustomTag = useCallback((raw: string) => {
    const tag = raw.trim().replace(/\s+/g, ' ').slice(0, 28)
    if (!tag) return undefined
    const existing = customTags.find((t) => t.toLowerCase() === tag.toLowerCase())
    if (existing) return existing
    setCustomTags((list) => [...list, tag])
    return tag
  }, [customTags])

  const value = useMemo<Club>(() => ({
    games: all.filter((g) => !extras[g.id]?.archived),
    archived: all.filter((g) => extras[g.id]?.archived),
    sessions, milestones, customTags, saved, toast,
    findGame: (id) => all.find((g) => g.id === id) ?? getCatalogGame(id),
    inLibrary: (id) => all.some((g) => g.id === id),
    extraOf: (id) => (id ? extras[id] ?? {} : {}),
    addCustomTag,
    ...api,
  }), [all, extras, sessions, milestones, customTags, saved, toast, addCustomTag, api])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useClub(): Club {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useClub must be used inside ClubProvider')
  return ctx
}

/** Store links of a game: the ones saved by hand, or the Steam page when the mock data has an app id. */
export function linksOf(game: Game, extra: GameExtra): string[] {
  return extra.links ?? (game.steamId ? [`https://store.steampowered.com/app/${game.steamId}`] : [])
}

/** A person counts as having finished when their own status says so — never inferred from the partner. */
export function finishedBy(game: Game, person: PersonId): boolean {
  const s = game.personal[person].status
  return s === 'zerado' || s === 'rejogar'
}

export const allStatuses: Status[] = ['lista', 'quero', 'jogando', 'pausado', 'zerado', 'abandonado', 'rejogar']

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function monthLabel(iso: string): string {
  return capitalize(new Date(`${iso.slice(0, 7)}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))
}

/** Same numbers as the shared pairStats(), computed from the in-memory copy so edits show up, plus a few more. */
export function clubStats(games: Game[], sessions: Session[]) {
  const both = games.filter((g) => jointAverage(g) !== undefined)
  const byJoint = [...both].sort((a, b) => (jointAverage(b) ?? 0) - (jointAverage(a) ?? 0))

  const genreMap = new Map<string, { count: number; sum: number; rated: number }>()
  for (const g of games) {
    const avg = jointAverage(g)
    for (const genre of g.genres) {
      const row = genreMap.get(genre) ?? { count: 0, sum: 0, rated: 0 }
      row.count++
      if (avg !== undefined) {
        row.sum += avg
        row.rated++
      }
      genreMap.set(genre, row)
    }
  }
  const genres = [...genreMap.entries()]
    .map(([name, r]) => ({ name, count: r.count, rated: r.rated, average: r.rated ? r.sum / r.rated : undefined }))
    .filter((g) => g.rated >= 2)
    .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))
    .slice(0, 5)

  const monthMap = new Map<string, { together: number; solo: number; count: number }>()
  for (const s of sessions) {
    const key = s.date.slice(0, 7)
    const row = monthMap.get(key) ?? { together: 0, solo: 0, count: 0 }
    if (s.who.length === 2) row.together += s.minutes
    else row.solo += s.minutes
    row.count++
    monthMap.set(key, row)
  }
  const months = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, r]) => ({ key, label: monthLabel(key), ...r }))

  return {
    total: games.length,
    finished: games.filter((g) => g.shared === 'zerado').length,
    playing: games.filter((g) => g.shared === 'jogando').length,
    matches: games.filter(isMatch).length,
    average: both.length ? both.reduce((sum, g) => sum + (jointAverage(g) ?? 0), 0) / both.length : undefined,
    togetherMinutes: sessions.filter((s) => s.who.length === 2).reduce((sum, s) => sum + s.minutes, 0),
    mostDivisive: [...both].sort((a, b) => (ratingGap(b) ?? 0) - (ratingGap(a) ?? 0)).slice(0, 3),
    top: byJoint.slice(0, 10),
    genres,
    months,
  }
}
