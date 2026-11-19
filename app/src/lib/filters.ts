import type { GameSummary } from '@/lib/data/games'
import { allStatuses, statusLabels, isMatch, jointAverage, type Person, type Status } from '@/lib/people'

export type TagKind = 'genero' | 'modo' | 'caracteristica' | 'humor' | 'nossa'
export interface Tag { id: number; kind: TagKind; name: string; slug: string }

export type Pref = 'match' | 'eu-quero' | 'par-quer' | 'sem-nota' | 'dos-dois' | 'nao-jogado'
export type Sort = 'recentes' | 'titulo' | 'nota' | 'ano'
export type View = 'grade' | 'lista'
export type Logic = 'e' | 'ou'
export type TagGroup = 'genres' | 'modes' | 'traits' | 'moods' | 'custom'

export const groupKind: Record<TagGroup, TagKind> = { genres: 'genero', modes: 'modo', traits: 'caracteristica', moods: 'humor', custom: 'nossa' }
export const groupLabels: Record<TagGroup, string> = {
  genres: 'Gênero', modes: 'Modo de jogo', traits: 'Características', moods: 'Humor ou ocasião', custom: 'Nossas tags',
}
export const sortLabels: Record<Sort, string> = {
  recentes: 'Adicionados recentemente',
  titulo: 'Título (A–Z)',
  nota: 'Maior nota da dupla',
  ano: 'Lançamento mais recente',
}
export const prefLabels = (me: Person): Record<Pref, string> => ({
  match: 'Nós dois queremos',
  'eu-quero': 'Eu quero jogar',
  'par-quer': me === 'danilo' ? 'Maellen quer jogar' : 'Danilo quer jogar',
  'sem-nota': 'Ainda sem a minha nota',
  'dos-dois': 'Os dois já têm',
  'nao-jogado': 'Ainda não jogamos',
})

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

export const tagGroups: TagGroup[] = ['genres', 'modes', 'traits', 'moods', 'custom']
const keys: Record<TagGroup | 'status' | 'prefs', string> = {
  genres: 'genero', modes: 'modo', traits: 'traco', moods: 'humor', custom: 'tag', status: 'situacao', prefs: 'pref',
}
const prefKeys: Pref[] = ['match', 'eu-quero', 'par-quer', 'sem-nota', 'dos-dois', 'nao-jogado']
const sorts = Object.keys(sortLabels) as Sort[]

const list = (params: URLSearchParams, key: string): string[] => (params.get(key)?.split(',').filter(Boolean) ?? [])

export function readFilters(params: URLSearchParams): FilterState {
  const sort = params.get('ordem')
  const min = Number(params.get('nota') ?? 0)
  return {
    q: params.get('q') ?? '',
    genres: list(params, keys.genres),
    modes: list(params, keys.modes),
    traits: list(params, keys.traits),
    moods: list(params, keys.moods),
    custom: list(params, keys.custom),
    status: list(params, keys.status).filter((s): s is Status => (allStatuses as string[]).includes(s)),
    prefs: list(params, keys.prefs).filter((p): p is Pref => (prefKeys as string[]).includes(p)),
    minRating: Number.isFinite(min) && min > 0 && min <= 10 ? min : 0,
    logic: params.get('logica') === 'ou' ? 'ou' : 'e',
    sort: sorts.find((s) => s === sort) ?? 'recentes',
    view: params.get('vista') === 'lista' ? 'lista' : 'grade',
  }
}

export function writeFilters(state: FilterState): URLSearchParams {
  const p = new URLSearchParams()
  if (state.q) p.set('q', state.q)
  for (const g of tagGroups) if (state[g].length) p.set(keys[g], state[g].join(','))
  if (state.status.length) p.set(keys.status, state.status.join(','))
  if (state.prefs.length) p.set(keys.prefs, state.prefs.join(','))
  if (state.minRating) p.set('nota', String(state.minRating))
  if (state.logic === 'ou') p.set('logica', 'ou')
  if (state.sort !== 'recentes') p.set('ordem', state.sort)
  if (state.view === 'lista') p.set('vista', 'lista')
  return p
}

