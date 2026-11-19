import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyPage } from '@/components/States'

export const metadata: Metadata = { title: 'Nós' }

export default function Us() {
  return (
    <EmptyPage
      title="Nós"
      heading="A história da dupla começa aqui"
      actions={<Link className="btn btn--both" href="/adicionar">Adicionar jogo</Link>}
    >
      <p>Os jogos que os dois querem, quanto vocês jogaram juntos e onde as notas batem aparecem aqui.</p>
    </EmptyPage>
  )
}
