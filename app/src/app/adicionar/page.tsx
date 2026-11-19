import type { Metadata } from 'next'
import { AddGame } from './AddGame'

export const metadata: Metadata = { title: 'Adicionar jogo' }

export default async function AddGamePage({ searchParams }: PageProps<'/adicionar'>) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 100) : ''
  return <AddGame initialQuery={q} startManual={sp.manual === '1'} />
}
