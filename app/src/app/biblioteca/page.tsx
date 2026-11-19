import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyPage } from '@/components/States'

export const metadata: Metadata = { title: 'Biblioteca' }

export default function Library() {
  return (
    <EmptyPage
      title="Biblioteca"
      heading="Nenhum jogo por aqui ainda"
      actions={<Link className="btn btn--both" href="/adicionar">Adicionar jogo</Link>}
    >
      <p>Tudo o que vocês jogaram, estão jogando e querem jogar fica nesta estante, com busca e filtros.</p>
    </EmptyPage>
  )
}
