import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyPage } from '@/components/States'

export const metadata: Metadata = { title: 'Diário' }

export default function Diary() {
  return (
    <EmptyPage
      title="Diário"
      heading="Nenhuma sessão registrada"
      actions={<Link className="btn" href="/biblioteca">Abrir a biblioteca</Link>}
    >
      <p>Depois de jogar, registrem a sessão: quanto tempo durou, quem estava e o que aconteceu de bom.</p>
    </EmptyPage>
  )
}
