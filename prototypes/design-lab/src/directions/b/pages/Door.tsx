import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { B } from '../store'
import { wait } from '../lib/latency'
import { SaveButton } from '../components/States'
import logoSvg from '../assets/logo.svg?raw'

/** Standard four-colour Google "G". */
function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export function SignIn() {
  const navigate = useNavigate()
  const [enter, setEnter] = useState(true)
  const [pending, setPending] = useState(false)

  // The entrance is over in under a second; any tap or key ends it at once.
  useEffect(() => {
    const t = window.setTimeout(() => setEnter(false), 900)
    const skip = () => setEnter(false)
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [])

  const signIn = async () => {
    setPending(true)
    await wait('save')
    navigate(B)
  }

  return (
    <div className={enter ? 'door door--enter' : 'door'}>
      {/* The logo is inlined so its lettering uses the web font; the SVG carries its own accessible name. */}
      <h1 className="door-logo" dangerouslySetInnerHTML={{ __html: logoSvg }} />
      <div className="door-body">
        <p className="door-line">Os jogos que a gente jogou, está jogando e ainda quer jogar.</p>
        <SaveButton
          type="button" className="btn btn--big door-btn" pending={pending} pendingLabel="Entrando" onClick={() => void signIn()}
          label={<><GoogleG />Entrar com Google</>}
        />
        <p className="quiet door-note">Este clube tem exatamente dois sócios. Só as contas deles entram.</p>
      </div>
      {pending && <p className="sr-only" role="status">Entrando</p>}
    </div>
  )
}

export function NoAccess() {
  return (
    <div className="door door--closed">
      <svg className="door-mark" width="210" height="96" viewBox="0 0 105 48" aria-hidden="true">
        <circle cx="26" cy="24" r="20" className="pg-d" />
        <circle cx="50" cy="24" r="20" className="pg-m" />
        <path d="M38 8a20 20 0 0 1 0 32 20 20 0 0 1 0-32Z" className="pg-both" />
        <circle cx="26" cy="24" r="20" className="ov-line" />
        <circle cx="50" cy="24" r="20" className="ov-line" />
        <circle cx="90" cy="24" r="13" className="ov-off" />
        <circle cx="90" cy="24" r="13" className="ov-line ov-dash" />
      </svg>
      <div className="door-body">
        <h1 className="door-title">Esta conta não faz parte do clube</h1>
        <p className="door-line">
          O Dan & Mah é fechado para duas pessoas, e a conta com que você entrou não é de nenhuma delas. Se você é uma delas, deve ter entrado com outra conta do Google.
        </p>
        <Link className="btn btn--both btn--big" to={`${B}/entrar`}>Sair e tentar com outra conta</Link>
      </div>
    </div>
  )
}
