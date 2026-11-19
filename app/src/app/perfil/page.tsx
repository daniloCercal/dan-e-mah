import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { IconBack } from '@/components/icons'
import { Mark } from '@/components/Marks'
import { MascotPicker } from '@/components/MascotPicker'
import { getViewer } from '@/lib/data/viewer'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './ProfileForm'
import { ThemePicker } from './ThemePicker'
import { WallpaperPicker } from './WallpaperPicker'

export const metadata: Metadata = { title: 'Seu perfil' }

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/entrar')
}

export default async function Profile() {
  const viewer = await getViewer()
  if (!viewer) return null
  const { me, partner, prefs } = viewer

  return (
    <div className="page profile" data-person={me.person}>
      <Link className="backbtn" href="/nos"><IconBack size={20} />Nós</Link>
      <header className="profile-head">
        <Mark person={me.person} size={96} named={false} />
        <div>
          <h1 className="h1">Seu perfil</h1>
          <p className="quiet">{me.name}. Só você muda o que está aqui.</p>
        </div>
      </header>

      <ProfileForm
        person={me.person} name={me.name} hasPhoto={!!me.photoPath} nicknames={me.nicknames} useNicknames={me.useNicknames}
      />

      <ThemePicker />
      <WallpaperPicker initial={prefs.wallpaper} />
      <MascotPicker />

      <section className="sec" aria-labelledby="h-exportar">
        <h2 className="h2" id="h-exportar">Exportar tudo</h2>
        <p className="quiet">Uma cópia de tudo o que o clube guardou: jogos, notas, sessões e tags. Serve de backup. Com a nota às cegas ligada, a nota do outro só vem se você já tiver dado a sua.</p>
        <ul className="export-list">
          <li><a className="btn btn--plain" href="/api/exportar?formato=json" download>Tudo, em JSON</a></li>
          <li><a className="btn btn--plain" href="/api/exportar?formato=jogos" download>Jogos, em planilha (CSV)</a></li>
          <li><a className="btn btn--plain" href="/api/exportar?formato=diario" download>Diário, em planilha (CSV)</a></li>
        </ul>
      </section>

      {partner && (
        <p className="profile-partner">
          <Link className="member-link" href={`/perfil/${partner.person}`} data-person={partner.person}>
            <Mark person={partner.person} size={36} named={false} />
            Ver o perfil de {partner.name}
          </Link>
        </p>
      )}

      <form action={signOut} className="profile-exit">
        <button className="btn" type="submit">Sair</button>
      </form>
    </div>
  )
}
