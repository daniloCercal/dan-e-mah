import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getGame } from '@/lib/data/games'
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
  const [viewer, game] = await Promise.all([requireViewer(), getGame(Number(id))])
  if (!game) notFound()
  return <GameDetailView game={game} me={viewer.me.person} />
}
