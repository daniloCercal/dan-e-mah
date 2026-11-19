'use client'

import { useReducedMotion } from 'motion/react'
import { useMember } from '@/lib/member'

/** True when movement should be skipped: the OS "reduce motion" setting or the member's own "animações decorativas" switch. */
export function useCalm(): boolean {
  const reduced = useReducedMotion() ?? false
  const member = useMember()
  return reduced || member?.decorative === false
}

/** The same rule for code that runs outside React (view transitions); the switch is mirrored on <html>. */
export function isCalm(): boolean {
  return document.documentElement.hasAttribute('data-calm') || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
