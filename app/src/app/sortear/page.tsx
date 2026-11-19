import type { Metadata } from 'next'
import Link from 'next/link'
import { listGames } from '@/lib/data/games'
import { listTags } from '@/lib/data/tags'
import { getViewer } from '@/lib/data/viewer'
import { EmptyPage } from '@/components/States'
import { DrawView } from './DrawView'

export const metadata: Metadata = { title: 'Sortear' }

export default async function Draw() {
  const [viewer, games, tags] = await Promise.all([getViewer(), listGames(), listTags()])
  if (!games.some((g) => !g.archived)) {
    return (
      <EmptyPage
        title="O que vamos jogar hoje?"
        heading="Ainda não tem o que sortear"
        actions={<Link className="btn btn--both" href="/adicionar">Adicionar jogo</Link>}
      >
        <p>O sorteio usa os jogos que vocês dois querem jogar. Marquem alguns e a gente escolhe um.</p>
      </EmptyPage>
    )
  }
  return <DrawView games={games} tags={tags} initialMode={viewer?.prefs.drawMode ?? 'fila'} />
}
