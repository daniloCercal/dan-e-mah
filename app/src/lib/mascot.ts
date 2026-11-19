'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { DEFAULT_MASCOT, MASCOTS, type MascotId } from '@/components/Mascot'

const KEY = 'dm-mascot'
const listeners = new Set<() => void>()

function read(): MascotId {
  try {
    const v = localStorage.getItem(KEY)
    return MASCOTS.some((m) => m.id === v) ? (v as MascotId) : DEFAULT_MASCOT
  } catch {
    return DEFAULT_MASCOT
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

/** Per device for now; once sign-in exists the choice moves to the member's own row so it follows each person. */
export function useMascot() {
  const id = useSyncExternalStore(subscribe, read, () => DEFAULT_MASCOT)
  const setId = useCallback((next: MascotId) => {
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* storage unavailable: the choice is lost on reload */
    }
    listeners.forEach((fn) => fn())
  }, [])
  return { id, setId }
}
