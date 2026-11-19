import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Simulated latency for the prototype, so waiting states can be seen.
 * `?lento=0` makes everything instant, `?lento=1` forces the slow profile; without the
 * query the switch in /b/nos (localStorage) picks between normal and slow.
 * `?falha=1` / `?falha=0` do the same for the "save fails" switch.
 */
export type WaitKind = 'page' | 'search' | 'save'
type Profile = 'instant' | 'normal' | 'slow'

const delays: Record<Profile, Record<WaitKind, number>> = {
  instant: { page: 0, search: 0, save: 0 },
  // The page delay stays under half a second so a page is settled soon after its first paint.
  normal: { page: 420, search: 400, save: 600 },
  slow: { page: 3200, search: 2200, save: 2400 },
}

const SLOW_KEY = 'b:lento'
const FAIL_KEY = 'b:falha-salvar'
const overrides: { lento?: string; falha?: string } = {}

let seenSearch: string | null = null

function readQuery() {
  // Each address is read once, so a switch flipped later is not undone by the same query string.
  if (seenSearch === window.location.search) return
  seenSearch = window.location.search
  const q = new URLSearchParams(seenSearch)
  const lento = q.get('lento')
  const falha = q.get('falha')
  if (lento === '0' || lento === '1') overrides.lento = lento
  if (falha === '0' || falha === '1') overrides.falha = falha
}

function stored(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function store(key: string, on: boolean) {
  try {
    localStorage.setItem(key, on ? '1' : '0')
  } catch {
    /* storage unavailable: the switch only lasts for this visit */
  }
}

const memory: Record<string, boolean | undefined> = {}

function profile(): Profile {
  readQuery()
  if (overrides.lento === '0') return 'instant'
  if (overrides.lento === '1') return 'slow'
  return (memory[SLOW_KEY] ?? stored(SLOW_KEY)) ? 'slow' : 'normal'
}

export function savesFail(): boolean {
  readQuery()
  if (overrides.falha) return overrides.falha === '1'
  return memory[FAIL_KEY] ?? stored(FAIL_KEY)
}

export function delayFor(kind: WaitKind): number {
  return delays[profile()][kind]
}

export function wait(kind: WaitKind): Promise<void> {
  const ms = delayFor(kind)
  return ms ? new Promise((resolve) => window.setTimeout(resolve, ms)) : Promise.resolve()
}

/** Stands in for a write to the server. Rejects when the "save fails" switch is on. */
export async function save(): Promise<void> {
  await wait('save')
  if (savesFail()) throw new Error('simulated save failure')
}

function useSwitch(key: string, override: 'lento' | 'falha'): [boolean, (on: boolean) => void, boolean] {
  readQuery()
  const [on, setOn] = useState(() => memory[key] ?? stored(key))
  const set = useCallback((next: boolean) => {
    memory[key] = next
    store(key, next)
    delete overrides[override]
    setOn(next)
  }, [key, override])
  return [on, set, overrides[override] !== undefined]
}

/** [value, setter, overriddenByQuery] */
export const useSlowSwitch = () => useSwitch(SLOW_KEY, 'lento')
export const useFailSwitch = () => useSwitch(FAIL_KEY, 'falha')

const loaded = new Set<string>()
const isReady = (key: string) => loaded.has(key) || delayFor('page') === 0

/** False while the first load of `key` is "in flight". Later visits are instant, like cached data. */
export function useLoaded(key: string): boolean {
  const [state, setState] = useState(() => ({ key, ready: isReady(key) }))
  useEffect(() => {
    if (isReady(key)) {
      loaded.add(key)
      setState({ key, ready: true })
      return
    }
    setState({ key, ready: false })
    const t = window.setTimeout(() => {
      loaded.add(key)
      setState({ key, ready: true })
    }, delayFor('page'))
    return () => window.clearTimeout(t)
  }, [key])
  return state.key === key ? state.ready : isReady(key)
}

/** Drop the ?lento / ?falha overrides of this visit (the switches in Nós apply again). */
export function resetOverrides() {
  delete overrides.lento
  delete overrides.falha
  seenSearch = window.location.search
}

/** Forget what was loaded, so the skeletons can be replayed from the style page. */
export function forgetLoaded() {
  loaded.clear()
}

/** Pending / failed state around a simulated save. The commit only runs when the save succeeds. */
export function useSave() {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const last = useRef<(() => void) | null>(null)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const run = useCallback(async (commit: () => void) => {
    last.current = commit
    setFailed(false)
    setPending(true)
    try {
      await save()
      if (!alive.current) return
      setPending(false)
      commit()
    } catch {
      if (!alive.current) return
      setPending(false)
      setFailed(true)
    }
  }, [])
  const retry = useCallback(() => {
    if (last.current) void run(last.current)
  }, [run])
  const dismiss = useCallback(() => setFailed(false), [])
  return { pending, failed, run, retry, dismiss }
}
