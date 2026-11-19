import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { EmptyPage } from '@/components/States'
import { MascotPicker } from '@/components/MascotPicker'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Seu perfil' }

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/entrar')
}

export default async function Profile() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = typeof data?.claims?.email === 'string' ? data.claims.email : null

  return (
    <>
      <EmptyPage
        title="Seu perfil"
        heading={email ?? 'Você'}
        actions={
          <form action={signOut}>
            <button className="btn" type="submit">Sair</button>
          </form>
        }
      >
        <p>Foto, nome, apelido, tema e papel de parede ficam aqui, guardados na sua conta.</p>
      </EmptyPage>
      <MascotPicker />
    </>
  )
}
