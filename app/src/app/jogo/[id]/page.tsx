import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getGame } from '@/lib/data/games'
import { getReviews } from '@/lib/data/reviews'
import { listSessions } from '@/lib/data/sessions'
import { listTags } from '@/lib/data/tags'
import { requireViewer } from '@/lib/data/viewer'
import { GameDetailView } from './GameDetailView'

export async function generateMetadata({ params }: PageProps<'/jogo/[id]'>): Promise<Metadata> {
  const { id } = await params
  const game = /^\d+$/.test(id) ? await getGame(Number(id)) : null
  return { title: game?.title ?? 'Jogo' }
}

export default async function GamePage({ params }: PageProps<'/jogo/[id]'>) {
  const { id } = await params
  if (!/^\d{1,12}$/.test(id)) notFound()
  const [viewer, game, tags, reviews, sessions] = await Promise.all([requireViewer(), getGame(Number(id)), listTags(), getReviews(Number(id)), listSessions(Number(id))])
  if (!game) notFound()
  return <GameDetailView game={game} me={viewer.me.person} ourTags={tags.filter((t) => t.kind === 'nossa')} reviews={reviews} sessions={sessions} />
}
