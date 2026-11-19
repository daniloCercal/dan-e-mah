/**
 * Shared by the root layout (server) and lib/theme.ts (client). No 'use client' here:
 * the layout needs the actual string, not a client reference.
 */
export const THEME_KEY = 'dan-mah:tema'

/** Page colours, also used for the browser's theme-color. Keep in step with --bg in the CSS. */
export const THEME_COLORS = { light: '#efecf7', dark: '#1a1326' } as const

/**
 * Runs in <head> before the body is parsed, so the first paint already has the right theme.
 * Kept tiny and dependency-free on purpose. Any failure (storage blocked) falls back to the device setting.
 */
export function themeScript(account: 'light' | 'dark' | null): string {
  // The account's choice (set on any device) wins and is mirrored into localStorage, which lib/theme.ts reads.
  return `(function(){var a=${JSON.stringify(account)},c=null;try{if(a)localStorage.setItem('${THEME_KEY}',a);c=localStorage.getItem('${THEME_KEY}')}catch(e){}c=a||c;var d=c==='dark'||(c!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-b-theme',d?'dark':'light')})()`
}
