'use client'

import { useTheme } from '@/lib/theme'

/** Sun when it is dark (tap for light), moon when it is light (tap for dark). */
export function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button type="button" className="iconbtn theme-toggle" onClick={toggle} aria-pressed={dark} aria-label="Modo escuro">
      <svg
        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  )
}
