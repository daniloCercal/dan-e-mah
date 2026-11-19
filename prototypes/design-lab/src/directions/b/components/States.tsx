import { Component, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { B } from '../store'
import { Loader } from './Loading'

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

export function OfflineBanner({ force = false }: { force?: boolean }) {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  const show = force || !online
  return (
    <div role="status" className={show ? 'offline' : 'sr-only'}>
      {show && (
        <>
          <span className="offline-dot" aria-hidden="true" />
          <p><strong>Sem conexão.</strong> O que já carregou continua aqui. Para salvar, espere a conexão voltar.</p>
        </>
      )}
    </div>
  )
}

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

export function NotFound() {
  return (
    <Dead
      title="Essa página não existe"
      actions={
        <>
          <Link className="btn btn--both" to={B}>Ir para o início</Link>
          <Link className="btn btn--plain" to={`${B}/biblioteca`}>Abrir a biblioteca</Link>
        </>
      }
    >
      <p>O endereço pode ter sido digitado errado, ou a página mudou de lugar.</p>
    </Dead>
  )
}

export function GameNotFound() {
  return (
    <Dead
      title="Não achamos esse jogo"
      actions={
        <>
          <Link className="btn btn--both" to={`${B}/biblioteca`}>Abrir a biblioteca</Link>
          <Link className="btn btn--plain" to={`${B}/adicionar`}>Adicionar jogo</Link>
        </>
      }
    >
      <p>Ele pode ter sido removido da biblioteca, ou o link está incompleto.</p>
    </Dead>
  )
}

export function Crash() {
  return (
    <Dead
      title="Algo quebrou nesta tela"
      actions={
        <>
          <button type="button" className="btn btn--both" onClick={() => window.location.reload()}>Recarregar</button>
          <a className="btn btn--plain" href={B}>Ir para o início</a>
        </>
      }
    >
      <p>Foi um erro do aplicativo, não seu. O que já estava salvo continua salvo. Recarregar costuma resolver.</p>
    </Dead>
  )
}

interface BoundaryProps { children: ReactNode; resetKey: string }
interface BoundaryState { failed: boolean; key: string }

export class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false, key: this.props.resetKey }

  static getDerivedStateFromError(): Partial<BoundaryState> {
    return { failed: true }
  }

  static getDerivedStateFromProps(props: BoundaryProps, state: BoundaryState): Partial<BoundaryState> | null {
    // Moving to another route clears the error.
    return props.resetKey !== state.key ? { failed: false, key: props.resetKey } : null
  }

  render() {
    return this.state.failed ? <Crash /> : this.props.children
  }
}
