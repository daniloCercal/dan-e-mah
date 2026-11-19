import type { ReactNode } from 'react'
import { PairGlyph } from './icons'
import { Loader } from './Loading'

/** Shared layout for "nothing here" screens: the mark with both circles empty, a title, what to do. */
export function Dead({ title, children, actions }: { title: string; children: ReactNode; actions: ReactNode }) {
  return (
    <div className="page dead">
      <svg className="dead-mark" width="120" height="62" viewBox="0 0 100 52" aria-hidden="true">
        <circle cx="36" cy="26" r="20" className="ov-off" />
        <circle cx="64" cy="26" r="20" className="ov-off" />
        <circle cx="36" cy="26" r="20" className="ov-line ov-dash" />
        <circle cx="64" cy="26" r="20" className="ov-line ov-dash" />
      </svg>
      <h1 className="h1">{title}</h1>
      <div className="dead-text">{children}</div>
      <div className="dead-actions">{actions}</div>
    </div>
  )
}

/** A page that has nothing to show yet: its title, then the dashed box saying what will be here and what to do. */
export function EmptyPage({ title, heading, children, actions }: {
  title: string
  heading: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="page">
      <div className="lib-head">
        <h1 className="h1">{title}</h1>
      </div>
      <div className="empty">
        <PairGlyph size={36} />
        <h2 className="h2">{heading}</h2>
        <div className="body">{children}</div>
        {actions && <div className="empty-actions">{actions}</div>}
      </div>
    </div>
  )
}

interface SaveButtonProps {
  pending: boolean
  failed?: boolean
  label: ReactNode
  pendingLabel?: string
  className?: string
  type?: 'submit' | 'button'
  onClick?: () => void
}

/** Button that keeps its width while a save is pending. */
export function SaveButton({ pending, failed = false, label, pendingLabel = 'Salvando', className = 'btn btn--ink', type = 'submit', onClick }: SaveButtonProps) {
  return (
    <button type={type} className={`${className} savebtn`} disabled={pending} aria-busy={pending || undefined} onClick={onClick}>
      <span className="savebtn-face" data-hidden={pending || undefined} aria-hidden={pending}>{failed ? 'Tentar de novo' : label}</span>
      <span className="savebtn-face" data-hidden={!pending || undefined} aria-hidden={!pending}>
        <Loader size={16} />
        {pendingLabel}
      </span>
    </button>
  )
}

/** Inline failure for a save: says what happened, that nothing was lost, and what to do. */
export function SaveError({ children, onRetry }: { children?: ReactNode; onRetry?: () => void }) {
  return (
    <div className="alert" role="alert">
      <p>
        <strong>Não deu para salvar.</strong> {children ?? 'O que você preencheu continua aqui. Confira a conexão e tente de novo.'}
      </p>
      {onRetry && <button type="button" className="btn btn--plain btn--small" onClick={onRetry}>Tentar de novo</button>}
    </div>
  )
}
