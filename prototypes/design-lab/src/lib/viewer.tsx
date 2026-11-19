import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { maellenNicknames, other, people, type PersonId } from '../data/games'

interface ViewerContext {
  viewer: PersonId
  partner: PersonId
  setViewer: (id: PersonId) => void
  /** Name to greet the viewer with — Maellen gets a rotating nickname. */
  greetingName: string
  greeting: string
}

const Ctx = createContext<ViewerContext | null>(null)

function read(): PersonId {
  try {
    return localStorage.getItem('viewer') === 'maellen' ? 'maellen' : 'danilo'
  } catch {
    return 'danilo'
  }
}

function partOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Prototype stand-in for the signed-in user: lets you switch between the two people. */
export function ViewerProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<PersonId>(read)
  // Picked once per visit so the nickname doesn't flicker between renders.
  const [nickname] = useState(() => maellenNicknames[Math.floor(Math.random() * maellenNicknames.length)])

  useEffect(() => {
    try {
      localStorage.setItem('viewer', viewer)
    } catch {
      /* storage unavailable — the choice just won't persist */
    }
  }, [viewer])

  const value = useMemo<ViewerContext>(() => {
    const greetingName = viewer === 'maellen' ? nickname : people.danilo.name
    return { viewer, partner: other(viewer), setViewer, greetingName, greeting: `${partOfDay()}, ${greetingName}` }
  }, [viewer, nickname])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useViewer(): ViewerContext {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useViewer must be used inside ViewerProvider')
  return ctx
}

/** True when the user asked the OS for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
