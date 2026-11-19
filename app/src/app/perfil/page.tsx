import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyPage } from '@/components/States'

export const metadata: Metadata = { title: 'Seu perfil' }

export default function Profile() {
  return (
    <EmptyPage
      title="Seu perfil"
      heading="Ninguém entrou ainda"
      actions={<Link className="btn btn--both" href="/entrar">Entrar</Link>}
    >
      <p>Foto, nome, apelido, tema e papel de parede ficam aqui, guardados na sua conta.</p>
    </EmptyPage>
  )
}
