import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { IconBack } from '@/components/icons'
import { Mark } from '@/components/Marks'
import { getViewer } from '@/lib/data/viewer'
import { initialOf } from '@/lib/people'

export const metadata: Metadata = { title: 'Perfil do outro sócio' }

/** The other member's profile, read-only: each one changes only their own. `id` is the person, as in the prototype. */
export default async function PartnerProfile({ params }: PageProps<'/perfil/[id]'>) {
  const { id } = await params
  const viewer = await getViewer()
  if (!viewer) return null
  if (id === viewer.me.person) redirect('/perfil')
  const partner = viewer.partner
  if (!partner || id !== partner.person) notFound()

  return (
    <div className="page profile" data-person={partner.person}>
      <Link className="backbtn" href="/nos"><IconBack size={20} />Nós</Link>
      <header className="profile-head">
        <Mark person={partner.person} size={96} named={false} />
        <div>
          <h1 className="h1">Perfil de {partner.name}</h1>
          <p className="quiet">{partner.name}, inicial {initialOf(partner.person)}. Só {partner.person === 'maellen' ? 'a Maellen muda o dela' : 'o Danilo muda o dele'}.</p>
        </div>
      </header>
      <p className="profile-other">
        <Link className="btn btn--plain" href="/perfil">Abrir o meu perfil</Link>
      </p>
    </div>
  )
}
