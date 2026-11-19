'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { MascotId } from '@/components/Mascot'
import type { Person, Slot } from '@/lib/people'

export interface MemberInfo {
  slot: Slot
  person: Person
  name: string
  mascot: MascotId | null
  partnerName: string | null
}

const Ctx = createContext<MemberInfo | null>(null)

/** The signed-in member, read on the server in the root layout; null on the door page. */
export function MemberProvider({ member, children }: { member: MemberInfo | null; children: ReactNode }) {
  return <Ctx value={member}>{children}</Ctx>
}

export const useMember = () => useContext(Ctx)
