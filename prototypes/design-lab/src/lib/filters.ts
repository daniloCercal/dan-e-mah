import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  type Game, type PersonId, type Status, type TaxonomyGroup,
  isMatch, jointAverage, normalize, other, statusLabels,
} from '../data/games'

export type Pref = 'match' | 'eu-quero' | 'par-quer' | 'sem-nota' | 'dos-dois' | 'nao-jogado'
export type Sort = 'recentes' | 'titulo' | 'nota' | 'ano'
export type View = 'grade' | 'lista'
export type Logic = 'e' | 'ou'

export const prefLabels = (viewer: PersonId): Record<Pref, string> => ({
  match: 'Nós dois queremos',
  'eu-quero': 'Eu quero jogar',
  'par-quer': viewer === 'danilo' ? 'Maellen quer jogar' : 'Danilo quer jogar',
  'sem-nota': 'Ainda sem a minha nota',
  'dos-dois': 'Os dois já têm',
  'nao-jogado': 'Ainda não jogamos',
})

export const sortLabels: Record<Sort, string> = {
  recentes: 'Adicionados recentemente',
  titulo: 'Título (A–Z)',
  nota: 'Maior nota da dupla',
  ano: 'Lançamento mais recente',
}

export interface FilterState {
  q: string
  genres: string[]
  modes: string[]
  traits: string[]
  moods: string[]
  custom: string[]
  status: Status[]
  prefs: Pref[]
  minRating: number // 0 = off
  logic: Logic // how tags inside the same group combine
  sort: Sort
  view: View
}

const groups: TaxonomyGroup[] = ['genres', 'modes', 'traits', 'moods', 'custom']
const keys: Record<TaxonomyGroup | 'status' | 'prefs', string> = {
  genres: 'genero', modes: 'modo', traits: 'traco', moods: 'humor', custom: 'tag', status: 'status', prefs: 'pref',
}

function list(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key)
  return raw ? raw.split(',').filter(Boolean) : []
}

export function readFilters(params: URLSearchParams): FilterState {
  return {
    q: params.get('q') ?? '',
    genres: list(params, keys.genres),
    modes: list(params, keys.modes),
    traits: list(params, keys.traits),
    moods: list(params, keys.moods),
    custom: list(params, keys.custom),
    status: list(params, keys.status) as Status[],
    prefs: list(params, keys.prefs) as Pref[],
    minRating: Number(params.get('nota') ?? 0) || 0,
    logic: params.get('logica') === 'ou' ? 'ou' : 'e',
    sort: (params.get('ordem') as Sort) ?? 'recentes',
    view: params.get('ver') === 'lista' ? 'lista' : 'grade',
  }
}

export function writeFilters(state: FilterState): URLSearchParams {
  const p = new URLSearchParams()
  if (state.q) p.set('q', state.q)
  for (const g of groups) if (state[g].length) p.set(keys[g], state[g].join(','))
  if (state.status.length) p.set(keys.status, state.status.join(','))
  if (state.prefs.length) p.set(keys.prefs, state.prefs.join(','))
  if (state.minRating) p.set('nota', String(state.minRating))
  if (state.logic === 'ou') p.set('logica', 'ou')
  if (state.sort !== 'recentes') p.set('ordem', state.sort)
  if (state.view === 'lista') p.set('ver', 'lista')
  return p
}

function matchesPref(game: Game, pref: Pref, viewer: PersonId): boolean {
  const me = game.personal[viewer]
  const them = game.personal[other(viewer)]
  switch (pref) {
    case 'match': return isMatch(game)
    case 'eu-quero': return me.wants
    case 'par-quer': return them.wants
    case 'sem-nota': return !me.review && ['zerado', 'abandonado', 'jogando', 'pausado'].includes(me.status)
    case 'dos-dois': return me.owned && them.owned
    case 'nao-jogado': return game.shared === 'lista' || game.shared === 'quero'
  }
}

export function applyFilters(all: Game[], f: FilterState, viewer: PersonId): Game[] {
  const q = normalize(f.q)
  const result = all.filter((game) => {
    if (q && !normalize(`${game.title} ${game.developer}`).includes(q)) return false
    for (const g of groups) {
      const wanted = f[g]
      if (!wanted.length) continue
      const has = (tag: string) => game[g].includes(tag)
      if (f.logic === 'e' ? !wanted.every(has) : !wanted.some(has)) return false
    }
    if (f.status.length && !f.status.includes(game.shared)) return false
    if (!f.prefs.every((p) => matchesPref(game, p, viewer))) return false
    if (f.minRating) {
      const best = jointAverage(game) ?? game.personal[viewer].review?.rating
      if (best === undefined || best < f.minRating) return false
    }
    return true
  })
  const by: Record<Sort, (a: Game, b: Game) => number> = {
    recentes: (a, b) => b.addedAt.localeCompare(a.addedAt),
    titulo: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
    nota: (a, b) => (jointAverage(b) ?? -1) - (jointAverage(a) ?? -1),
    ano: (a, b) => b.year - a.year,
  }
  return result.sort(by[f.sort])
}

export interface Chip {
  key: string
  label: string
  remove: (f: FilterState) => FilterState
}

export function activeChips(f: FilterState, viewer: PersonId): Chip[] {
  const chips: Chip[] = []
  for (const g of groups)
    for (const tag of f[g])
      chips.push({ key: `${g}:${tag}`, label: tag, remove: (s) => ({ ...s, [g]: s[g].filter((t) => t !== tag) }) })
  for (const st of f.status)
    chips.push({ key: `status:${st}`, label: statusLabels[st], remove: (s) => ({ ...s, status: s.status.filter((t) => t !== st) }) })
  const labels = prefLabels(viewer)
  for (const pr of f.prefs)
    chips.push({ key: `pref:${pr}`, label: labels[pr], remove: (s) => ({ ...s, prefs: s.prefs.filter((t) => t !== pr) }) })
  if (f.minRating)
    chips.push({ key: 'nota', label: `Nota ${f.minRating.toLocaleString('pt-BR')} ou mais`, remove: (s) => ({ ...s, minRating: 0 }) })
  return chips
}

export function countActive(f: FilterState): number {
  return groups.reduce((n, g) => n + f[g].length, 0) + f.status.length + f.prefs.length + (f.minRating ? 1 : 0)
}

/** Filters persisted in the URL, so a filtered view can be shared, bookmarked and survives back/forward. */
export function useLibraryFilters() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => readFilters(params), [params])

  const set = useCallback(
    (next: FilterState | ((prev: FilterState) => FilterState)) => {
      setParams((prev) => writeFilters(typeof next === 'function' ? next(readFilters(prev)) : next), { replace: true })
    },
    [setParams],
  )

  const toggle = useCallback(
    (group: TaxonomyGroup | 'status' | 'prefs', value: string) => {
      set((prev) => {
        const current = prev[group] as string[]
        const nextList = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
        return { ...prev, [group]: nextList }
      })
    },
    [set],
  )

  const clear = useCallback(() => set((prev) => ({ ...readFilters(new URLSearchParams()), view: prev.view, sort: prev.sort })), [set])

  return { filters, set, toggle, clear }
}

/** Saved filter presets shown as shortcuts (mock of "filtros favoritos"). */
export const savedFilters: { name: string; query: string }[] = [
  { name: 'Sexta de susto', query: 'genero=Terror&modo=Co-op online' },
  { name: 'Rapidinho para rir', query: 'humor=Para rir,Sessão rápida' },
  { name: 'Nós dois queremos', query: 'pref=match' },
  { name: 'Domingo tranquilo', query: 'humor=Para relaxar' },
]
