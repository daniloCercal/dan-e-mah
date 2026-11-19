import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { people, type PersonId } from '../../../data/games'
import { usePrefersReducedMotion } from '../../../lib/viewer'

/** What each person can personalise, kept in memory and in localStorage so real photos can be tried. */
interface Stored {
  photos: Partial<Record<PersonId, string>>
  names: Partial<Record<PersonId, string>>
  useNicknames: boolean
  decorative: boolean
}

interface Profile extends Stored {
  setPhoto: (person: PersonId, dataUrl: string | undefined) => void
  setName: (person: PersonId, name: string) => void
  setUseNicknames: (on: boolean) => void
  setDecorative: (on: boolean) => void
}

const KEY = 'b:perfil'
const defaults: Stored = { photos: {}, names: {}, useNicknames: true, decorative: true }

function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<Stored>) } : defaults
  } catch {
    return defaults
  }
}

// Mirrors of the current values for code that runs outside React (labels, transitions, the burst).
let currentNames: Partial<Record<PersonId, string>> = {}
let calm = false

/** Display name of a person: the one set in the profile, or the default. */
export function nameOf(person: PersonId): string {
  return currentNames[person]?.trim() || people[person].name
}

/** True when movement should be skipped: the OS asks for it or "animações decorativas" is off. */
export function isCalm(): boolean {
  return calm || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const Ctx = createContext<Profile | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(read)
  currentNames = state.names
  calm = !state.decorative

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage full or unavailable: the profile only lasts for this visit */
    }
  }, [state])

  const setPhoto = useCallback((person: PersonId, dataUrl: string | undefined) => {
    setState((s) => ({ ...s, photos: { ...s.photos, [person]: dataUrl } }))
  }, [])
  const setName = useCallback((person: PersonId, name: string) => {
    setState((s) => ({ ...s, names: { ...s.names, [person]: name } }))
  }, [])
  const setUseNicknames = useCallback((on: boolean) => setState((s) => ({ ...s, useNicknames: on })), [])
  const setDecorative = useCallback((on: boolean) => setState((s) => ({ ...s, decorative: on })), [])

  const value = useMemo<Profile>(
    () => ({ ...state, setPhoto, setName, setUseNicknames, setDecorative }),
    [state, setPhoto, setName, setUseNicknames, setDecorative],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useProfile(): Profile {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider')
  return ctx
}

/** Reduced motion from the OS or from the product's own switch. */
export function useCalm(): boolean {
  const reduced = usePrefersReducedMotion()
  const { decorative } = useProfile()
  return reduced || !decorative
}
