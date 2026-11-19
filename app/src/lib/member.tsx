'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { MascotId } from '@/components/Mascot'
import { defaultName, type Person, type Slot } from '@/lib/people'

export interface MemberInfo {
  slot: Slot
  person: Person
  name: string
  mascot: MascotId | null
  /** False when this member turned the decorative animations off. */
  decorative: boolean
  partnerName: string | null
  /** Both members' names and (signed) photo addresses, for avatars and labels anywhere. */
  names: Record<Person, string>
  photos: Record<Person, string | null>
}

const Ctx = createContext<MemberInfo | null>(null)

/** The signed-in member, read on the server in the root layout; null on the door page. */
export function MemberProvider({ member, children }: { member: MemberInfo | null; children: ReactNode }) {
  return <Ctx value={member}>{children}</Ctx>
}

export const useMember = () => useContext(Ctx)

/** The name a person goes by on screen (their profile name), falling back to the default one. */
export function usePersonName(person: Person): string {
  return useContext(Ctx)?.names[person] ?? defaultName(person)
}

export function useNameOf(): (person: Person) => string {
  const m = useContext(Ctx)
  return (person) => m?.names[person] ?? defaultName(person)
}
