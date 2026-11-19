import type { Metadata } from 'next'
import Link from 'next/link'
import { GoogleG } from '@/components/icons'

export const metadata: Metadata = { title: 'Entrar' }

/** The door: the mark, the name, one way in. Outside the shell (no header, no tab bar). */
export default function SignIn() {
  return (
    <div className="door door--enter">
      {/* Each circle slides in from its side; the shared lens appears once they meet. */}
      <svg className="door-mark door-mark--enter" width="176" height="111" viewBox="0 0 76 48" aria-hidden="true">
        <g className="door-d"><circle cx="26" cy="24" r="20" className="pg-d" /></g>
        <g className="door-m"><circle cx="50" cy="24" r="20" className="pg-m" /></g>
        <path d="M38 8a20 20 0 0 1 0 32 20 20 0 0 1 0-32Z" className="pg-both door-both" />
        <g className="door-d"><circle cx="26" cy="24" r="20" className="ov-line" /></g>
        <g className="door-m"><circle cx="50" cy="24" r="20" className="ov-line" /></g>
      </svg>
      <div className="door-body">
        <h1 className="door-name">Dan & Mah</h1>
        <p className="door-line">Os jogos que a gente jogou, está jogando e ainda quer jogar.</p>
        {/* Stage 2 turns this into the Google sign-in; for now it opens the club. */}
        <Link className="btn btn--big door-btn" href="/">
          <GoogleG />
          Entrar com Google
        </Link>
        <p className="quiet door-note">Este clube tem exatamente dois sócios. Só as contas deles entram.</p>
      </div>
    </div>
  )
}
