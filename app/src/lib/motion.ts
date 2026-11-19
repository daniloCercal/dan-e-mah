'use client'

import { useReducedMotion } from 'motion/react'

/**
 * True when movement should be skipped. For now only the OS "reduce motion" setting;
 * the product's own "animações decorativas" switch (stage 9) joins it here.
 */
export function useCalm(): boolean {
  return useReducedMotion() ?? false
}
