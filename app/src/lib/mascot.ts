'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { MASCOTS, type MascotId } from '@/components/Mascot'
import { setMascot } from '@/app/actions/games'
import { useMember } from '@/lib/member'
import { defaultMascot } from '@/lib/people'

const KEY = 'dm-mascot'
const listeners = new Set<() => void>()
/** The pick that is still on its way to the member's row; shown at once so the header never lags. */
let pending: MascotId | null = null

const valid = (v: unknown): v is MascotId => MASCOTS.some((m) => m.id === v)

function readLocal(): MascotId | null {
  try {
    const v = localStorage.getItem(KEY)
    return valid(v) ? v : null
  } catch {
    return null
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) fn() }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('storage', onStorage)
  }
}

const notify = () => listeners.forEach((fn) => fn())

/**
 * The choice lives on the member's row, so it follows each person to every device.
 * The browser keeps a copy as a fallback (signed out, offline, or before the first save).
 */
export function useMascot() {
  const member = useMember()
  const local = useSyncExternalStore(subscribe, readLocal, () => null)
  const pick = useSyncExternalStore(subscribe, () => pending, () => null)
  const id = pick ?? member?.mascot ?? local ?? defaultMascot(member?.slot ?? 1)

  const setId = useCallback((next: MascotId) => {
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* storage unavailable: the row still keeps it */
    }
    pending = next
    notify()
    void setMascot(next).then(() => { pending = null; notify() }, () => { pending = null; notify() })
  }, [])
  return { id, setId }
}

/** A choice made before it lived on the row (this device only) is saved to the row once. */
export function useMascotSync() {
  const member = useMember()
  const hasRow = !!member && member.mascot !== null
  const signedIn = !!member
  useEffect(() => {
    if (!signedIn || hasRow) return
    const local = readLocal()
    if (local) void setMascot(local)
  }, [signedIn, hasRow])
}
