import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { test as base, expect, type Browser, type BrowserContext, type Page } from '@playwright/test'

/*
 * The two test accounts are real sign-ins of the mah-dev project, taken from the environment. Nothing in the app
 * knows about tests: the cookies are the ones the app itself sets after a Google sign-in.
 *   E2E_SUPABASE_URL, E2E_SUPABASE_KEY (publishable key)
 *   E2E_DAN_EMAIL, E2E_DAN_PASSWORD, E2E_MAH_EMAIL, E2E_MAH_PASSWORD
 */
export type Who = 'dan' | 'mah'

function env(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Defina ${name} (veja o README).`)
  return v
}

export interface Session { access_token: string; refresh_token: string; expires_in: number; token_type: string; user: unknown }

export async function signIn(who: Who): Promise<Session> {
  const res = await fetch(`${env('E2E_SUPABASE_URL')}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: env('E2E_SUPABASE_KEY'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env(`E2E_${who.toUpperCase()}_EMAIL`), password: env(`E2E_${who.toUpperCase()}_PASSWORD`) }),
  })
  if (!res.ok) throw new Error(`Login de teste falhou (${res.status}).`)
  return (await res.json()) as Session
}

/** Cookies in the format @supabase/ssr reads: base64url JSON, split in chunks of 3180 characters. */
export function sessionCookies(session: Session, baseURL: string) {
  const ref = new URL(env('E2E_SUPABASE_URL')).hostname.split('.')[0]
  const name = `sb-${ref}-auth-token`
  const value = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url')
  const parts = value.length <= 3180 ? [value] : Array.from({ length: Math.ceil(value.length / 3180) }, (_, i) => value.slice(i * 3180, (i + 1) * 3180))
  const url = new URL(baseURL)
  return parts.map((v, i) => ({
    name: parts.length === 1 ? name : `${name}.${i}`, value: v, domain: url.hostname, path: '/',
    httpOnly: false, secure: url.protocol === 'https:', sameSite: 'Lax' as const,
  }))
}

/** Direct database access as that member (row level security applies), for set-up and clean-up. */
export async function api(who: Who): Promise<SupabaseClient> {
  const session = await signIn(who)
  const client = createClient(env('E2E_SUPABASE_URL'), env('E2E_SUPABASE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } })
  await client.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token })
  return client
}

/** Back to a known state: theme follows the device, no wallpaper. */
export async function resetPrefs(who: Who) {
  const db = await api(who)
  const { data: { user } } = await db.auth.getUser()
  const { data } = await db.from('members').select('prefs').eq('user_id', user!.id).single()
  const prefs = { ...((data?.prefs ?? {}) as Record<string, unknown>) }
  delete prefs.theme
  delete prefs.wallpaper
  delete prefs.decorative
  await db.from('members').update({ prefs }).eq('user_id', user!.id)
}

export async function memberContext(browser: Browser, who: Who, baseURL: string, options: Parameters<Browser['newContext']>[0] = {}): Promise<BrowserContext> {
  const ctx = await browser.newContext({ baseURL, ...options })
  await ctx.addCookies(sessionCookies(await signIn(who), baseURL))
  return ctx
}

export const test = base.extend<{ dan: Page; mah: Page }>({
  dan: async ({ browser, baseURL }, use) => {
    const ctx = await memberContext(browser, 'dan', baseURL!)
    await use(await ctx.newPage())
    await ctx.close()
  },
  mah: async ({ browser, baseURL }, use) => {
    const ctx = await memberContext(browser, 'mah', baseURL!)
    await use(await ctx.newPage())
    await ctx.close()
  },
})
export { expect }

/** Pages visited by the accessibility and screenshot passes. */
export async function pagesToVisit(): Promise<string[]> {
  const db = await api('dan')
  const { data } = await db.from('games').select('id').is('removed_at', null).order('id').limit(1)
  return ['/', '/biblioteca', '/diario', '/nos', '/perfil', '/adicionar', '/sortear', ...(data?.[0] ? [`/jogo/${data[0].id}`] : [])]
}
