'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { IconClose } from './icons'

interface ToastItem { id: number; text: string; undo?: () => void }
interface Api { notify: (text: string, undo?: () => void) => void; dismiss: () => void; toast: ToastItem | null }

const Ctx = createContext<Api | null>(null)
let next = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null)
  const notify = useCallback((text: string, undo?: () => void) => setToast({ id: next++, text, undo }), [])
  const dismiss = useCallback(() => setToast(null), [])
  const api = useMemo(() => ({ notify, dismiss, toast }), [notify, dismiss, toast])
  return <Ctx value={api}>{children}</Ctx>
}

export function useToast() {
  const api = useContext(Ctx)
  if (!api) throw new Error('ToastProvider missing')
  return api
}

/** One message at the bottom, with an optional "Desfazer". Leaves by itself after a few seconds. */
export function ToastHost() {
  const { toast, dismiss } = useToast()
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(dismiss, toast.undo ? 8000 : 4000)
    return () => window.clearTimeout(t)
  }, [toast, dismiss])
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.text}</span>
          {toast.undo && (
            <button type="button" className="toast-undo" onClick={() => { toast.undo?.(); dismiss() }}>Desfazer</button>
          )}
          <button type="button" className="toast-x" onClick={dismiss} aria-label="Fechar aviso"><IconClose size={18} /></button>
        </div>
      )}
    </div>
  )
}
