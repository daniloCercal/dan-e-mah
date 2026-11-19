'use client'

import { useCallback, useRef, useState } from 'react'

/** Tracks one save at a time: pending while it runs, failed (with a message) when it did not go through. */
export function useSave() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const last = useRef<(() => Promise<{ ok: boolean; error?: string }>) | null>(null)

  const run = useCallback(async <T extends { ok: boolean; error?: string }>(fn: () => Promise<T>): Promise<T | null> => {
    last.current = fn
    setPending(true)
    setError(null)
    try {
      const res = await fn()
      if (!res.ok) setError(res.error ?? 'Não deu para salvar.')
      return res
    } catch {
      setError('Sem conexão com o servidor. Confira a conexão e tente de novo.')
      return null
    } finally {
      setPending(false)
    }
  }, [])

  const retry = useCallback(() => { if (last.current) void run(last.current) }, [run])
  return { pending, failed: error !== null, error, run, retry }
}
