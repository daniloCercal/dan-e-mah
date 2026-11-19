import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Sem acesso' }

/** What a Google account that is not one of the two members sees. Outside the shell, like the door. */
export default function NoAccess() {
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
        <Link className="btn btn--both btn--big" href="/entrar">Sair e tentar com outra conta</Link>
      </div>
    </div>
  )
}
