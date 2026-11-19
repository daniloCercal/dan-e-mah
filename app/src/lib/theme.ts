'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { THEME_COLORS, THEME_KEY } from './theme-script'

/**
 * Light / dark theme. Follows the device until the person picks one; the choice is kept in localStorage.
 * The theme is a `data-b-theme` attribute on <html>. The inline script in the root layout
 * (`themeScript`) sets it before the first paint, so the page never flashes; this module keeps it in sync after.
 */
type Choice = 'light' | 'dark'

const listeners = new Set<() => void>()

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function systemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function isDark(): boolean {
  return document.documentElement.getAttribute('data-b-theme') === 'dark'
}

function apply() {
  const choice = readChoice()
  const dark = choice ? choice === 'dark' : systemDark()
  document.documentElement.setAttribute('data-b-theme', dark ? 'dark' : 'light')
  // The theme-color metas are written per device scheme; once a theme is chosen they must follow it instead.
  const color = dark ? THEME_COLORS.dark : THEME_COLORS.light
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', color))
  listeners.forEach((fn) => fn())
}

function onStorage(e: StorageEvent) {
  if (e.key === THEME_KEY) apply()
}

function subscribe(fn: () => void) {
  if (listeners.size === 0) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply)
    window.addEventListener('storage', onStorage)
    apply()
  }
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0) {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', apply)
      window.removeEventListener('storage', onStorage)
    }
  }
}

export function setDark(dark: boolean) {
  try {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  } catch {
    /* storage unavailable: the choice lasts for this visit only */
    document.documentElement.setAttribute('data-b-theme', dark ? 'dark' : 'light')
    listeners.forEach((fn) => fn())
    return
  }
  apply()
}

/** Picks light, dark, or null to follow the device again. */
export function setChoice(choice: Choice | null) {
  if (choice) return setDark(choice === 'dark')
  try {
    localStorage.removeItem(THEME_KEY)
  } catch {
    /* storage unavailable: nothing to clear */
  }
  apply()
}

/** The stored choice, null while following the device. */
export function useThemeChoice(): Choice | null {
  return useSyncExternalStore(subscribe, readChoice, () => null)
}

/** `dark` is false during server render and hydration, then the real value. */
export function useTheme() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false)
  const toggle = useCallback(() => setDark(!isDark()), [])
  return { dark, setDark, toggle }
}
