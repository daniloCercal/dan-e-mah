import type { Metadata } from 'next'
import { Suspense } from 'react'
import { listGames } from '@/lib/data/games'
import { listSavedFilters, listTags } from '@/lib/data/tags'
import { LibraryView } from './LibraryView'

export const metadata: Metadata = { title: 'Biblioteca' }

export default async function Library() {
  const [games, tags, saved] = await Promise.all([listGames(), listTags(), listSavedFilters()])
  // useSearchParams in the view needs a boundary; the data is already here, so nothing visible waits on it.
  return (
    <Suspense>
      <LibraryView games={games} tags={tags} saved={saved} />
    </Suspense>
  )
}
