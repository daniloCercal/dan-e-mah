import { useCallback, useSyncExternalStore } from 'react'

/**
 * Light / dark theme. Follows the device until the person picks one; the choice is kept in localStorage.
 * The theme is a `data-b-theme` attribute on <html>, set before the first render so the page never flashes.
 */
type Choice = 'light' | 'dark' | null

const KEY = 'dan-mah:tema'
const listeners = new Set<() => void>()
const system = window.matchMedia('(prefers-color-scheme: dark)')

function readChoice(): Choice {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

let choice: Choice = readChoice()
// `?tema=escuro` / `?tema=claro` force the theme for this visit only; the saved choice is left alone.
let forced: Choice = null
let seenSearch: string | null = null

function readForced() {
  if (seenSearch === window.location.search) return
  seenSearch = window.location.search
  const v = new URLSearchParams(seenSearch).get('tema')
  if (v === 'escuro') forced = 'dark'
  else if (v === 'claro') forced = 'light'
}
readForced()

function isDark(): boolean {
  const pick = forced ?? choice
  return pick ? pick === 'dark' : system.matches
}

function apply() {
  document.documentElement.setAttribute('data-b-theme', isDark() ? 'dark' : 'light')
  listeners.forEach((fn) => fn())
}

system.addEventListener('change', apply)
apply()

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** Called on every route change, so a link carrying `?tema=` takes effect without a reload. */
export function syncThemeFromQuery() {
  const before = forced
  readForced()
  if (forced !== before) apply()
}

/** Drops the per-visit override; the saved choice (or the device) applies again. */
export function clearForcedTheme() {
  if (!forced) return
  forced = null
  seenSearch = window.location.search
  apply()
}

export function setDark(dark: boolean) {
  forced = null
  choice = dark ? 'dark' : 'light'
  try {
    localStorage.setItem(KEY, choice)
  } catch {
    /* storage unavailable: the choice lasts for this visit only */
  }
  apply()
}

export function useTheme() {
  const dark = useSyncExternalStore(subscribe, isDark)
  const toggle = useCallback(() => setDark(!isDark()), [])
  return { dark, setDark, toggle }
}
