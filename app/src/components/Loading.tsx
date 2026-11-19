import type { ReactNode } from 'react'
import { MascotMoment } from './MascotMoment'

/** The two circles drift apart and come back to overlap. Static under reduced motion. */
export function Loader({ size = 28 }: { size?: number }) {
  return (
    <svg className="loader" width={(size * 56) / 26} height={size} viewBox="0 0 56 26" aria-hidden="true">
      <g className="loader-d"><circle cx="21" cy="13" r="11" className="pg-d" /></g>
      <g className="loader-m"><circle cx="35" cy="13" r="11" className="pg-m" /></g>
      <path d="M28 4.5a11 11 0 0 1 0 17 11 11 0 0 1 0-17Z" className="pg-both loader-both" />
      <g className="loader-d"><circle cx="21" cy="13" r="11" className="pg-line" /></g>
      <g className="loader-m"><circle cx="35" cy="13" r="11" className="pg-line" /></g>
    </svg>
  )
}

/** The member's mascot waits while the page loads, with the label spoken once. */
export function PageLoader({ label, row = false }: { label: string; row?: boolean }) {
  return (
    <div className={row ? 'pageloader pageloader--row' : 'pageloader'} role="status">
      <MascotMoment moment="load" size={row ? 48 : 72} />
      <span>{label}</span>
    </div>
  )
}

/** Announces that a region is loading without reading every placeholder. */
export function Busy({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className ? `busy ${className}` : 'busy'} aria-busy="true">
      <span className="sr-only" role="status">{label}</span>
      <div aria-hidden="true" className="sk-group">{children}</div>
    </div>
  )
}

export const SkLine = ({ w = '60%', tall = false }: { w?: string; tall?: boolean }) => (
  <span className={tall ? 'sk sk-line sk-line--tall' : 'sk sk-line'} style={{ width: w }} />
)

export function SkCard() {
  return (
    <div className="gcard sk-card">
      <span className="sk sk-cover" />
      <SkLine w="80%" />
      <SkLine w="50%" />
    </div>
  )
}

export function SkRow() {
  return (
    <div className="row sk-row">
      <span className="sk sk-cover" />
      <span className="row-text">
        <SkLine w="55%" />
        <SkLine w="38%" />
      </span>
    </div>
  )
}

export function SkNow() {
  return (
    <div className="now sk-now">
      <span className="sk now-art" />
      <span className="sk sk-cover" />
      <span className="now-text">
        <SkLine w="48%" />
        <SkLine w="72%" tall />
        <SkLine w="90%" />
        <span className="sk sk-line sk-phone" style={{ width: '40%' }} />
        <span className="sk sk-pill" />
      </span>
    </div>
  )
}

export function SkBlock({ h }: { h: number }) {
  return <div className="sk sk-block" style={{ height: h }} />
}
