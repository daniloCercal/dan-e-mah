import type { Metadata } from 'next'
import { listGames } from '@/lib/data/games'
import { listSessions } from '@/lib/data/sessions'
import { isFinished } from '@/lib/people'
import { DiaryView, type DiaryGame } from './DiaryView'

export const metadata: Metadata = { title: 'Diário' }

export default async function Diary() {
  const [sessions, games] = await Promise.all([listSessions(), listGames()])
  const list: DiaryGame[] = games.map((g) => {
    const d = g.marks.danilo
    const m = g.marks.maellen
    const both = isFinished(d.status) && isFinished(m.status)
    // The day the second stamp went on; games finished before dates were kept have none and show only in the strip.
    const date = both ? [d.finishedOn, m.finishedOn].filter((x): x is string => !!x).sort().at(-1) ?? null : null
    return { id: g.id, title: g.title, cover: g.cover, archived: g.archived, together: both, togetherOn: date }
  })
  return <DiaryView sessions={sessions} games={list} />
}
