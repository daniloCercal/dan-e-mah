import type { ReactNode } from 'react'

function Icon({ children, size = 24 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      {children}
    </svg>
  )
}

type P = { size?: number }

export const IconHome = (p: P) => <Icon {...p}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></Icon>
export const IconLibrary = (p: P) => <Icon {...p}><rect x="4" y="4" width="6" height="16" rx="1.5" /><rect x="14" y="4" width="6" height="16" rx="1.5" /></Icon>
export const IconDiary = (p: P) => <Icon {...p}><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></Icon>
export const IconPlus = (p: P) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
export const IconSearch = (p: P) => <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></Icon>
export const IconGrid = (p: P) => <Icon {...p}><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></Icon>
export const IconList = (p: P) => <Icon {...p}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></Icon>
export const IconClose = (p: P) => <Icon {...p}><path d="m6 6 12 12M18 6 6 18" /></Icon>
export const IconFilter = (p: P) => <Icon {...p}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></Icon>
export const IconChevron = (p: P) => <Icon {...p}><path d="m7 10 5 5 5-5" /></Icon>
export const IconBack = (p: P) => <Icon {...p}><path d="M14.5 5 8 12l6.5 7" /></Icon>
export const IconCheck = (p: P) => <Icon {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>

/**
 * The brand mark: two circles and the part that belongs to both.
 * Danilo's teal, Maellen's raspberry, the mustard lens where they overlap, ink outlines.
 */
export function PairGlyph({ size = 24, title, className }: { size?: number; title?: string; className?: string }) {
  return (
    <svg
      className={className ? `pairglyph ${className}` : 'pairglyph'}
      width={(size * 40) / 26} height={size} viewBox="0 0 40 26"
      role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}
    >
      <circle cx="13" cy="13" r="11" className="pg-d" />
      <circle cx="27" cy="13" r="11" className="pg-m" />
      <path d="M20 4.5a11 11 0 0 1 0 17 11 11 0 0 1 0-17Z" className="pg-both" />
      <circle cx="13" cy="13" r="11" className="pg-line" />
      <circle cx="27" cy="13" r="11" className="pg-line" />
    </svg>
  )
}

/** Standard four-colour Google "G". */
export function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}
