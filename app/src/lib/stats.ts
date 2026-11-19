import type { GameSummary } from '@/lib/data/games'
import type { Tag } from '@/lib/filters'
import { isMatch, jointAverage, ratingGap } from '@/lib/people'
import { sessionMonths, togetherMinutes, type Session } from '@/lib/sessions'

/** Computed from the games on screen, never stored; the average exists only for games both have rated. */
export function clubStats(all: GameSummary[], tags: Tag[], sessions: Session[] = []) {
  const games = all.filter((g) => !g.archived)
  const both = games.filter((g) => jointAverage(g) !== null)
  const byJoint = [...both].sort((a, b) => (jointAverage(b) ?? 0) - (jointAverage(a) ?? 0))

  const genreOf = new Map(tags.filter((t) => t.kind === 'genero').map((t) => [t.id, t]))
  const genreMap = new Map<number, { count: number; sum: number; rated: number }>()
  for (const g of games) {
    const avg = jointAverage(g)
    for (const id of g.tagIds) {
      if (!genreOf.has(id)) continue
      const row = genreMap.get(id) ?? { count: 0, sum: 0, rated: 0 }
      row.count++
      if (avg !== null) { row.sum += avg; row.rated++ }
      genreMap.set(id, row)
    }
  }
  const genres = [...genreMap.entries()]
    .map(([id, r]) => ({ name: genreOf.get(id)!.name, slug: genreOf.get(id)!.slug, count: r.count, rated: r.rated, average: r.rated ? r.sum / r.rated : null }))
    .filter((g) => g.rated >= 2)
    .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))
    .slice(0, 5)

  return {
    total: games.length,
    finished: games.filter((g) => g.shared === 'zerado').length,
    playing: games.filter((g) => g.shared === 'jogando').length,
    matches: games.filter(isMatch).length,
    average: both.length ? both.reduce((sum, g) => sum + (jointAverage(g) ?? 0), 0) / both.length : null,
    mostDivisive: [...both].filter((g) => (ratingGap(g) ?? 0) > 0).sort((a, b) => (ratingGap(b) ?? 0) - (ratingGap(a) ?? 0)).slice(0, 3),
    top: byJoint.slice(0, 10),
    genres,
    sessions: sessions.length,
    togetherMinutes: togetherMinutes(sessions),
    months: sessionMonths(sessions),
  }
}
