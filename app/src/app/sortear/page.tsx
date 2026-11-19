import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyPage } from '@/components/States'

export const metadata: Metadata = { title: 'Sortear' }

export default function Draw() {
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
