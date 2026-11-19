'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GoogleG } from './icons'

export function GoogleSignIn() {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function go() {
    setBusy(true)
    setFailed(false)
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      setBusy(false)
      setFailed(true)
    }
  }

  return (
    <>
      <button type="button" className="btn btn--big door-btn" onClick={go} disabled={busy}>
        <GoogleG />
        {busy ? 'Abrindo o Google…' : 'Entrar com Google'}
      </button>
      {failed && <p className="quiet door-note" role="alert">Não deu para abrir o Google agora. Tente de novo.</p>}
    </>
  )
}
