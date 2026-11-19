import type { Metadata } from 'next'
import Link from 'next/link'
import { Dead } from '@/components/States'

export const metadata: Metadata = { title: 'Página não encontrada' }

export default function NotFound() {
  return (
    <Dead
      title="Essa página não existe"
      actions={
        <>
          <Link className="btn btn--both" href="/">Ir para o início</Link>
          <Link className="btn" href="/biblioteca">Abrir a biblioteca</Link>
        </>
      }
    >
      <p>O endereço pode ter sido digitado errado, ou a página mudou de lugar.</p>
    </Dead>
  )
}
