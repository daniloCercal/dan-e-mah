import type { ReactNode } from 'react'
import { PairGlyph } from './icons'

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
