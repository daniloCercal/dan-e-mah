import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyPage } from '@/components/States'

export const metadata: Metadata = { title: 'Adicionar jogo' }

export default function AddGame() {
  return (
    <EmptyPage
      title="Adicionar jogo"
      heading="A busca de jogos ainda não está ligada"
      actions={<Link className="btn" href="/biblioteca">Abrir a biblioteca</Link>}
    >
      <p>Aqui vocês vão procurar um jogo pelo nome ou cadastrar do seu jeito, com capa e link da loja.</p>
    </EmptyPage>
  )
}