/** What a saved shortcut keeps: the filters themselves, not the search text, order or view. */
export const shortcutQuery = (f: FilterState): string =>
  writeFilters({ ...f, q: '', sort: 'recentes', view: 'grade' }).toString()

const PLAYED: Status[] = ['zerado', 'abandonado', 'jogando', 'pausado']

function matchesPref(g: GameSummary, pref: Pref, me: Person): boolean {
  const mine = g.marks[me]
  const theirs = g.marks[me === 'danilo' ? 'maellen' : 'danilo']
  switch (pref) {
    case 'match': return isMatch(g)
    case 'eu-quero': return mine.wants
    case 'par-quer': return theirs.wants
    case 'sem-nota': return g.ratings[me] === null && PLAYED.includes(mine.status)
    case 'dos-dois': return mine.owned && theirs.owned
    case 'nao-jogado': return g.shared === 'lista' || g.shared === 'quero'
  }
}

export const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export function applyFilters(all: GameSummary[], f: FilterState, tags: Tag[], me: Person): GameSummary[] {
  const q = fold(f.q)
  const idOf = new Map(tags.map((t) => [`${t.kind}:${t.slug}`, t.id]))
  const result = all.filter((g) => {
    if (g.archived) return false
    if (q && !fold(`${g.title} ${g.developer ?? ''}`).includes(q)) return false
    for (const grp of tagGroups) {
      const wanted = f[grp]
      if (!wanted.length) continue
      const has = (slug: string) => {
        const id = idOf.get(`${groupKind[grp]}:${slug}`)
        return id !== undefined && g.tagIds.includes(id)
      }
      if (f.logic === 'e' ? !wanted.every(has) : !wanted.some(has)) return false
    }
    if (f.status.length && !f.status.includes(g.shared)) return false
    if (!f.prefs.every((p) => matchesPref(g, p, me))) return false
    if (f.minRating) {
      const best = jointAverage(g) ?? g.ratings[me]
      if (best === null || best < f.minRating) return false
    }
    return true
  })
  const by: Record<Sort, (a: GameSummary, b: GameSummary) => number> = {
    recentes: (a, b) => b.addedAt.localeCompare(a.addedAt),
    titulo: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
    nota: (a, b) => (jointAverage(b) ?? -1) - (jointAverage(a) ?? -1),
    ano: (a, b) => (b.year ?? 0) - (a.year ?? 0),
  }
  return result.sort(by[f.sort])
}

export interface Chip { key: string; label: string; remove: (f: FilterState) => FilterState }

export function activeChips(f: FilterState, tags: Tag[], me: Person): Chip[] {
  const chips: Chip[] = []
  for (const g of tagGroups) {
    for (const slug of f[g]) {
      const name = tags.find((t) => t.kind === groupKind[g] && t.slug === slug)?.name ?? slug
      chips.push({ key: `${g}:${slug}`, label: name, remove: (s) => ({ ...s, [g]: s[g].filter((t) => t !== slug) }) })
    }
  }
  for (const st of f.status) chips.push({ key: `status:${st}`, label: statusLabels[st], remove: (s) => ({ ...s, status: s.status.filter((t) => t !== st) }) })
  const labels = prefLabels(me)
  for (const pr of f.prefs) chips.push({ key: `pref:${pr}`, label: labels[pr], remove: (s) => ({ ...s, prefs: s.prefs.filter((t) => t !== pr) }) })
  if (f.minRating) chips.push({ key: 'nota', label: `Nota ${f.minRating.toLocaleString('pt-BR')} ou mais`, remove: (s) => ({ ...s, minRating: 0 }) })
  return chips
}

export const countActive = (f: FilterState): number =>
  tagGroups.reduce((n, g) => n + f[g].length, 0) + f.status.length + f.prefs.length + (f.minRating ? 1 : 0)

export const slugify = (name: string): string =>
  fold(name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
